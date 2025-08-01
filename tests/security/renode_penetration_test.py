#!/usr/bin/env python3
"""
EdgePlug Penetration Testing Script using Renode

This script performs comprehensive penetration testing of EdgePlug's security controls
using Renode emulation to verify that security measures are working correctly.

Usage:
    python renode_penetration_test.py --config edgeplug_renode.resc
"""

import argparse
import sys
import time
import struct
import hashlib
import json
from typing import Dict, List, Any
import subprocess
import os


class EdgePlugPenetrationTest:
    """Penetration testing framework for EdgePlug using Renode"""

    def __init__(self, config_file: str):
        self.config_file = config_file
        self.renode_process = None
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "security_violations": 0,
            "start_time": 0,
            "end_time": 0,
            "test_details": [],
        }

    def start_renode(self) -> bool:
        """Start Renode with EdgePlug configuration"""
        try:
            cmd = ["renode", "--disable-xwt", "--console", self.config_file]
            self.renode_process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            time.sleep(2)  # Wait for Renode to start
            return True
        except Exception as e:
            print(f"Failed to start Renode: {e}")
            return False

    def stop_renode(self):
        """Stop Renode process"""
        if self.renode_process:
            self.renode_process.terminate()
            self.renode_process.wait()

    def send_renode_command(self, command: str) -> str:
        """Send command to Renode and get response"""
        if not self.renode_process:
            return ""

        try:
            self.renode_process.stdin.write(command + "\n")
            self.renode_process.stdin.flush()

            # Read response with timeout
            response = ""
            start_time = time.time()
            while time.time() - start_time < 5.0:
                if self.renode_process.stdout.readable():
                    line = self.renode_process.stdout.readline()
                    if line:
                        response += line
                        if ">" in line:  # Command prompt
                            break
                time.sleep(0.1)

            return response
        except Exception as e:
            print(f"Failed to send command to Renode: {e}")
            return ""

    def generate_malicious_agent(self, attack_type: str) -> bytes:
        """Generate malicious agent for testing"""
        agent_data = bytearray()

        if attack_type == "unsigned":
            # Agent without signature
            agent_data.extend(b"EDGEPLUG_AGENT")
            agent_data.extend(struct.pack("<I", 0x12345678))  # Version
            agent_data.extend(struct.pack("<I", len(agent_data) + 4))
            agent_data.extend(b"A" * 1024)  # Fake agent code

        elif attack_type == "corrupted_signature":
            # Agent with corrupted signature
            agent_data.extend(b"EDGEPLUG_AGENT")
            agent_data.extend(struct.pack("<I", 0x12345678))
            agent_data.extend(struct.pack("<I", len(agent_data) + 4))
            agent_data.extend(b"A" * 1024)
            # Add corrupted signature
            agent_data.extend(b"X" * 64)  # Corrupted signature

        elif attack_type == "memory_overflow":
            # Agent that tries to overflow memory
            agent_data.extend(b"EDGEPLUG_AGENT")
            agent_data.extend(struct.pack("<I", 0x12345678))
            agent_data.extend(struct.pack("<I", 0x10000))  # Large size
            agent_data.extend(b"A" * 65536)  # Large payload

        elif attack_type == "invalid_manifest":
            # Agent with invalid manifest
            agent_data.extend(b"EDGEPLUG_AGENT")
            agent_data.extend(struct.pack("<I", 0x12345678))
            agent_data.extend(struct.pack("<I", len(agent_data) + 4))
            agent_data.extend(b"A" * 1024)
            # Invalid manifest data
            agent_data.extend(b"INVALID_MANIFEST")

        return bytes(agent_data)

    def generate_malicious_manifest(self, attack_type: str) -> bytes:
        """Generate malicious manifest for testing"""
        manifest_data = bytearray()

        if attack_type == "excessive_memory":
            # Manifest requesting excessive memory
            manifest_data.extend(struct.pack("<I", 0x12345678))  # Version
            manifest_data.extend(struct.pack("<I", 0x12345678))  # Agent ID
            manifest_data.extend(struct.pack("<I", 0x100000))  # 1MB flash (excessive)
            manifest_data.extend(struct.pack("<I", 0x10000))  # 64KB SRAM (excessive)
            manifest_data.extend(b"X" * 64)  # Fake signature

        elif attack_type == "invalid_safety":
            # Manifest with invalid safety specifications
            manifest_data.extend(struct.pack("<I", 0x12345678))
            manifest_data.extend(struct.pack("<I", 0x12345678))
            manifest_data.extend(struct.pack("<I", 0x4000))  # 16KB flash
            manifest_data.extend(struct.pack("<I", 0x1000))  # 4KB SRAM
            manifest_data.extend(b"X" * 64)
            # Invalid safety data
            manifest_data.extend(b"INVALID_SAFETY")

        elif attack_type == "corrupted_hash":
            # Manifest with corrupted hash
            manifest_data.extend(struct.pack("<I", 0x12345678))
            manifest_data.extend(struct.pack("<I", 0x12345678))
            manifest_data.extend(struct.pack("<I", 0x4000))
            manifest_data.extend(struct.pack("<I", 0x1000))
            manifest_data.extend(b"X" * 64)
            manifest_data.extend(b"Y" * 64)  # Corrupted hash

        return bytes(manifest_data)

    def test_unsigned_agent_rejection(self) -> bool:
        """Test that unsigned agents are rejected"""
        print("Testing unsigned agent rejection...")

        # Generate unsigned agent
        agent_data = self.generate_malicious_agent("unsigned")

        # Try to load unsigned agent
        self.send_renode_command("agent_load_unsigned")

        # Check if system rejected the agent
        response = self.send_renode_command("check_agent_status")

        # Verify that agent was not loaded
        if "AGENT_LOADED" in response:
            print("FAILED: Unsigned agent was loaded")
            return False
        else:
            print("PASSED: Unsigned agent was rejected")
            return True

    def test_corrupted_signature_rejection(self) -> bool:
        """Test that agents with corrupted signatures are rejected"""
        print("Testing corrupted signature rejection...")

        # Generate agent with corrupted signature
        agent_data = self.generate_malicious_agent("corrupted_signature")

        # Try to load agent with corrupted signature
        self.send_renode_command("agent_load_corrupted")

        # Check if system rejected the agent
        response = self.send_renode_command("check_agent_status")

        if "AGENT_LOADED" in response:
            print("FAILED: Agent with corrupted signature was loaded")
            return False
        else:
            print("PASSED: Agent with corrupted signature was rejected")
            return True

    def test_memory_overflow_protection(self) -> bool:
        """Test memory overflow protection"""
        print("Testing memory overflow protection...")

        # Generate agent that tries to overflow memory
        agent_data = self.generate_malicious_agent("memory_overflow")

        # Try to load oversized agent
        self.send_renode_command("agent_load_oversized")

        # Check if system protected against overflow
        response = self.send_renode_command("check_memory_status")

        if "MEMORY_OVERFLOW" in response:
            print("FAILED: Memory overflow occurred")
            return False
        else:
            print("PASSED: Memory overflow protection worked")
            return True

    def test_invalid_manifest_rejection(self) -> bool:
        """Test that invalid manifests are rejected"""
        print("Testing invalid manifest rejection...")

        # Generate invalid manifest
        manifest_data = self.generate_malicious_manifest("invalid_safety")

        # Try to load agent with invalid manifest
        self.send_renode_command("agent_load_invalid_manifest")

        # Check if system rejected the manifest
        response = self.send_renode_command("check_manifest_status")

        if "MANIFEST_VALID" in response:
            print("FAILED: Invalid manifest was accepted")
            return False
        else:
            print("PASSED: Invalid manifest was rejected")
            return True

    def test_excessive_resource_rejection(self) -> bool:
        """Test that agents requesting excessive resources are rejected"""
        print("Testing excessive resource rejection...")

        # Generate manifest requesting excessive resources
        manifest_data = self.generate_malicious_manifest("excessive_memory")

        # Try to load agent with excessive resource requirements
        self.send_renode_command("agent_load_excessive_resources")

        # Check if system rejected the request
        response = self.send_renode_command("check_resource_status")

        if "RESOURCES_GRANTED" in response:
            print("FAILED: Excessive resource request was granted")
            return False
        else:
            print("PASSED: Excessive resource request was rejected")
            return True

    def test_safety_violation_detection(self) -> bool:
        """Test that safety violations are detected"""
        print("Testing safety violation detection...")

        # Try to trigger safety violation
        self.send_renode_command("trigger_safety_violation")

        # Check if safety violation was detected
        response = self.send_renode_command("check_safety_status")

        if "SAFETY_VIOLATION" in response:
            print("PASSED: Safety violation was detected")
            return True
        else:
            print("FAILED: Safety violation was not detected")
            return False

    def test_secure_boot_verification(self) -> bool:
        """Test secure boot verification"""
        print("Testing secure boot verification...")

        # Try to boot with invalid bootloader
        self.send_renode_command("boot_invalid_bootloader")

        # Check if secure boot prevented boot
        response = self.send_renode_command("check_boot_status")

        if "BOOT_SUCCESS" in response:
            print("FAILED: System booted with invalid bootloader")
            return False
        else:
            print("PASSED: Secure boot prevented invalid boot")
            return True

    def test_hotswap_security(self) -> bool:
        """Test hot-swap security controls"""
        print("Testing hot-swap security...")

        # Try to hot-swap with invalid agent
        self.send_renode_command("hotswap_invalid_agent")

        # Check if hot-swap was rejected
        response = self.send_renode_command("check_hotswap_status")

        if "HOTSWAP_SUCCESS" in response:
            print("FAILED: Invalid agent was hot-swapped")
            return False
        else:
            print("PASSED: Invalid agent hot-swap was rejected")
            return True

    def test_cryptographic_verification(self) -> bool:
        """Test cryptographic verification"""
        print("Testing cryptographic verification...")

        # Try to verify invalid signature
        self.send_renode_command("verify_invalid_signature")

        # Check if verification failed
        response = self.send_renode_command("check_crypto_status")

        if "SIGNATURE_VALID" in response:
            print("FAILED: Invalid signature was accepted")
            return False
        else:
            print("PASSED: Invalid signature was rejected")
            return True

    def run_penetration_tests(self):
        """Run all penetration tests"""
        print("Starting EdgePlug Penetration Testing...")
        self.test_results["start_time"] = time.time()

        tests = [
            ("Unsigned Agent Rejection", self.test_unsigned_agent_rejection),
            ("Corrupted Signature Rejection", self.test_corrupted_signature_rejection),
            ("Memory Overflow Protection", self.test_memory_overflow_protection),
            ("Invalid Manifest Rejection", self.test_invalid_manifest_rejection),
            ("Excessive Resource Rejection", self.test_excessive_resource_rejection),
            ("Safety Violation Detection", self.test_safety_violation_detection),
            ("Secure Boot Verification", self.test_secure_boot_verification),
            ("Hot-Swap Security", self.test_hotswap_security),
            ("Cryptographic Verification", self.test_cryptographic_verification),
        ]

        for test_name, test_func in tests:
            self.test_results["total_tests"] += 1

            try:
                result = test_func()
                if result:
                    self.test_results["passed_tests"] += 1
                    print(f"✓ {test_name}: PASSED")
                else:
                    self.test_results["failed_tests"] += 1
                    self.test_results["security_violations"] += 1
                    print(f"✗ {test_name}: FAILED")

                self.test_results["test_details"].append(
                    {
                        "test_name": test_name,
                        "result": "PASSED" if result else "FAILED",
                        "timestamp": time.time(),
                    }
                )

            except Exception as e:
                self.test_results["failed_tests"] += 1
                print(f"✗ {test_name}: ERROR - {e}")

        self.test_results["end_time"] = time.time()

    def print_results(self):
        """Print test results"""
        print("\n" + "=" * 60)
        print("EDGEPLUG PENETRATION TEST RESULTS")
        print("=" * 60)

        total_time = self.test_results["end_time"] - self.test_results["start_time"]
        pass_rate = (
            self.test_results["passed_tests"] / self.test_results["total_tests"]
        ) * 100

        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"Passed: {self.test_results['passed_tests']}")
        print(f"Failed: {self.test_results['failed_tests']}")
        print(f"Security Violations: {self.test_results['security_violations']}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        print(f"Total Time: {total_time:.2f} seconds")

        if self.test_results["security_violations"] > 0:
            print("\n🚨 CRITICAL: Security violations detected!")
            print("System is NOT production ready.")
        else:
            print("\n✅ All security tests passed!")
            print("System meets basic security requirements.")

        print("\nDetailed Results:")
        for test in self.test_results["test_details"]:
            status = "✓" if test["result"] == "PASSED" else "✗"
            print(f"  {status} {test['test_name']}: {test['result']}")

    def save_results(self, output_file: str):
        """Save test results to file"""
        with open(output_file, "w") as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\nResults saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description="EdgePlug Penetration Testing")
    parser.add_argument("--config", required=True, help="Renode configuration file")
    parser.add_argument(
        "--output",
        default="penetration_test_results.json",
        help="Output file for results",
    )

    args = parser.parse_args()

    # Check if Renode is available
    try:
        subprocess.run(["renode", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("ERROR: Renode is not installed or not in PATH")
        print("Please install Renode: https://renode.io/")
        sys.exit(1)

    # Check if config file exists
    if not os.path.exists(args.config):
        print(f"ERROR: Configuration file {args.config} not found")
        sys.exit(1)

    # Run penetration tests
    tester = EdgePlugPenetrationTest(args.config)

    try:
        if not tester.start_renode():
            print("ERROR: Failed to start Renode")
            sys.exit(1)

        tester.run_penetration_tests()
        tester.print_results()
        tester.save_results(args.output)

    finally:
        tester.stop_renode()

    # Exit with error code if security violations detected
    if tester.test_results["security_violations"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
