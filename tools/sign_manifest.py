#!/usr/bin/env python3
"""
EdgePlug Manifest Signing Tool

This tool signs agent manifests with Ed25519 signatures and SHA-512 hashing
for cryptographic verification and secure boot.

Usage:
    python sign_manifest.py --manifest manifest.proto --key private_key.pem \
        --output signed_manifest.proto
    python sign_manifest.py --verify --manifest signed_manifest.proto \
        --key public_key.pem
"""

import argparse
import sys
import os
import hashlib
import base64
from typing import Optional, Tuple

# Protocol Buffers
try:
    import google.protobuf.text_format as text_format
except ImportError:
    print("Error: protobuf library not found. Install with: pip install protobuf")
    sys.exit(1)

# Try to import the generated protobuf
try:
    import manifest_pb2
except ImportError:
    print(
        "Error: manifest_pb2 not found. Generate with: "
        "protoc --python_out=. manifest.proto"
    )
    sys.exit(1)

# Cryptographic libraries
try:
    import nacl.signing
    import nacl.encoding
except ImportError:
    print("Error: PyNaCl library not found. Install with: pip install pynacl")
    sys.exit(1)


class ManifestSigner:
    """Manifest signing and verification utility"""

    def __init__(self):
        self.signing_key: Optional[nacl.signing.SigningKey] = None
        self.verify_key: Optional[nacl.signing.VerifyKey] = None

    def load_private_key(self, key_path: str) -> None:
        """Load private key from file"""
        try:
            with open(key_path, "rb") as f:
                key_data = f.read()

            # Handle PEM format
            if b"-----BEGIN" in key_data:
                key_data = self._extract_pem_key(key_data)

            self.signing_key = nacl.signing.SigningKey(key_data)
            print(f"Loaded private key from {key_path}")

        except Exception as e:
            raise ValueError(f"Failed to load private key: {e}")

    def load_public_key(self, key_path: str) -> None:
        """Load public key from file"""
        try:
            with open(key_path, "rb") as f:
                key_data = f.read()

            # Handle PEM format
            if b"-----BEGIN" in key_data:
                key_data = self._extract_pem_key(key_data)

            self.verify_key = nacl.signing.VerifyKey(key_data)
            print(f"Loaded public key from {key_path}")

        except Exception as e:
            raise ValueError(f"Failed to load public key: {e}")

    def _extract_pem_key(self, pem_data: bytes) -> bytes:
        """Extract key data from PEM format"""
        lines = pem_data.decode("ascii").split("\n")
        key_lines = []
        in_key = False

        for line in lines:
            if "-----BEGIN" in line:
                in_key = True
                continue
            elif "-----END" in line:
                break
            elif in_key and line.strip():
                key_lines.append(line.strip())

        if not key_lines:
            raise ValueError("No key data found in PEM file")

        return base64.b64decode("".join(key_lines))

    def generate_keypair(self, output_dir: str) -> Tuple[str, str]:
        """Generate new Ed25519 keypair"""
        signing_key = nacl.signing.SigningKey.generate()
        verify_key = signing_key.verify_key

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Save private key
        private_key_path = os.path.join(output_dir, "private_key.pem")
        with open(private_key_path, "wb") as f:
            f.write(b"-----BEGIN PRIVATE KEY-----\n")
            f.write(base64.b64encode(signing_key.encode()))
            f.write(b"\n-----END PRIVATE KEY-----\n")

        # Save public key
        public_key_path = os.path.join(output_dir, "public_key.pem")
        with open(public_key_path, "wb") as f:
            f.write(b"-----BEGIN PUBLIC KEY-----\n")
            f.write(base64.b64encode(verify_key.encode()))
            f.write(b"\n-----END PUBLIC KEY-----\n")

        print(f"Generated keypair:")
        print(f"  Private key: {private_key_path}")
        print(f"  Public key: {public_key_path}")

        return private_key_path, public_key_path

    def load_manifest(self, manifest_path: str) -> manifest_pb2.AgentManifest:
        """Load manifest from file"""
        try:
            manifest = manifest_pb2.AgentManifest()

            # Try binary format first
            try:
                with open(manifest_path, "rb") as f:
                    manifest.ParseFromString(f.read())
                print(f"Loaded binary manifest from {manifest_path}")
                return manifest
            except:
                pass

            # Try text format
            try:
                with open(manifest_path, "r") as f:
                    text_format.Parse(f.read(), manifest)
                print(f"Loaded text manifest from {manifest_path}")
                return manifest
            except:
                pass

            raise ValueError("Could not parse manifest file")

        except Exception as e:
            raise ValueError(f"Failed to load manifest: {e}")

    def save_manifest(
        self,
        manifest: manifest_pb2.AgentManifest,
        output_path: str,
        binary: bool = True,
    ) -> None:
        """Save manifest to file"""
        try:
            if binary:
                with open(output_path, "wb") as f:
                    f.write(manifest.SerializeToString())
                print(f"Saved binary manifest to {output_path}")
            else:
                with open(output_path, "w") as f:
                    f.write(text_format.MessageToString(manifest))
                print(f"Saved text manifest to {output_path}")

        except Exception as e:
            raise ValueError(f"Failed to save manifest: {e}")

    def calculate_manifest_hash(self, manifest: manifest_pb2.AgentManifest) -> bytes:
        """Calculate SHA-512 hash of manifest (excluding signatures)"""
        # Create a copy without signatures for hashing
        manifest_copy = manifest_pb2.AgentManifest()
        manifest_copy.CopyFrom(manifest)
        manifest_copy.signatures.clear()

        # Serialize and hash
        data = manifest_copy.SerializeToString()
        return hashlib.sha512(data).digest()

    def sign_manifest(
        self,
        manifest: manifest_pb2.AgentManifest,
        signer_identity: str,
        scope: str = "FULL",
    ) -> None:
        """Sign manifest with Ed25519"""
        if not self.signing_key:
            raise ValueError("No signing key loaded")

        # Calculate hash
        manifest_hash = self.calculate_manifest_hash(manifest)

        # Create signature
        signature_data = self.signing_key.sign(manifest_hash)

        # Create signature message
        signature = manifest.signatures.add()
        signature.algorithm = manifest_pb2.SIGNATURE_ALGORITHM_ED25519
        signature.public_key = self.signing_key.verify_key.encode()
        signature.signature_data = signature_data.signature
        signature.timestamp.GetCurrentTime()
        signature.signer_identity = signer_identity

        # Set signature scope
        if scope == "MANIFEST":
            signature.scope = manifest_pb2.SIGNATURE_SCOPE_MANIFEST
        elif scope == "MODEL":
            signature.scope = manifest_pb2.SIGNATURE_SCOPE_MODEL
        elif scope == "CODE":
            signature.scope = manifest_pb2.SIGNATURE_SCOPE_CODE
        else:
            signature.scope = manifest_pb2.SIGNATURE_SCOPE_FULL

        print(f"Signed manifest with {signer_identity} (scope: {scope})")

    def verify_manifest(self, manifest: manifest_pb2.AgentManifest) -> bool:
        """Verify manifest signatures"""
        if not self.verify_key:
            raise ValueError("No verification key loaded")

        if not manifest.signatures:
            print("Warning: No signatures found in manifest")
            return False

        # Calculate expected hash
        expected_hash = self.calculate_manifest_hash(manifest)

        # Verify each signature
        for i, signature in enumerate(manifest.signatures):
            try:
                # Verify signature
                verify_key = nacl.signing.VerifyKey(signature.public_key)
                verify_key.verify(expected_hash, signature.signature_data)

                print(f"✓ Signature {i+1} verified:")
                print(f"  Signer: {signature.signer_identity}")
                print(f"  Algorithm: {signature.algorithm}")
                print(f"  Scope: {signature.scope}")
                print(f"  Timestamp: {signature.timestamp.ToDatetime()}")

            except Exception as e:
                print(f"✗ Signature {i+1} verification failed: {e}")
                return False

        return True

    def create_example_manifest(self) -> manifest_pb2.AgentManifest:
        """Create an example voltage event agent manifest"""
        manifest = manifest_pb2.AgentManifest()

        # Identity
        manifest.identity.agent_id = "voltage-event-agent-v1.0.0"
        manifest.identity.name = "Voltage Event Detection Agent"
        manifest.identity.description = (
            "ML agent for detecting voltage sags and swells in power systems"
        )
        manifest.identity.type = manifest_pb2.AGENT_TYPE_VOLTAGE_EVENT
        manifest.identity.tags.extend(["voltage", "power-quality", "ml", "real-time"])

        # Vendor info
        manifest.identity.vendor.name = "EdgePlug Inc."
        manifest.identity.vendor.vendor_id = "edgeplug"
        manifest.identity.vendor.contact_email = "support@edgeplug.com"
        manifest.identity.vendor.website = "https://edgeplug.com"

        # Version info
        manifest.version.semantic_version = "1.0.0"
        manifest.version.build_number = 42
        manifest.version.build_timestamp.GetCurrentTime()
        manifest.version.git_commit = "a1b2c3d4e5f6"
        manifest.version.build_environment = "EdgePlug CI/CD Pipeline"
        manifest.version.release_notes = (
            "Initial release of voltage event detection agent"
        )

        # Compatibility
        compat = manifest.version.compatibility.add()
        compat.runtime_version = "1.0.0"
        compat.hardware_platform = "Cortex-M4F"
        compat.min_firmware_version = "1.0.0"
        compat.max_firmware_version = "2.0.0"

        # Safety specifications
        manifest.safety.safety_level = manifest_pb2.SAFETY_LEVEL_SIL_2

        # Input validation
        voltage_input = manifest.safety.input_validation.add()
        voltage_input.input_name = "voltage"
        voltage_input.data_type = manifest_pb2.DATA_TYPE_FLOAT32
        voltage_input.range.min_value = 0.8  # 80% of nominal
        voltage_input.range.max_value = 1.2  # 120% of nominal
        voltage_input.range.default_value = 1.0
        voltage_input.rate_limit.max_samples_per_second = 1000
        voltage_input.quality.min_quality_score = 0.9
        voltage_input.quality.max_age_seconds = 1

        current_input = manifest.safety.input_validation.add()
        current_input.input_name = "current"
        current_input.data_type = manifest_pb2.DATA_TYPE_FLOAT32
        current_input.range.min_value = 0.5  # 50% of nominal
        current_input.range.max_value = 2.0  # 200% of nominal
        current_input.range.default_value = 1.0
        current_input.rate_limit.max_samples_per_second = 1000
        current_input.quality.min_quality_score = 0.9
        current_input.quality.max_age_seconds = 1

        # Output constraints
        event_output = manifest.safety.output_constraints.add()
        event_output.output_name = "voltage_event"
        event_output.data_type = manifest_pb2.DATA_TYPE_BOOL
        event_output.range.min_value = 0
        event_output.range.max_value = 1
        event_output.rate_limit.max_samples_per_second = 10
        event_output.safety_bounds.critical_min = 0
        event_output.safety_bounds.critical_max = 1
        event_output.safety_bounds.fail_safe_value = 0

        # Invariants
        voltage_invariant = manifest.safety.invariants.add()
        voltage_invariant.name = "voltage_bounds"
        voltage_invariant.description = "Voltage must be within safe bounds"
        voltage_invariant.expression = "voltage >= 0.8 AND voltage <= 1.2"
        voltage_invariant.severity = manifest_pb2.INVARIANT_SEVERITY_CRITICAL
        voltage_invariant.timeout_us = 1000
        voltage_invariant.priority = 1

        # Fail-safe behavior
        manifest.safety.fail_safe.action = manifest_pb2.FAIL_SAFE_ACTION_SAFE_MODE
        manifest.safety.fail_safe.timeout_ms = 100
        manifest.safety.fail_safe.recovery.auto_recovery = True
        manifest.safety.fail_safe.recovery.recovery_timeout_seconds = 30
        manifest.safety.fail_safe.recovery.max_recovery_attempts = 3

        # Resource requirements
        manifest.resources.memory.flash_bytes = 16384  # 16KB
        manifest.resources.memory.sram_bytes = 4096  # 4KB
        manifest.resources.memory.stack_bytes = 2048  # 2KB
        manifest.resources.memory.heap_bytes = 0  # No heap

        manifest.resources.cpu.min_frequency_mhz = 80
        manifest.resources.cpu.max_cpu_usage_percent = 50
        manifest.resources.cpu.required_features.extend(["FPU", "DSP"])

        manifest.resources.storage.model_storage_bytes = 16384  # 16KB
        manifest.resources.storage.data_storage_bytes = 1024  # 1KB
        manifest.resources.storage.log_storage_bytes = 512  # 512B

        manifest.resources.network.required_bandwidth_bps = 1000  # 1 kbps
        manifest.resources.network.max_latency_ms = 100

        manifest.resources.power.idle_power_mw = 10
        manifest.resources.power.active_power_mw = 50
        manifest.resources.power.peak_power_mw = 100

        # Deployment configuration
        manifest.deployment.mode = manifest_pb2.DEPLOYMENT_MODE_STANDALONE
        manifest.deployment.update_strategy.type = manifest_pb2.UPDATE_TYPE_IMMEDIATE

        # Monitoring
        manifest.deployment.monitoring.metrics.endpoint = "/metrics"
        manifest.deployment.monitoring.metrics.interval_seconds = 60
        manifest.deployment.monitoring.logging.level = manifest_pb2.LOG_LEVEL_INFO
        manifest.deployment.monitoring.logging.format = manifest_pb2.LOG_FORMAT_JSON

        return manifest


def main():
    parser = argparse.ArgumentParser(description="EdgePlug Manifest Signing Tool")
    parser.add_argument("--manifest", help="Input manifest file")
    parser.add_argument("--output", help="Output manifest file")
    parser.add_argument("--key", help="Private/Public key file")
    parser.add_argument(
        "--verify", action="store_true", help="Verify manifest signatures"
    )
    parser.add_argument("--generate-keys", help="Generate new keypair in directory")
    parser.add_argument("--signer", default="edgeplug", help="Signer identity")
    parser.add_argument(
        "--scope",
        default="FULL",
        choices=["MANIFEST", "MODEL", "CODE", "FULL"],
        help="Signature scope",
    )
    parser.add_argument(
        "--example", action="store_true", help="Create example manifest"
    )
    parser.add_argument("--text", action="store_true", help="Output in text format")

    args = parser.parse_args()

    signer = ManifestSigner()

    try:
        # Generate keypair
        if args.generate_keys:
            private_key, public_key = signer.generate_keypair(args.generate_keys)
            print(f"Keypair generated successfully")
            return

        # Create example manifest
        if args.example:
            manifest = signer.create_example_manifest()
            output_path = args.output or "example_manifest.proto"
            signer.save_manifest(manifest, output_path, binary=not args.text)
            print(f"Example manifest created: {output_path}")
            return

        # Verify manifest
        if args.verify:
            if not args.manifest or not args.key:
                parser.error("--verify requires --manifest and --key")

            manifest = signer.load_manifest(args.manifest)
            signer.load_public_key(args.key)

            if signer.verify_manifest(manifest):
                print("✓ All signatures verified successfully")
                return 0
            else:
                print("✗ Signature verification failed")
                return 1

        # Sign manifest
        if not args.manifest or not args.key or not args.output:
            parser.error("Signing requires --manifest, --key, and --output")

        manifest = signer.load_manifest(args.manifest)
        signer.load_private_key(args.key)
        signer.sign_manifest(manifest, args.signer, args.scope)
        signer.save_manifest(manifest, args.output, binary=not args.text)

        print("Manifest signed successfully")
        return 0

    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
