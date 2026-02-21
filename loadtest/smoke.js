import http from 'k6/http';
import { check, sleep } from 'k6';

const target = __ENV.TARGET_URL;
const authConfirmed = __ENV.CONFIRM_AUTHORIZATION === 'YES';
const vus = Number(__ENV.VUS || '10');
const duration = __ENV.DURATION || '60s';

if (!target) {
  throw new Error('Missing TARGET_URL. Example: TARGET_URL="https://staging.example.com"');
}

if (!authConfirmed) {
  throw new Error(
    'Set CONFIRM_AUTHORIZATION=YES only if you have explicit authorization to test this target.'
  );
}

if (!Number.isFinite(vus) || vus < 1) {
  throw new Error('VUS must be a number >= 1.');
}

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_duration: ['p(95)<1200'],
    http_req_failed: ['rate<0.02'],
  },
};

export default function () {
  const response = http.get(target, {
    tags: { name: 'homepage' },
    timeout: '20s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
