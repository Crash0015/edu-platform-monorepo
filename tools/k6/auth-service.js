import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1200'],
  },
};

const baseUrl = __ENV.AUTH_BASE_URL || 'http://localhost:3001';
const loginPayload = JSON.stringify({
  email: __ENV.AUTH_EMAIL || 'student@uce.edu.ec',
  password: __ENV.AUTH_PASSWORD || 'Password123!',
});

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Correlation-Id': 'k6-load-test',
};

let refreshToken = '';
let loginFailures = 0;
let refreshFailures = 0;

function login() {
  const loginRes = http.post(`${baseUrl}/api/v1/auth/login`, loginPayload, {
    headers: defaultHeaders,
  });

  const loginOk = check(loginRes, {
    'login status 200': (res) => res.status === 200,
  });

  if (!loginOk) {
    loginFailures += 1;
    if (loginFailures <= 5) {
      console.error(
        `login failed: status=${loginRes.status} body=${JSON.stringify(loginRes.json())}`,
      );
    }
    return '';
  }

  const body = loginRes.json();
  return body?.refreshToken ?? '';
}

export default function () {
  if (!refreshToken) {
    refreshToken = login();
  }

  if (!refreshToken) {
    sleep(1);
    return;
  }

  const refreshRes = http.post(
    `${baseUrl}/api/v1/auth/refresh`,
    JSON.stringify({ refreshToken }),
    { headers: defaultHeaders },
  );

  const refreshOk = check(refreshRes, {
    'refresh status 200': (res) => res.status === 200,
  });

  if (refreshOk) {
    const body = refreshRes.json();
    refreshToken = body?.refreshToken ?? refreshToken;
  } else {
    refreshFailures += 1;
    if (refreshFailures <= 5) {
      console.error(
        `refresh failed: status=${refreshRes.status} body=${JSON.stringify(refreshRes.json())}`,
      );
    }
    refreshToken = '';
  }

  sleep(1);
}
