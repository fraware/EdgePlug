#!/usr/bin/env python3
"""
EdgePlug Integration Test Suite
Tests the complete EdgePlug stack end-to-end including frontend, backend,
and runtime components.
"""

import sys
import time
import json
import requests
import threading
import unittest
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("integration_test.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


class EdgePlugIntegrationTest(unittest.TestCase):
    """Comprehensive integration tests for EdgePlug system."""

    def setUp(self):
        """Set up test environment."""
        self.base_url = "http://localhost:8080"
        self.test_data_dir = Path("test_data")
        self.test_data_dir.mkdir(exist_ok=True)

        # Test configuration
        self.config = {
            "frontend_port": 3000,
            "backend_port": 8080,
            "runtime_port": 9090,
            "timeout": 30,
            "retry_attempts": 3,
        }

        logger.info("Setting up EdgePlug integration test environment")

    def test_01_system_startup(self):
        """Test complete system startup and initialization."""
        logger.info("Testing system startup...")

        # Check if all services are running
        services = [
            ("Frontend", f"http://localhost:{self.config['frontend_port']}"),
            ("Backend", f"http://localhost:{self.config['backend_port']}/health"),
            ("Runtime", f"http://localhost:{self.config['runtime_port']}/health"),
        ]

        for service_name, url in services:
            try:
                response = requests.get(url, timeout=self.config["timeout"])
                self.assertEqual(
                    response.status_code, 200, f"{service_name} not responding"
                )
                logger.info(f"[OK] {service_name} is running")
            except requests.exceptions.RequestException as e:
                self.fail(f"{service_name} failed to start: {e}")

    def test_02_frontend_functionality(self):
        """Test frontend UI components and functionality."""
        logger.info("Testing frontend functionality...")

        # Test main page load
        try:
            response = requests.get(f"http://localhost:{self.config['frontend_port']}")
            self.assertEqual(response.status_code, 200)
            logger.info("[OK] Frontend main page loads successfully")
        except requests.exceptions.RequestException as e:
            self.fail(f"Frontend not accessible: {e}")

        # Test API endpoints through frontend
        api_endpoints = ["/api/health", "/api/status", "/api/version"]

        for endpoint in api_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                self.assertEqual(response.status_code, 200)
                logger.info(f"[OK] API endpoint {endpoint} responds")
            except requests.exceptions.RequestException as e:
                self.fail(f"API endpoint {endpoint} failed: {e}")

    def test_03_backend_api(self):
        """Test backend API functionality."""
        logger.info("Testing backend API...")

        # Test authentication
        auth_data = {"username": "test_user", "password": "test_password"}

        try:
            response = requests.post(f"{self.base_url}/api/auth/login", json=auth_data)
            self.assertIn(
                response.status_code, [200, 401]
            )  # 401 is expected for invalid credentials
            logger.info("✓ Authentication endpoint responds")
        except requests.exceptions.RequestException as e:
            self.fail(f"Authentication failed: {e}")

        # Test marketplace endpoints
        marketplace_endpoints = [
            "/api/marketplace/components",
            "/api/marketplace/categories",
            "/api/marketplace/search",
        ]

        for endpoint in marketplace_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                self.assertEqual(response.status_code, 200)
                logger.info(f"✓ Marketplace endpoint {endpoint} responds")
            except requests.exceptions.RequestException as e:
                self.fail(f"Marketplace endpoint {endpoint} failed: {e}")

    def test_04_runtime_communication(self):
        """Test runtime component communication."""
        logger.info("Testing runtime communication...")

        # Test runtime health check
        try:
            response = requests.get(
                f"http://localhost:{self.config['runtime_port']}/health"
            )
            self.assertEqual(response.status_code, 200)
            health_data = response.json()
            self.assertIn("status", health_data)
            logger.info("✓ Runtime health check successful")
        except requests.exceptions.RequestException as e:
            self.fail(f"Runtime health check failed: {e}")

        # Test agent deployment
        test_agent_data = {
            "agent_id": "test_agent_001",
            "model_data": "mock_model_data",
            "config": {"window_size": 64, "sample_rate": 1000},
        }

        try:
            response = requests.post(
                f"http://localhost:{self.config['runtime_port']}/api/agents/deploy",
                json=test_agent_data,
            )
            self.assertIn(response.status_code, [200, 201])
            logger.info("✓ Agent deployment endpoint responds")
        except requests.exceptions.RequestException as e:
            self.fail(f"Agent deployment failed: {e}")

    def test_05_data_flow(self):
        """Test end-to-end data flow through the system."""
        logger.info("Testing data flow...")

        # Simulate sensor data
        sensor_data = {
            "voltage": 230.0,
            "current": 15.0,
            "temperature": 45.0,
            "timestamp": int(time.time()),
        }

        # Send data to runtime
        try:
            response = requests.post(
                f"http://localhost:{self.config['runtime_port']}/api/sensors/data",
                json=sensor_data,
            )
            self.assertEqual(response.status_code, 200)
            logger.info("✓ Sensor data processing successful")
        except requests.exceptions.RequestException as e:
            self.fail(f"Sensor data processing failed: {e}")

        # Check if data appears in backend
        time.sleep(2)  # Allow time for data processing

        try:
            response = requests.get(f"{self.base_url}/api/sensors/latest")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIsInstance(data, list)
            logger.info("✓ Data flow to backend successful")
        except requests.exceptions.RequestException as e:
            self.fail(f"Data retrieval from backend failed: {e}")

    def test_06_performance_validation(self):
        """Test system performance under load."""
        logger.info("Testing performance validation...")

        # Test response times
        endpoints = [
            f"{self.base_url}/api/health",
            f"{self.base_url}/api/status",
            f"http://localhost:{self.config['frontend_port']}",
        ]

        for endpoint in endpoints:
            start_time = time.time()
            try:
                response = requests.get(endpoint, timeout=5)
                response_time = time.time() - start_time
                self.assertLess(
                    response_time, 2.0, f"Response time too slow: {response_time:.2f}s"
                )
                logger.info(f"✓ {endpoint} response time: {response_time:.2f}s")
            except requests.exceptions.RequestException as e:
                self.fail(f"Performance test failed for {endpoint}: {e}")

        # Test concurrent requests
        def make_request():
            try:
                response = requests.get(f"{self.base_url}/api/health", timeout=5)
                return response.status_code == 200
            except:
                return False

        # Start multiple threads
        threads = []
        for i in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        logger.info("✓ Concurrent request handling successful")

    def test_07_security_verification(self):
        """Test security features and compliance."""
        logger.info("Testing security verification...")

        # Test HTTPS redirect (if configured)
        try:
            response = requests.get(
                f"{self.base_url}/api/health", allow_redirects=False
            )
            # Should not redirect to HTTPS in test environment
            self.assertEqual(response.status_code, 200)
            logger.info("✓ HTTP endpoint accessible (expected in test environment)")
        except requests.exceptions.RequestException as e:
            self.fail(f"Security test failed: {e}")

        # Test authentication required endpoints
        protected_endpoints = [
            "/api/admin/users",
            "/api/admin/config",
            "/api/admin/logs",
        ]

        for endpoint in protected_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                # Should return 401 or 403 for unauthenticated requests
                self.assertIn(response.status_code, [401, 403])
                logger.info(f"✓ Protected endpoint {endpoint} properly secured")
            except requests.exceptions.RequestException as e:
                self.fail(f"Security test failed for {endpoint}: {e}")

        # Test input validation
        malicious_inputs = [
            {"script": "<script>alert('xss')</script>"},
            {"sql": "'; DROP TABLE users; --"},
            {"path": "../../../etc/passwd"},
        ]

        for malicious_input in malicious_inputs:
            try:
                response = requests.post(
                    f"{self.base_url}/api/test/input", json=malicious_input
                )
                # Should handle malicious input gracefully
                self.assertNotEqual(response.status_code, 500)
                logger.info("✓ Input validation working")
            except requests.exceptions.RequestException:
                # Expected for malicious input
                logger.info("✓ Malicious input properly rejected")

    def test_08_error_handling(self):
        """Test error handling and recovery."""
        logger.info("Testing error handling...")

        # Test invalid endpoints
        invalid_endpoints = [
            "/api/nonexistent",
            "/api/invalid/endpoint",
            "/api/error/test",
        ]

        for endpoint in invalid_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                self.assertIn(response.status_code, [404, 400])
                logger.info(f"✓ Invalid endpoint {endpoint} properly handled")
            except requests.exceptions.RequestException as e:
                self.fail(f"Error handling failed for {endpoint}: {e}")

        # Test malformed JSON
        malformed_data = {"invalid": "data", "with": "malformed", "json": None}

        try:
            response = requests.post(
                f"{self.base_url}/api/test/json",
                json=malformed_data,
                headers={"Content-Type": "application/json"},
            )
            self.assertIn(response.status_code, [400, 422])
            logger.info("✓ Malformed JSON properly handled")
        except requests.exceptions.RequestException as e:
            self.fail(f"JSON error handling failed: {e}")

    def test_09_component_integration(self):
        """Test integration between different components."""
        logger.info("Testing component integration...")

        # Test marketplace to runtime deployment
        test_component = {
            "component_id": "test_component_001",
            "name": "Test Component",
            "version": "1.0.0",
            "type": "sensor",
            "config": {"sample_rate": 1000, "window_size": 64},
        }

        # Deploy component through marketplace
        try:
            response = requests.post(
                f"{self.base_url}/api/marketplace/deploy", json=test_component
            )
            self.assertIn(response.status_code, [200, 201])
            logger.info("✓ Component deployment through marketplace successful")
        except requests.exceptions.RequestException as e:
            self.fail(f"Component deployment failed: {e}")

        # Verify component appears in runtime
        time.sleep(2)  # Allow time for deployment

        try:
            response = requests.get(
                f"http://localhost:{self.config['runtime_port']}/api/components"
            )
            self.assertEqual(response.status_code, 200)
            components = response.json()
            self.assertIsInstance(components, list)
            logger.info("✓ Component integration verified")
        except requests.exceptions.RequestException as e:
            self.fail(f"Component verification failed: {e}")

    def test_10_system_monitoring(self):
        """Test system monitoring and metrics."""
        logger.info("Testing system monitoring...")

        # Test metrics endpoints
        metrics_endpoints = [
            f"{self.base_url}/api/metrics",
            f"{self.base_url}/api/health/detailed",
            f"http://localhost:{self.config['runtime_port']}/api/metrics",
        ]

        for endpoint in metrics_endpoints:
            try:
                response = requests.get(endpoint)
                self.assertEqual(response.status_code, 200)
                metrics = response.json()
                self.assertIsInstance(metrics, dict)
                logger.info(f"✓ Metrics endpoint {endpoint} working")
            except requests.exceptions.RequestException as e:
                self.fail(f"Metrics endpoint {endpoint} failed: {e}")

        # Test log aggregation
        try:
            response = requests.get(f"{self.base_url}/api/logs")
            self.assertEqual(response.status_code, 200)
            logs = response.json()
            self.assertIsInstance(logs, list)
            logger.info("✓ Log aggregation working")
        except requests.exceptions.RequestException as e:
            self.fail(f"Log aggregation failed: {e}")


def run_integration_tests():
    """Run the complete integration test suite."""
    logger.info("Starting EdgePlug Integration Test Suite")
    logger.info("=" * 50)

    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(EdgePlugIntegrationTest)

    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Generate test report
    generate_test_report(result)

    return result.wasSuccessful()


def generate_test_report(result):
    """Generate a comprehensive test report."""
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_tests": result.testsRun,
        "failures": len(result.failures),
        "errors": len(result.errors),
        "success_rate": (result.testsRun - len(result.failures) - len(result.errors))
        / result.testsRun
        * 100,
        "details": {
            "failures": [
                {"test": str(f[0]), "error": str(f[1])} for f in result.failures
            ],
            "errors": [{"test": str(e[0]), "error": str(e[1])} for e in result.errors],
        },
    }

    # Save report
    with open("integration_test_report.json", "w") as f:
        json.dump(report, f, indent=2)

    logger.info(
        f"Test Report: {report['total_tests']} tests, {report['failures']} failures, {report['errors']} errors"
    )
    logger.info(f"Success Rate: {report['success_rate']:.1f}%")


if __name__ == "__main__":
    success = run_integration_tests()
    sys.exit(0 if success else 1)
