#!/usr/bin/env python3
"""
EdgePlug Runtime Test Runner

This script runs all runtime tests and generates comprehensive coverage reports.
It provides detailed analysis of test results and coverage metrics.

Usage:
    python run_tests.py [--coverage] [--verbose] [--output-dir <dir>]
"""

import argparse
import subprocess
import sys
import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pathlib import Path


@dataclass
class TestResult:
    """Test result data structure"""

    name: str
    status: str  # "PASSED", "FAILED", "ERROR"
    execution_time: float
    output: str
    coverage_percentage: Optional[float] = None
    error_message: Optional[str] = None


class EdgePlugTestRunner:
    """Comprehensive test runner for EdgePlug runtime"""

    def __init__(self, verbose: bool = False, output_dir: str = "test_results"):
        self.verbose = verbose
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.results: List[TestResult] = []
        self.start_time = 0
        self.end_time = 0

    def log(self, message: str):
        """Log message with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_command(
        self, command: List[str], timeout: int = 300
    ) -> subprocess.CompletedProcess:
        """Run command with timeout and error handling"""
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=self.output_dir,
            )
            return result
        except subprocess.TimeoutExpired:
            cmd_str = " ".join(command)
            self.log(f"Command timed out after {timeout} seconds: {cmd_str}")
            return subprocess.CompletedProcess(command, -1, "", "Timeout")
        except Exception as e:
            cmd_str = " ".join(command)
            self.log(f"Command failed: {cmd_str} - {e}")
            return subprocess.CompletedProcess(command, -1, "", str(e))

    def build_tests(self) -> bool:
        """Build all test executables"""
        self.log("Building test executables...")

        # Create build directory
        build_dir = self.output_dir / "build"
        build_dir.mkdir(exist_ok=True)

        # Configure with CMake
        config_cmd = ["cmake", "..", "-DCMAKE_BUILD_TYPE=Debug"]
        result = self.run_command(config_cmd, cwd=build_dir)
        if result.returncode != 0:
            self.log(f"CMake configuration failed: {result.stderr}")
            return False

        # Build tests
        build_cmd = ["make", "-j4"]
        result = self.run_command(build_cmd, cwd=build_dir)
        if result.returncode != 0:
            self.log(f"Build failed: {result.stderr}")
            return False

        self.log("✓ Tests built successfully")
        return True

    def run_single_test(self, test_name: str, test_executable: str) -> TestResult:
        """Run a single test and capture results"""
        self.log(f"Running {test_name}...")

        start_time = time.time()

        # Run test executable
        test_cmd = [f"./build/{test_executable}"]
        result = self.run_command(test_cmd)

        execution_time = time.time() - start_time

        # Determine test status
        if result.returncode == 0:
            status = "PASSED"
            error_message = None
        else:
            status = "FAILED"
            error_message = result.stderr if result.stderr else "Unknown error"

        # Create test result
        test_result = TestResult(
            name=test_name,
            status=status,
            execution_time=execution_time,
            output=result.stdout,
            error_message=error_message,
        )

        if self.verbose:
            self.log(f"  Status: {status}")
            self.log(f"  Execution time: {execution_time:.2f}s")
            if error_message:
                self.log(f"  Error: {error_message}")

        return test_result

    def run_all_tests(self) -> bool:
        """Run all test executables"""
        self.log("Running all tests...")

        tests = [
            ("EdgePlug Runtime Test", "test_edgeplug_runtime"),
            ("EdgePlug Crypto Test", "test_crypto"),
            ("EdgePlug Agent Loader Test", "test_agent_loader"),
            ("EdgePlug Hotswap Test", "test_hotswap"),
        ]

        all_passed = True

        for test_name, executable in tests:
            result = self.run_single_test(test_name, executable)
            self.results.append(result)

            if result.status != "PASSED":
                all_passed = False

        return all_passed

    def generate_coverage_report(self) -> Optional[float]:
        """Generate coverage report using lcov and genhtml"""
        self.log("Generating coverage report...")

        build_dir = self.output_dir / "build"

        # Run tests with coverage
        for test_executable in [
            "test_edgeplug_runtime",
            "test_crypto",
            "test_agent_loader",
            "test_hotswap",
        ]:
            test_cmd = [f"./{test_executable}"]
            self.run_command(test_cmd, cwd=build_dir)

        # Capture coverage data
        lcov_cmd = [
            "lcov",
            "--capture",
            "--directory",
            ".",
            "--output-file",
            "coverage.info",
        ]
        result = self.run_command(lcov_cmd, cwd=build_dir)
        if result.returncode != 0:
            self.log(f"Coverage capture failed: {result.stderr}")
            return None

        # Remove system files from coverage
        filter_cmd = [
            "lcov",
            "--remove",
            "coverage.info",
            "/usr/*",
            "--output-file",
            "coverage.info",
        ]
        result = self.run_command(filter_cmd, cwd=build_dir)
        if result.returncode != 0:
            self.log(f"Coverage filtering failed: {result.stderr}")
            return None

        # Generate HTML report
        genhtml_cmd = [
            "genhtml",
            "coverage.info",
            "--output-directory",
            "coverage_report",
        ]
        result = self.run_command(genhtml_cmd, cwd=build_dir)
        if result.returncode != 0:
            self.log(f"HTML report generation failed: {result.stderr}")
            return None

        # Get coverage percentage
        list_cmd = ["lcov", "--list", "coverage.info"]
        result = self.run_command(list_cmd, cwd=build_dir)
        if result.returncode == 0:
            # Parse coverage percentage from output
            for line in result.stdout.split("\n"):
                if "lines......:" in line:
                    try:
                        percentage = float(line.split("%")[0].split(":")[-1].strip())
                        self.log(f"✓ Coverage report generated: {percentage:.1f}%")
                        return percentage
                    except (ValueError, IndexError):
                        pass

        self.log("✓ Coverage report generated")
        return None

    def analyze_results(self) -> Dict[str, Any]:
        """Analyze test results and generate summary"""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.status == "PASSED")
        failed_tests = total_tests - passed_tests
        total_time = sum(r.execution_time for r in self.results)

        # Calculate coverage if available
        coverage_percentage = None
        try:
            coverage_percentage = self.generate_coverage_report()
        except Exception as e:
            self.log(f"Coverage analysis failed: {e}")

        analysis = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "pass_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "total_execution_time": total_time,
            "coverage_percentage": coverage_percentage,
            "test_results": [
                {
                    "name": r.name,
                    "status": r.status,
                    "execution_time": r.execution_time,
                    "error_message": r.error_message,
                }
                for r in self.results
            ],
        }

        return analysis

    def print_summary(self, analysis: Dict[str, Any]):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("EDGEPLUG RUNTIME TEST SUMMARY")
        print("=" * 60)

        print(f"Total Tests: {analysis['total_tests']}")
        print(f"Passed: {analysis['passed_tests']}")
        print(f"Failed: {analysis['failed_tests']}")
        print(f"Pass Rate: {analysis['pass_rate']:.1f}%")
        print(f"Total Execution Time: {analysis['total_execution_time']:.2f}s")

        if analysis["coverage_percentage"] is not None:
            print(f"Code Coverage: {analysis['coverage_percentage']:.1f}%")

        print("\nTest Results:")
        for result in analysis["test_results"]:
            status_icon = "✓" if result["status"] == "PASSED" else "✗"
            print(
                f"  {status_icon} {result['name']}: {result['status']} ({result['execution_time']:.2f}s)"
            )
            if result["error_message"]:
                print(f"    Error: {result['error_message']}")

        if analysis["failed_tests"] > 0:
            print(f"\n🚨 {analysis['failed_tests']} test(s) failed!")
            return False
        else:
            print(f"\n✅ All {analysis['total_tests']} tests passed!")
            return True

    def save_results(self, analysis: Dict[str, Any]):
        """Save test results to JSON file"""
        results_file = self.output_dir / "test_results.json"
        with open(results_file, "w") as f:
            json.dump(analysis, f, indent=2)
        self.log(f"Results saved to: {results_file}")

    def run(self) -> bool:
        """Run complete test suite"""
        self.start_time = time.time()

        self.log("Starting EdgePlug Runtime Test Suite")
        self.log(f"Output directory: {self.output_dir}")

        # Build tests
        if not self.build_tests():
            self.log("❌ Build failed")
            return False

        # Run tests
        if not self.run_all_tests():
            self.log("❌ Some tests failed")

        # Analyze results
        analysis = self.analyze_results()

        # Print summary
        success = self.print_summary(analysis)

        # Save results
        self.save_results(analysis)

        self.end_time = time.time()
        total_time = self.end_time - self.start_time
        self.log(f"Test suite completed in {total_time:.2f}s")

        return success


def main():
    parser = argparse.ArgumentParser(description="EdgePlug Runtime Test Runner")
    parser.add_argument(
        "--coverage", action="store_true", help="Generate coverage report"
    )
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--output-dir", default="test_results", help="Output directory")

    args = parser.parse_args()

    # Check if required tools are available
    required_tools = ["cmake", "make", "gcc"]
    for tool in required_tools:
        try:
            subprocess.run([tool, "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"ERROR: Required tool '{tool}' not found")
            sys.exit(1)

    # Run test suite
    runner = EdgePlugTestRunner(verbose=args.verbose, output_dir=args.output_dir)
    success = runner.run()

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
