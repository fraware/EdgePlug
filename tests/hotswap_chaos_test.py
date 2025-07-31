#!/usr/bin/env python3
"""
EdgePlug Hot-Swap Chaos Test

This script randomly corrupts 1% of patch bytes to verify:
- System auto-rollback on corruption
- CRC32 validation working correctly
- System stability under corruption
- Proper error handling

Usage:
    python hotswap_chaos_test.py --device /dev/ttyUSB0 --iterations 100
"""

import argparse
import sys
import time
import random
import struct
from typing import Dict, Any
import serial
import json


class HotSwapChaosTest:
    """Chaos test for hot-swap functionality"""

    def __init__(self, device: str, iterations: int = 100):
        self.device = device
        self.iterations = iterations
        self.serial_conn = None
        self.results = {
            "total_tests": 0,
            "corruption_detected": 0,
            "auto_rollbacks": 0,
            "system_crashes": 0,
            "successful_corruptions": 0,
            "failed_corruptions": 0,
            "start_time": 0,
            "end_time": 0,
            "errors": [],
        }

    def connect(self) -> bool:
        """Connect to device"""
        try:
            self.serial_conn = serial.Serial(
                port=self.device,
                baudrate=115200,
                timeout=30,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
            )
            print(f"Connected to {self.device}")
            return True
        except Exception as e:
            print(f"Failed to connect: {e}")
            return False

    def disconnect(self):
        """Disconnect from device"""
        if self.serial_conn:
            self.serial_conn.close()

    def send_command(self, command: str, data: bytes = b"") -> bytes:
        """Send command to device"""
        if not self.serial_conn:
            return b""

        # Create packet: [length][command][data][checksum]
        packet = struct.pack("<H", len(command) + len(data) + 3)
        packet += command.encode("ascii")
        packet += data

        # Calculate checksum
        checksum = sum(packet) & 0xFF
        packet += struct.pack("B", checksum)

        # Send packet
        self.serial_conn.write(packet)

        # Read response
        try:
            response_length = struct.unpack("<H", self.serial_conn.read(2))[0]
            response = self.serial_conn.read(response_length)
            return response
        except Exception as e:
            print(f"Failed to read response: {e}")
            return b""

    def generate_test_agent(self, version: int) -> bytes:
        """Generate test agent binary"""
        # Create a simple test agent
        agent_data = bytearray()

        # Header
        agent_data.extend(b"EDGEPLUG_AGENT")
        agent_data.extend(struct.pack("<I", version))
        agent_data.extend(struct.pack("<I", len(agent_data) + 4))

        # Test data
        test_data = f"Test agent version {version}".encode("ascii")
        agent_data.extend(test_data)

        # Padding
        padding = random.randbytes(1024 - len(agent_data))
        agent_data.extend(padding)

        return bytes(agent_data)

    def corrupt_data(self, data: bytes, corruption_rate: float = 0.01) -> bytes:
        """Randomly corrupt data at specified rate"""
        data_array = bytearray(data)
        corruption_count = int(len(data_array) * corruption_rate)

        # Randomly select bytes to corrupt
        corruption_indices = random.sample(range(len(data_array)), corruption_count)

        for idx in corruption_indices:
            # Flip random bits in the byte
            data_array[idx] ^= random.randint(1, 255)

        return bytes(data_array)

    def generate_test_manifest(self, version: int) -> bytes:
        """Generate test manifest"""
        manifest_data = {
            "agent_id": f"test-agent-v{version}",
            "version": version,
            "size": 1024,
            "signature": random.randbytes(64).hex(),
            "timestamp": int(time.time()),
        }

        return json.dumps(manifest_data).encode("ascii")

    def deploy_agent(self, agent_data: bytes, manifest_data: bytes) -> bool:
        """Deploy agent to device"""
        # Send manifest
        response = self.send_command("MANIFEST", manifest_data)
        if not response or response[0] != 0:
            return False

        # Send agent
        response = self.send_command("AGENT", agent_data)
        if not response or response[0] != 0:
            return False

        # Trigger update
        response = self.send_command("UPDATE")
        if not response or response[0] != 0:
            return False

        return True

    def get_update_status(self) -> Dict[str, Any]:
        """Get update status"""
        response = self.send_command("STATUS")
        if response and response[0] == 0:
            try:
                status_data = response[1:]
                return json.loads(status_data.decode("ascii"))
            except Exception:
                pass

        return {}

    def check_for_rollback(self) -> bool:
        """Check if system rolled back"""
        status = self.get_update_status()
        return status.get("rollback_occurred", False)

    def check_system_stability(self) -> bool:
        """Check if system is still stable"""
        try:
            # Try to get device info
            response = self.send_command("INFO")
            return response is not None and len(response) > 0
        except Exception:
            return False

    def run_chaos_test(self):
        """Run the chaos test"""
        print(f"Starting chaos test with {self.iterations} iterations...")
        self.results["start_time"] = time.time()

        for i in range(self.iterations):
            try:
                # Generate test agent and manifest
                version = i + 1
                agent_data = self.generate_test_agent(version)
                manifest_data = self.generate_test_manifest(version)

                print(f"Iteration {i+1}/{self.iterations}: Testing corruption")

                # Corrupt the agent data (1% corruption rate)
                corrupted_agent = self.corrupt_data(agent_data, 0.01)

                # Try to deploy corrupted agent
                if self.deploy_agent(corrupted_agent, manifest_data):
                    self.results["failed_corruptions"] += 1
                    print(
                        f"  ✗ Corrupted agent was accepted (should have been rejected)"
                    )
                else:
                    self.results["successful_corruptions"] += 1
                    print(f"  ✓ Corrupted agent correctly rejected")

                # Check if corruption was detected
                status = self.get_update_status()
                if status.get("corruption_detected", False):
                    self.results["corruption_detected"] += 1
                    print(f"  ✓ Corruption detected by system")

                # Check for auto-rollback
                if self.check_for_rollback():
                    self.results["auto_rollbacks"] += 1
                    print(f"  ✓ Auto-rollback occurred")

                # Check system stability
                if not self.check_system_stability():
                    self.results["system_crashes"] += 1
                    print(f"  ✗ System became unstable")
                else:
                    print(f"  ✓ System remained stable")

                self.results["total_tests"] += 1

                # Small delay between iterations
                time.sleep(0.1)

                # Progress update every 10 iterations
                if (i + 1) % 10 == 0:
                    corruption_detection_rate = (
                        self.results["corruption_detected"]
                        / self.results["total_tests"]
                    ) * 100
                    rollback_rate = (
                        self.results["auto_rollbacks"] / self.results["total_tests"]
                    ) * 100
                    print(
                        f"Progress: {i+1}/{self.iterations} - "
                        f"Detection: {corruption_detection_rate:.1f}% - "
                        f"Rollback: {rollback_rate:.1f}%"
                    )

            except Exception as e:
                error_msg = f"Iteration {i+1} failed: {e}"
                print(f"  ✗ {error_msg}")
                self.results["errors"].append(error_msg)
                self.results["system_crashes"] += 1

        self.results["end_time"] = time.time()

    def print_results(self):
        """Print test results"""
        duration = self.results["end_time"] - self.results["start_time"]
        corruption_detection_rate = (
            (self.results["corruption_detected"] / self.results["total_tests"]) * 100
            if self.results["total_tests"] > 0
            else 0
        )
        rollback_rate = (
            (self.results["auto_rollbacks"] / self.results["total_tests"]) * 100
            if self.results["total_tests"] > 0
            else 0
        )
        crash_rate = (
            (self.results["system_crashes"] / self.results["total_tests"]) * 100
            if self.results["total_tests"] > 0
            else 0
        )

        print("\n" + "=" * 50)
        print("CHAOS TEST RESULTS")
        print("=" * 50)
        print(f"Total tests: {self.results['total_tests']}")
        print(f"Corruption detected: {self.results['corruption_detected']}")
        print(f"Auto-rollbacks: {self.results['auto_rollbacks']}")
        print(f"System crashes: {self.results['system_crashes']}")
        print(f"Successful corruptions: {self.results['successful_corruptions']}")
        print(f"Failed corruptions: {self.results['failed_corruptions']}")
        print(f"Corruption detection rate: {corruption_detection_rate:.1f}%")
        print(f"Auto-rollback rate: {rollback_rate:.1f}%")
        print(f"System crash rate: {crash_rate:.1f}%")
        print(f"Test duration: {duration:.1f} seconds")

        if self.results["errors"]:
            print(f"\nErrors encountered:")
            for error in self.results["errors"][:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(self.results["errors"]) > 5:
                print(f"  ... and {len(self.results['errors']) - 5} more errors")

        # Quality gates
        print(f"\nQUALITY GATES:")
        print(
            f"✓ Corruption detection ≥ 95%: {'PASS' if corruption_detection_rate >= 95 else 'FAIL'}"
        )
        print(f"✓ Auto-rollback ≥ 90%: {'PASS' if rollback_rate >= 90 else 'FAIL'}")
        print(f"✓ System crash rate ≤ 5%: {'PASS' if crash_rate <= 5 else 'FAIL'}")
        print(
            f"✓ Failed corruptions ≤ 1%: {'PASS' if self.results['failed_corruptions'] <= self.results['total_tests'] * 0.01 else 'FAIL'}"
        )

        # Overall result
        overall_pass = (
            corruption_detection_rate >= 95
            and rollback_rate >= 90
            and crash_rate <= 5
            and self.results["failed_corruptions"] <= self.results["total_tests"] * 0.01
        )

        print(f"\nOVERALL RESULT: {'PASS' if overall_pass else 'FAIL'}")


def main():
    parser = argparse.ArgumentParser(description="EdgePlug Hot-Swap Chaos Test")
    parser.add_argument("--device", required=True, help="Serial device")
    parser.add_argument(
        "--iterations", type=int, default=100, help="Number of iterations"
    )
    parser.add_argument("--output", help="Output results to file")

    args = parser.parse_args()

    # Create chaos test
    chaos_test = HotSwapChaosTest(args.device, args.iterations)

    try:
        # Connect to device
        if not chaos_test.connect():
            print("Failed to connect to device")
            return 1

        # Run chaos test
        chaos_test.run_chaos_test()

        # Print results
        chaos_test.print_results()

        # Save results to file if requested
        if args.output:
            with open(args.output, "w") as f:
                json.dump(chaos_test.results, f, indent=2)
            print(f"Results saved to {args.output}")

        # Return success/failure
        corruption_detection_rate = (
            (
                chaos_test.results["corruption_detected"]
                / chaos_test.results["total_tests"]
            )
            * 100
            if chaos_test.results["total_tests"] > 0
            else 0
        )
        rollback_rate = (
            (chaos_test.results["auto_rollbacks"] / chaos_test.results["total_tests"])
            * 100
            if chaos_test.results["total_tests"] > 0
            else 0
        )
        crash_rate = (
            (chaos_test.results["system_crashes"] / chaos_test.results["total_tests"])
            * 100
            if chaos_test.results["total_tests"] > 0
            else 0
        )
        failed_corruptions_ok = (
            chaos_test.results["failed_corruptions"]
            <= chaos_test.results["total_tests"] * 0.01
        )

        if (
            corruption_detection_rate >= 95
            and rollback_rate >= 90
            and crash_rate <= 5
            and failed_corruptions_ok
        ):
            return 0
        else:
            return 1

    except KeyboardInterrupt:
        print("\nTest interrupted by user")
        return 1

    except Exception as e:
        print(f"Test failed: {e}")
        return 1

    finally:
        chaos_test.disconnect()


if __name__ == "__main__":
    sys.exit(main())
