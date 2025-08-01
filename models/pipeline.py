"""
EdgePlug ML Pipeline Orchestrator
Complete ML workflow from data generation to deployment

Orchestrates the entire pipeline with quality gates, reproducibility
verification, and automated deployment.
"""

import argparse
import logging
import yaml
import json
import os
import time
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import sys

# Import pipeline modules
from data.generator import VoltageEventGenerator
from training.train import ReproducibleTrainer
from quantization.quantize import CMSISNNQuantizer
from adversarial.deepxplore import DeepXploreTester

logger = logging.getLogger(__name__)


class EdgePlugPipeline:
    """
    Complete ML pipeline orchestrator for EdgePlug.

    Features:
    - End-to-end workflow orchestration
    - Quality gate validation at each stage
    - Reproducibility verification
    - Automated deployment
    - Comprehensive reporting
    """

    def __init__(self, config_path: str):
        """
        Initialize the pipeline.

        Args:
            config_path: Path to configuration file
        """
        self.config_path = config_path
        self.config = self._load_config(config_path)
        self.pipeline_hash = self._calculate_pipeline_hash()

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        )

        logger.info("Initialized EdgePlug ML Pipeline")
        logger.info(f"Pipeline hash: {self.pipeline_hash}")

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration file."""
        with open(config_path, "r") as f:
            return yaml.safe_load(f)

    def _calculate_pipeline_hash(self) -> str:
        """Calculate hash of pipeline configuration for reproducibility."""
        config_str = json.dumps(self.config, sort_keys=True)
        return hashlib.sha256(config_str.encode()).hexdigest()

    def run_data_generation(self) -> Dict:
        """Run data generation stage."""
        logger.info("=== STAGE 1: Data Generation ===")

        try:
            # Initialize generator
            generator = VoltageEventGenerator(self.config)

            # Generate dataset
            voltage_data, current_data, labels = generator.generate_dataset()

            # Save dataset
            output_path = "data/voltage_events.npz"
            generator.save_dataset(output_path, voltage_data, current_data, labels)

            # Generate visualizations
            if self.config.get("data", {}).get("synthetic", {}).get("visualize", False):
                for i in range(4):
                    mask = labels == i
                    if np.any(mask):
                        idx = np.where(mask)[0][0]
                        generator.visualize_sample(
                            voltage_data[idx],
                            current_data[idx],
                            labels[idx],
                            save_path=f"data/sample_class_{i}.png",
                        )

            results = {
                "stage": "data_generation",
                "status": "success",
                "dataset_path": output_path,
                "dataset_shape": voltage_data.shape,
                "class_distribution": np.bincount(labels).tolist(),
            }

            logger.info("Data generation completed successfully")
            return results

        except Exception as e:
            logger.error(f"Data generation failed: {e}")
            return {"stage": "data_generation", "status": "failed", "error": str(e)}

    def run_training(self, data_path: str) -> Dict:
        """Run training stage."""
        logger.info("=== STAGE 2: Model Training ===")

        try:
            # Initialize trainer
            trainer = ReproducibleTrainer(self.config)

            # Train model
            model_save_path = "artifacts/model.h5"
            results = trainer.train(data_path, model_save_path)

            # Verify reproducibility if enabled
            if self.config["reproducibility"]["double_run"]["enabled"]:
                logger.info("Running reproducibility verification...")
                trainer2 = ReproducibleTrainer(self.config)
                results2 = trainer2.train(
                    data_path, model_save_path.replace(".h5", "_run2.h5")
                )

                is_reproducible = trainer.verify_reproducibility(
                    results["model"], results2["model"]
                )

                results["reproducibility"] = {
                    "verified": is_reproducible,
                    "model_hash": trainer.calculate_model_hash(results["model"]),
                }

            training_results = {
                "stage": "training",
                "status": "success",
                "model_path": model_save_path,
                "metrics": results["metrics"],
                "reproducibility": results.get("reproducibility", {}),
            }

            logger.info("Training completed successfully")
            return training_results

        except Exception as e:
            logger.error(f"Training failed: {e}")
            return {"stage": "training", "status": "failed", "error": str(e)}

    def run_quantization(self, model_path: str, data_path: str) -> Dict:
        """Run quantization stage."""
        logger.info("=== STAGE 3: Model Quantization ===")

        try:
            # Initialize quantizer
            quantizer = CMSISNNQuantizer(self.config)

            # Run quantization pipeline
            output_dir = "artifacts/quantized"
            results = quantizer.quantize_pipeline(model_path, data_path, output_dir)

            quantization_results = {
                "stage": "quantization",
                "status": "success",
                "quantized_model_path": results["quantized_model_path"],
                "binary_size_bytes": results["binary_size_bytes"],
                "quality_gates_passed": results["all_gates_passed"],
                "validation": results["validation"],
                "performance": results["performance"],
            }

            logger.info("Quantization completed successfully")
            return quantization_results

        except Exception as e:
            logger.error(f"Quantization failed: {e}")
            return {"stage": "quantization", "status": "failed", "error": str(e)}

    def run_adversarial_testing(self, model_path: str, data_path: str) -> Dict:
        """Run adversarial testing stage."""
        logger.info("=== STAGE 4: Adversarial Testing ===")

        try:
            # Initialize tester
            tester = DeepXploreTester(self.config)

            # Run adversarial testing
            output_dir = "artifacts/adversarial"
            results = tester.run_deepxplore_tests(model_path, data_path, output_dir)

            adversarial_results = {
                "stage": "adversarial_testing",
                "status": "success",
                "overall_robustness": results["overall_robustness"],
                "quality_gate_passed": results["quality_gate_passed"],
                "mitigation_strategies": results["mitigation_strategies"],
            }

            logger.info("Adversarial testing completed successfully")
            return adversarial_results

        except Exception as e:
            logger.error(f"Adversarial testing failed: {e}")
            return {"stage": "adversarial_testing", "status": "failed", "error": str(e)}

    def run_validation(self, model_path: str, data_path: str) -> Dict:
        """Run final validation stage."""
        logger.info("=== STAGE 5: Final Validation ===")

        try:
            # Load model and data
            model = keras.models.load_model(model_path)
            data = np.load(data_path)

            # Evaluate on test set
            test_data = np.stack([data["voltage"], data["current"]], axis=-1)
            test_labels = data["labels"]

            # Normalize data
            test_data = (test_data - np.mean(test_data, axis=0)) / np.std(
                test_data, axis=0
            )

            # Evaluate model
            test_loss, test_acc = model.evaluate(test_data, test_labels, verbose=0)

            # Check quality gates
            precision_target = self.config["model"]["quality_gates"]["precision"][
                "target"
            ]
            meets_precision_gate = test_acc >= precision_target

            validation_results = {
                "stage": "validation",
                "status": "success",
                "test_accuracy": test_acc,
                "test_loss": test_loss,
                "meets_precision_gate": meets_precision_gate,
                "precision_target": precision_target,
            }

            logger.info("Validation completed successfully")
            return validation_results

        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return {"stage": "validation", "status": "failed", "error": str(e)}

    def check_quality_gates(self, results: List[Dict]) -> bool:
        """Check if all quality gates are passed."""
        logger.info("=== QUALITY GATE CHECK ===")

        all_passed = True

        for result in results:
            if result["status"] == "failed":
                logger.error(f"Stage {result['stage']} failed")
                all_passed = False
                continue

            # Check specific quality gates
            if result["stage"] == "training":
                if (
                    result["metrics"]["test_accuracy"]
                    < self.config["model"]["quality_gates"]["precision"]["target"]
                ):
                    logger.error(
                        f"Precision quality gate failed: {result['metrics']['test_accuracy']:.4f}"
                    )
                    all_passed = False

            elif result["stage"] == "quantization":
                if not result["quality_gates_passed"]:
                    logger.error("Quantization quality gates failed")
                    all_passed = False

            elif result["stage"] == "adversarial_testing":
                if not result["quality_gate_passed"]:
                    logger.error("Adversarial robustness quality gate failed")
                    all_passed = False

            elif result["stage"] == "validation":
                if not result["meets_precision_gate"]:
                    logger.error("Final precision quality gate failed")
                    all_passed = False

        if all_passed:
            logger.info("✅ All quality gates passed")
        else:
            logger.error("❌ Some quality gates failed")

        return all_passed

    def generate_report(self, results: List[Dict]) -> Dict:
        """Generate comprehensive pipeline report."""
        logger.info("=== GENERATING PIPELINE REPORT ===")

        report = {
            "pipeline_hash": self.pipeline_hash,
            "config_path": self.config_path,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "stages": results,
            "overall_status": (
                "success"
                if all(r["status"] == "success" for r in results)
                else "failed"
            ),
            "quality_gates_passed": self.check_quality_gates(results),
        }

        # Save report
        report_path = "artifacts/pipeline_report.json"
        os.makedirs(os.path.dirname(report_path), exist_ok=True)

        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Pipeline report saved to {report_path}")
        return report

    def run_pipeline(self, skip_stages: Optional[List[str]] = None) -> Dict:
        """
        Run complete pipeline.

        Args:
            skip_stages: List of stages to skip

        Returns:
            Pipeline results
        """
        logger.info("Starting EdgePlug ML Pipeline")
        logger.info(f"Configuration: {self.config_path}")

        if skip_stages:
            logger.info(f"Skipping stages: {skip_stages}")

        results = []

        # Stage 1: Data Generation
        if "data_generation" not in (skip_stages or []):
            result = self.run_data_generation()
            results.append(result)

            if result["status"] == "failed":
                logger.error("Pipeline failed at data generation stage")
                return self.generate_report(results)

        # Stage 2: Training
        if "training" not in (skip_stages or []):
            data_path = (
                results[0]["dataset_path"] if results else "data/voltage_events.npz"
            )
            result = self.run_training(data_path)
            results.append(result)

            if result["status"] == "failed":
                logger.error("Pipeline failed at training stage")
                return self.generate_report(results)

        # Stage 3: Quantization
        if "quantization" not in (skip_stages or []):
            model_path = (
                results[1]["model_path"] if len(results) > 1 else "artifacts/model.h5"
            )
            data_path = (
                results[0]["dataset_path"] if results else "data/voltage_events.npz"
            )
            result = self.run_quantization(model_path, data_path)
            results.append(result)

            if result["status"] == "failed":
                logger.error("Pipeline failed at quantization stage")
                return self.generate_report(results)

        # Stage 4: Adversarial Testing
        if "adversarial_testing" not in (skip_stages or []):
            model_path = (
                results[1]["model_path"] if len(results) > 1 else "artifacts/model.h5"
            )
            data_path = (
                results[0]["dataset_path"] if results else "data/voltage_events.npz"
            )
            result = self.run_adversarial_testing(model_path, data_path)
            results.append(result)

            if result["status"] == "failed":
                logger.error("Pipeline failed at adversarial testing stage")
                return self.generate_report(results)

        # Stage 5: Final Validation
        if "validation" not in (skip_stages or []):
            model_path = (
                results[1]["model_path"] if len(results) > 1 else "artifacts/model.h5"
            )
            data_path = (
                results[0]["dataset_path"] if results else "data/voltage_events.npz"
            )
            result = self.run_validation(model_path, data_path)
            results.append(result)

        # Generate final report
        report = self.generate_report(results)

        logger.info("Pipeline completed")
        logger.info(f"Overall status: {report['overall_status']}")
        logger.info(f"Quality gates passed: {report['quality_gates_passed']}")

        return report


def main():
    """Main function for pipeline execution."""
    parser = argparse.ArgumentParser(description="EdgePlug ML Pipeline")
    parser.add_argument(
        "--config",
        type=str,
        default="config/voltage_event.yaml",
        help="Configuration file path",
    )
    parser.add_argument(
        "--skip-stages",
        nargs="*",
        help="Stages to skip (data_generation, training, quantization, adversarial_testing, validation)",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Setup logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Run pipeline
    pipeline = EdgePlugPipeline(args.config)
    results = pipeline.run_pipeline(args.skip_stages)

    # Print summary
    print("\n" + "=" * 50)
    print("EDGEPLUG ML PIPELINE SUMMARY")
    print("=" * 50)
    print(f"Overall Status: {results['overall_status']}")
    print(f"Quality Gates Passed: {results['quality_gates_passed']}")
    print(f"Pipeline Hash: {results['pipeline_hash']}")
    print(f"Timestamp: {results['timestamp']}")
    print("=" * 50)

    if results["overall_status"] == "success":
        print("✅ Pipeline completed successfully!")
        sys.exit(0)
    else:
        print("❌ Pipeline failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
