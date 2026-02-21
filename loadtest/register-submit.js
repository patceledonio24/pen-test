import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const baseUrl = __ENV.TARGET_URL;
const authConfirmed = __ENV.CONFIRM_AUTHORIZATION === 'YES';
const vus = Number(__ENV.VUS || '1');
const duration = __ENV.DURATION || '30s';
const thinkTimeSeconds = Number(__ENV.THINK_TIME_SECONDS || '1');

const nextPageMarker = __ENV.NEXT_PAGE_MARKER || '';
const requireNextPage = __ENV.REQUIRE_NEXT_PAGE === 'YES';
const minPagesReached = Number(__ENV.MIN_PAGES_REACHED || '2');
const maxRedirectSteps = Number(__ENV.MAX_REDIRECT_STEPS || '5');

if (!baseUrl) {
  throw new Error('Missing TARGET_URL. Example: TARGET_URL="https://example.com/REG"');
}

if (!authConfirmed) {
  throw new Error('Set CONFIRM_AUTHORIZATION=YES only if you have explicit authorization.');
}

const formData = JSON.parse(__ENV.FORM_DATA_JSON || '{}');
const successMarker = __ENV.SUCCESS_MARKER || 'success';

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

function uniqueSuffix() {
  return `${Date.now()}_${__VU}_${__ITER}`;
}

function extractToken(html) {
  const m = html.match(/name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/i);
  return m ? m[1] : null;
}

function absoluteUrl(base, path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const origin = (base.match(/^(https?:\/\/[^/]+)/i) || [])[1] || '';
  if (!origin) return path;
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

function followRedirectChain(startUrl) {
  const responses = [];
  let currentUrl = startUrl;
  for (let i = 0; i < maxRedirectSteps && currentUrl; i += 1) {
    const res = http.get(currentUrl, { redirects: 0, timeout: '30s' });
    responses.push(res);
    const location = res.headers.Location || res.headers.location || '';
    if (!location) break;
    currentUrl = absoluteUrl(baseUrl, location);
  }
  return responses;
}

export default function () {
  const firstPageRes = http.get(baseUrl, { redirects: 5, timeout: '30s' });

  check(firstPageRes, {
    'registration page loaded (200)': (r) => r.status === 200,
  });

  const token = extractToken(firstPageRes.body);
  if (!token) {
    fail('Could not extract __RequestVerificationToken from registration page.');
  }

  const suffix = uniqueSuffix();
  const generatedEmail = formData.EmailAddress || `loadtest+${suffix}@example.test`;
  const payload = {
    ...formData,
    EmailAddress: generatedEmail,
    ReEmailAddress: formData.ReEmailAddress || generatedEmail,
    MobileNo: formData.MobileNo || `0917${String(__ITER).padStart(6, '0')}`,
    __RequestVerificationToken: token,
  };

  const submitRes = http.post(baseUrl, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirects: 0,
    timeout: '30s',
  });

  const firstLocation = submitRes.headers.Location || submitRes.headers.location || '';
  const firstRedirectUrl = absoluteUrl(baseUrl, firstLocation);
  const chainedResponses = firstRedirectUrl ? followRedirectChain(firstRedirectUrl) : [];
  const lastRes = chainedResponses.length ? chainedResponses[chainedResponses.length - 1] : submitRes;
  const effectiveBody = String(lastRes.body || '');

  const pagesReached = 1 + (firstRedirectUrl ? 1 : 0) + chainedResponses.length;

  check(submitRes, {
    'submit accepted (200/302)': (r) => r.status === 200 || r.status === 302,
    'response indicates save/success': (r) =>
      String(r.body || '').toLowerCase().includes(successMarker.toLowerCase()) || r.status === 302,
    'next page reached when required': () => !requireNextPage || pagesReached >= 2,
    'minimum pages reached': () => pagesReached >= minPagesReached,
  });

  if (nextPageMarker) {
    check(lastRes, {
      'configured marker found on final reached page': () =>
        effectiveBody.toLowerCase().includes(nextPageMarker.toLowerCase()),
    });
  }

  sleep(thinkTimeSeconds);
}
