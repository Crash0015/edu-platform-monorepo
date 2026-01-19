import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<600'],
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

export default function () {
  const loginRes = http.post(`${baseUrl}/api/v1/auth/login`, loginPayload, {
    headers: defaultHeaders,
  });

  const loginOk = check(loginRes, {
    'login status 200': (res) => res.status === 200,
  });

  if (loginOk) {
    const body = loginRes.json();
    if (body && body.refreshToken) {
      const refreshRes = http.post(
        `${baseUrl}/api/v1/auth/refresh`,
        JSON.stringify({ refreshToken: body.refreshToken }),
        { headers: defaultHeaders },
      );
      check(refreshRes, {
        'refresh status 200': (res) => res.status === 200,
      });
    }
  }

  sleep(1);
}
