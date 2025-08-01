import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for stress testing
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const throughputTrend = new Trend('throughput');

// Stress test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '3m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 500 },  // Ramp up to 500 users (stress level)
    { duration: '5m', target: 500 },  // Stay at 500 users (peak stress)
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users (breaking point)
    { duration: '3m', target: 1000 }, // Stay at 1000 users (system stress)
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.2'],     // Error rate should be below 20% during stress
    errors: ['rate<0.2'],
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

// Helper function to generate random data
function generateRandomUser() {
  const timestamp = Date.now() + Math.random();
  return {
    email: `stress_user${timestamp}@example.com`,
    username: `stress_user${timestamp}`,
    password: 'password123',
    first_name: 'Stress',
    last_name: 'Test',
    company: 'Stress Test Company',
  };
}

function generateRandomAgent() {
  const timestamp = Date.now() + Math.random();
  return {
    name: `Stress Agent ${timestamp}`,
    description: 'A stress test agent for load testing',
    version: '1.0.0',
    category: 'stress-test',
    tags: ['stress', 'test', 'load'],
    price: Math.random() * 100,
    currency: 'USD',
    flash_size: Math.floor(Math.random() * 32768) + 16384,
    sram_size: Math.floor(Math.random() * 8192) + 4096,
    max_latency: Math.floor(Math.random() * 2000) + 500,
    safety_level: 'basic',
  };
}

// Shared state
let authToken = null;
let userId = null;

// Setup function
export function setup() {
  console.log('Setting up stress test...');
  
  // Register a test user
  const userData = generateRandomUser();
  const registerResponse = http.post(`${BASE_URL}/api/${API_VERSION}/auth/register`, JSON.stringify(userData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(registerResponse, {
    'user registration successful': (r) => r.status === 201,
  });

  if (registerResponse.status === 201) {
    const responseBody = JSON.parse(registerResponse.body);
    authToken = responseBody.token;
    userId = responseBody.user.id;
    console.log('Stress test user created successfully');
  }

  return { authToken, userId };
}

// Main stress test function
export default function(data) {
  const { authToken, userId } = data;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Stress Test 1: Concurrent Health Checks
  const healthCheckStart = Date.now();
  const healthCheck = http.get(`${BASE_URL}/health`);
  const healthCheckDuration = Date.now() - healthCheckStart;
  responseTimeTrend.add(healthCheckDuration);

  check(healthCheck, {
    'health check successful': (r) => r.status === 200,
  });

  // Stress Test 2: Heavy Agent List Requests
  const agentListStart = Date.now();
  const agentListResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?page=1&limit=100`, { headers });
  const agentListDuration = Date.now() - agentListStart;
  responseTimeTrend.add(agentListDuration);

  check(agentListResponse, {
    'agent list successful': (r) => r.status === 200,
  });

  // Stress Test 3: Concurrent Agent Creation (if authenticated)
  if (authToken && __VU % 5 === 0) { // 20% of authenticated users create agents
    const agentData = generateRandomAgent();
    const createAgentStart = Date.now();
    const createAgentResponse = http.post(`${BASE_URL}/api/${API_VERSION}/agents`, JSON.stringify(agentData), { headers });
    const createAgentDuration = Date.now() - createAgentStart;
    responseTimeTrend.add(createAgentDuration);
    
    check(createAgentResponse, {
      'agent creation successful': (r) => r.status === 201,
    });
  }

  // Stress Test 4: Heavy Search Operations
  const searchTerms = ['test', 'agent', 'edge', 'plug', 'iot', 'stress', 'load', 'performance'];
  const randomSearch = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchStart = Date.now();
  const searchResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?search=${randomSearch}&limit=50`, { headers });
  const searchDuration = Date.now() - searchStart;
  responseTimeTrend.add(searchDuration);
  
  check(searchResponse, {
    'search successful': (r) => r.status === 200,
  });

  // Stress Test 5: Concurrent User Authentication
  if (__VU % 3 === 0) { // 33% of users perform login
    const loginData = {
      email: 'admin@edgeplug.com',
      password: 'admin123',
    };

    const loginStart = Date.now();
    const loginResponse = http.post(`${BASE_URL}/api/${API_VERSION}/auth/login`, JSON.stringify(loginData), {
      headers: { 'Content-Type': 'application/json' },
    });
    const loginDuration = Date.now() - loginStart;
    responseTimeTrend.add(loginDuration);

    check(loginResponse, {
      'login successful': (r) => r.status === 200,
    });
  }

  // Stress Test 6: Profile Retrieval Under Load
  if (authToken && __VU % 2 === 0) { // 50% of authenticated users check profile
    const profileStart = Date.now();
    const profileResponse = http.get(`${BASE_URL}/api/${API_VERSION}/profile`, { headers });
    const profileDuration = Date.now() - profileStart;
    responseTimeTrend.add(profileDuration);
    
    check(profileResponse, {
      'profile retrieval successful': (r) => r.status === 200,
    });
  }

  // Stress Test 7: Concurrent Reviews Access
  if (agentListResponse.status === 200) {
    const agents = JSON.parse(agentListResponse.body).agents;
    if (agents && agents.length > 0) {
      const agentId = agents[0].id;
      const reviewsStart = Date.now();
      const reviewsResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents/${agentId}/reviews?limit=50`, { headers });
      const reviewsDuration = Date.now() - reviewsStart;
      responseTimeTrend.add(reviewsDuration);
      
      check(reviewsResponse, {
        'reviews retrieval successful': (r) => r.status === 200,
      });
    }
  }

  // Stress Test 8: Admin Endpoints Under Load
  if (__VU % 10 === 0) { // 10% of users access admin endpoints
    const statsStart = Date.now();
    const statsResponse = http.get(`${BASE_URL}/api/${API_VERSION}/admin/stats`, { headers });
    const statsDuration = Date.now() - statsStart;
    responseTimeTrend.add(statsDuration);
    
    check(statsResponse, {
      'admin stats successful': (r) => r.status === 200 || r.status === 403,
    });
  }

  // Stress Test 9: Large Data Retrieval
  if (__VU % 4 === 0) { // 25% of users request large datasets
    const largeDataStart = Date.now();
    const largeDataResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?page=1&limit=200&sort=created_at&order=desc`, { headers });
    const largeDataDuration = Date.now() - largeDataStart;
    responseTimeTrend.add(largeDataDuration);
    
    check(largeDataResponse, {
      'large data retrieval successful': (r) => r.status === 200,
    });
  }

  // Stress Test 10: Rapid Successive Requests
  if (__VU % 7 === 0) { // 14% of users make rapid successive requests
    const rapidRequests = [];
    for (let i = 0; i < 5; i++) {
      const rapidStart = Date.now();
      const rapidResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?page=${i + 1}&limit=10`, { headers });
      const rapidDuration = Date.now() - rapidStart;
      responseTimeTrend.add(rapidDuration);
      rapidRequests.push(rapidResponse);
    }
    
    rapidRequests.forEach(response => {
      check(response, {
        'rapid request successful': (r) => r.status === 200,
      });
    });
  }

  // Error tracking
  const responses = [healthCheck, agentListResponse, searchResponse];
  responses.forEach(response => {
    if (response.status >= 400) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }
  });

  // Throughput calculation
  const totalRequests = responses.length;
  throughputTrend.add(totalRequests);

  // Minimal think time during stress test
  sleep(Math.random() * 2 + 0.5); // Random sleep between 0.5-2.5 seconds
}

// Teardown function
export function teardown(data) {
  console.log('Cleaning up stress test...');
  console.log('Stress test completed');
} 