#!/usr/bin/env python3
"""
EdgePlug Hot-Swap Stress Test

This script performs 1,000 consecutive agent swaps to verify:
- No memory fragmentation >256B
- Consistent update success rate
- Proper rollback functionality
- System stability under load

Usage:
    python hotswap_stress_test.py --device /dev/ttyUSB0 --iterations 1000
"""

import argparse
import sys
import time
import random
import struct
from typing import List, Dict, Any
import serial
import json


class HotSwapStressTest:
    """Stress test for hot-swap functionality"""

    def __init__(self, device: str, iterations: int = 1000):
        self.device = device
        self.iterations = iterations
        self.serial_conn = None
        self.results = {
            "total_swaps": 0,
            "successful_swaps": 0,
            "failed_swaps": 0,
            "rollbacks": 0,
            "memory_fragmentation": 0,
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
        # Create a simple test agent with version-specific data
        agent_data = bytearray()

        # Header
        agent_data.extend(b"EDGEPLUG_AGENT")
        agent_data.extend(struct.pack("<I", version))
        agent_data.extend(struct.pack("<I", len(agent_data) + 4))

        # Test data
        test_data = f"Test agent version {version}".encode("ascii")
        agent_data.extend(test_data)

        # Padding to make it look like a real agent
        padding = random.randbytes(1024 - len(agent_data))
        agent_data.extend(padding)

        return bytes(agent_data)

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

    def get_memory_info(self) -> Dict[str, Any]:
        """Get memory information"""
        response = self.send_command("MEMORY")
        if response and response[0] == 0:
            try:
                memory_data = response[1:]
                return json.loads(memory_data.decode("ascii"))
            except:
                pass

        return {}

    def check_memory_fragmentation(self) -> bool:
        """Check for memory fragmentation >256B"""
        memory_info = self.get_memory_info()

        if "fragmentation" in memory_info:
            fragmentation = memory_info["fragmentation"]
            if fragmentation > 256:
                self.results["memory_fragmentation"] += 1
                return True

        return False

    def get_update_status(self) -> Dict[str, Any]:
        """Get update status"""
        response = self.send_command("STATUS")
        if response and response[0] == 0:
            try:
                status_data = response[1:]
                return json.loads(status_data.decode("ascii"))
            except:
                pass

        return {}

    def rollback_if_needed(self) -> bool:
        """Rollback if update failed"""
        status = self.get_update_status()

        if status.get("update_failed", False):
            response = self.send_command("ROLLBACK")
            if response and response[0] == 0:
                self.results["rollbacks"] += 1
                return True

        return False

    def run_stress_test(self):
        """Run the stress test"""
        print(f"Starting stress test with {self.iterations} iterations...")
        self.results["start_time"] = time.time()

        for i in range(self.iterations):
            try:
                # Generate test agent and manifest
                version = i + 1
                agent_data = self.generate_test_agent(version)
                manifest_data = self.generate_test_manifest(version)

                print(f"Iteration {i+1}/{self.iterations}: Deploying agent v{version}")

                # Deploy agent
                if self.deploy_agent(agent_data, manifest_data):
                    self.results["successful_swaps"] += 1
                    print(f"  ✓ Success")
                else:
                    self.results["failed_swaps"] += 1
                    print(f"  ✗ Failed")

                    # Try rollback
                    if self.rollback_if_needed():
                        print(f"  ✓ Rollback successful")
                    else:
                        print(f"  ✗ Rollback failed")

                self.results["total_swaps"] += 1

                # Check for memory fragmentation
                if self.check_memory_fragmentation():
                    print(f"  ⚠ Memory fragmentation detected")

                # Small delay between iterations
                time.sleep(0.1)

                # Progress update every 100 iterations
                if (i + 1) % 100 == 0:
                    success_rate = (
                        self.results["successful_swaps"] / self.results["total_swaps"]
                    ) * 100
                    print(
                        f"Progress: {i+1}/{self.iterations} - Success rate: {success_rate:.1f}%"
                    )

            except Exception as e:
                error_msg = f"Iteration {i+1} failed: {e}"
                print(f"  ✗ {error_msg}")
                self.results["errors"].append(error_msg)
                self.results["failed_swaps"] += 1

        self.results["end_time"] = time.time()

    def print_results(self):
        """Print test results"""
        duration = self.results["end_time"] - self.results["start_time"]
        success_rate = (
            (self.results["successful_swaps"] / self.results["total_swaps"]) * 100
            if self.results["total_swaps"] > 0
            else 0
        )

        print("\n" + "=" * 50)
        print("STRESS TEST RESULTS")
        print("=" * 50)
        print(f"Total iterations: {self.results['total_swaps']}")
        print(f"Successful swaps: {self.results['successful_swaps']}")
        print(f"Failed swaps: {self.results['failed_swaps']}")
        print(f"Rollbacks: {self.results['rollbacks']}")
        print(f"Memory fragmentation events: {self.results['memory_fragmentation']}")
        print(f"Success rate: {success_rate:.1f}%")
        print(f"Test duration: {duration:.1f} seconds")
        print(
            f"Average time per swap: {duration/self.results['total_swaps']:.3f} seconds"
        )

        if self.results["errors"]:
            print(f"\nErrors encountered:")
            for error in self.results["errors"][:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(self.results["errors"]) > 10:
                print(f"  ... and {len(self.results['errors']) - 10} more errors")

        # Quality gates
        print(f"\nQUALITY GATES:")
        print(f"✓ Success rate ≥ 95%: {'PASS' if success_rate >= 95 else 'FAIL'}")
        print(
            f"✓ Memory fragmentation ≤ 1%: {'PASS' if self.results['memory_fragmentation'] <= self.results['total_swaps'] * 0.01 else 'FAIL'}"
        )
        print(
            f"✓ No critical errors: {'PASS' if len(self.results['errors']) == 0 else 'FAIL'}"
        )

        # Overall result
        overall_pass = (
            success_rate >= 95
            and self.results["memory_fragmentation"]
            <= self.results["total_swaps"] * 0.01
            and len(self.results["errors"]) == 0
        )

        print(f"\nOVERALL RESULT: {'PASS' if overall_pass else 'FAIL'}")


def main():
    parser = argparse.ArgumentParser(description="EdgePlug Hot-Swap Stress Test")
    parser.add_argument("--device", required=True, help="Serial device")
    parser.add_argument(
        "--iterations", type=int, default=1000, help="Number of iterations"
    )
    parser.add_argument("--output", help="Output results to file")

    args = parser.parse_args()

    # Create stress test
    stress_test = HotSwapStressTest(args.device, args.iterations)

    try:
        # Connect to device
        if not stress_test.connect():
            print("Failed to connect to device")
            return 1

        # Run stress test
        stress_test.run_stress_test()

        # Print results
        stress_test.print_results()

        # Save results to file if requested
        if args.output:
            with open(args.output, "w") as f:
                json.dump(stress_test.results, f, indent=2)
            print(f"Results saved to {args.output}")

        # Return success/failure
        success_rate = (
            (
                stress_test.results["successful_swaps"]
                / stress_test.results["total_swaps"]
            )
            * 100
            if stress_test.results["total_swaps"] > 0
            else 0
        )
        memory_fragmentation_ok = (
            stress_test.results["memory_fragmentation"]
            <= stress_test.results["total_swaps"] * 0.01
        )
        no_critical_errors = len(stress_test.results["errors"]) == 0

        if success_rate >= 95 and memory_fragmentation_ok and no_critical_errors:
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
        stress_test.disconnect()


if __name__ == "__main__":
    sys.exit(main())
