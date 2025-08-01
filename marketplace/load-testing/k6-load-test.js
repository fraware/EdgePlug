import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const authTokenTrend = new Trend('auth_token_time');
const agentListTrend = new Trend('agent_list_time');
const agentDetailTrend = new Trend('agent_detail_time');
const userRegistrationTrend = new Trend('user_registration_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    errors: ['rate<0.1'],
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

// Helper function to generate random data
function generateRandomUser() {
  const timestamp = Date.now();
  return {
    email: `user${timestamp}@example.com`,
    username: `user${timestamp}`,
    password: 'password123',
    first_name: 'Test',
    last_name: 'User',
    company: 'Test Company',
  };
}

function generateRandomAgent() {
  const timestamp = Date.now();
  return {
    name: `Test Agent ${timestamp}`,
    description: 'A test agent for load testing',
    version: '1.0.0',
    category: 'test',
    tags: ['test', 'load-test'],
    price: 9.99,
    currency: 'USD',
    flash_size: 16384,
    sram_size: 4096,
    max_latency: 1000,
    safety_level: 'basic',
  };
}

// Shared state
let authToken = null;
let userId = null;

// Setup function - runs once at the beginning
export function setup() {
  console.log('Setting up load test...');
  
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
    console.log('Test user created successfully');
  }

  return { authToken, userId };
}

// Main test function
export default function(data) {
  const { authToken, userId } = data;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Test 1: Health Check
  const healthCheck = http.get(`${BASE_URL}/health`);
  check(healthCheck, {
    'health check successful': (r) => r.status === 200,
  });

  // Test 2: Get Agents List
  const agentListStart = Date.now();
  const agentListResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?page=1&limit=20`, { headers });
  const agentListDuration = Date.now() - agentListStart;
  agentListTrend.add(agentListDuration);

  check(agentListResponse, {
    'agent list successful': (r) => r.status === 200,
    'agent list has data': (r) => JSON.parse(r.body).agents !== undefined,
  });

  // Test 3: Get Agent Details (if agents exist)
  if (agentListResponse.status === 200) {
    const agents = JSON.parse(agentListResponse.body).agents;
    if (agents && agents.length > 0) {
      const agentId = agents[0].id;
      const agentDetailStart = Date.now();
      const agentDetailResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents/${agentId}`, { headers });
      const agentDetailDuration = Date.now() - agentDetailStart;
      agentDetailTrend.add(agentDetailDuration);

      check(agentDetailResponse, {
        'agent detail successful': (r) => r.status === 200,
      });
    }
  }

  // Test 4: User Authentication (Login)
  if (__VU % 5 === 0) { // Only 20% of virtual users perform login
    const loginData = {
      email: 'admin@edgeplug.com',
      password: 'admin123',
    };

    const loginStart = Date.now();
    const loginResponse = http.post(`${BASE_URL}/api/${API_VERSION}/auth/login`, JSON.stringify(loginData), {
      headers: { 'Content-Type': 'application/json' },
    });
    const loginDuration = Date.now() - loginStart;
    authTokenTrend.add(loginDuration);

    check(loginResponse, {
      'login successful': (r) => r.status === 200,
    });
  }

  // Test 5: User Profile (if authenticated)
  if (authToken && __VU % 3 === 0) { // Only 33% of authenticated users check profile
    const profileResponse = http.get(`${BASE_URL}/api/${API_VERSION}/profile`, { headers });
    check(profileResponse, {
      'profile retrieval successful': (r) => r.status === 200,
    });
  }

  // Test 6: Create Agent (if authenticated)
  if (authToken && __VU % 10 === 0) { // Only 10% of authenticated users create agents
    const agentData = generateRandomAgent();
    const createAgentResponse = http.post(`${BASE_URL}/api/${API_VERSION}/agents`, JSON.stringify(agentData), { headers });
    
    check(createAgentResponse, {
      'agent creation successful': (r) => r.status === 201,
    });
  }

  // Test 7: Search Agents
  const searchTerms = ['test', 'agent', 'edge', 'plug', 'iot'];
  const randomSearch = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents?search=${randomSearch}`, { headers });
  
  check(searchResponse, {
    'search successful': (r) => r.status === 200,
  });

  // Test 8: Get Agent Reviews
  if (agentListResponse.status === 200) {
    const agents = JSON.parse(agentListResponse.body).agents;
    if (agents && agents.length > 0) {
      const agentId = agents[0].id;
      const reviewsResponse = http.get(`${BASE_URL}/api/${API_VERSION}/agents/${agentId}/reviews`, { headers });
      
      check(reviewsResponse, {
        'reviews retrieval successful': (r) => r.status === 200,
      });
    }
  }

  // Test 9: Admin Statistics (simulate admin access)
  if (__VU % 20 === 0) { // Only 5% of users access admin endpoints
    const statsResponse = http.get(`${BASE_URL}/api/${API_VERSION}/admin/stats`, { headers });
    check(statsResponse, {
      'admin stats successful': (r) => r.status === 200 || r.status === 403, // 403 is expected for non-admin users
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

  // Think time between requests
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Cleaning up load test...');
  
  // In a real scenario, you might want to clean up test data
  // For now, we'll just log the completion
  console.log('Load test completed');
} 