// k6 load-test scenarios for Capital University Club backend
//
// Run examples:
//   k6 run --vus 100  --duration 30s scenarios.js
//   k6 run --vus 500  --duration 1m  scenarios.js
//   k6 run --vus 1000 --duration 2m  scenarios.js
//   k6 run --vus 2000 --duration 2m  scenarios.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics for clear reporting
const errors = new Rate('custom_errors');
const slow = new Rate('over_1s');
const apiLatency = new Trend('api_latency');

export const options = {
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // < 1% failure
    http_req_duration: ['p(95)<1000'],  // p95 under 1s (target)
    over_1s:           ['rate<0.05'],   // < 5% over 1 second
  },
};

const ENDPOINTS = [
  { name: 'memberships',   path: '/api/memberships',      weight: 4 },
  { name: 'media_posts',   path: '/api/media-posts',      weight: 3 },
  { name: 'branches',      path: '/api/register/branches',weight: 2 },
];

function pickEndpoint() {
  const totalWeight = ENDPOINTS.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const e of ENDPOINTS) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return ENDPOINTS[0];
}

export default function () {
  group('public_browse', () => {
    const e = pickEndpoint();
    const res = http.get(`${BASE}${e.path}`, {
      tags: { endpoint: e.name },
      timeout: '10s',
    });

    const ok = check(res, {
      [`${e.name} status 200`]: (r) => r.status === 200,
      [`${e.name} body has data`]: (r) => r.body && r.body.length > 50,
    });
    errors.add(!ok);
    slow.add(res.timings.duration > 1000);
    apiLatency.add(res.timings.duration, { endpoint: e.name });
  });

  sleep(Math.random() * 1.5 + 0.5); // 0.5-2s think time
}
