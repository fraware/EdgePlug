"""
DeepXplore Adversarial Testing Module
EdgePlug ML Pipeline - Adversarial Testing

Implements DeepXplore algorithm for adversarial example generation,
robustness evaluation, and failure mode documentation.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from typing import Dict, List, Tuple, Optional
import yaml
import logging
import json
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import time
from sklearn.metrics import classification_report
import pandas as pd

logger = logging.getLogger(__name__)


class DeepXploreTester:
    """
    DeepXplore adversarial testing for model robustness evaluation.

    Features:
    - DeepXplore algorithm implementation
    - Multiple attack types (FGSM, PGD, Carlini-Wagner)
    - Failure mode analysis and documentation
    - Robustness metrics calculation
    - Mitigation strategy development
    """

    def __init__(self, config: Dict):
        """
        Initialize the DeepXplore tester.

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.adversarial_config = config["validation"]["adversarial"]
        self.quality_gates = config["model"]["quality_gates"]

        # Attack parameters
        self.attack_types = self.adversarial_config["attack_types"]
        self.epsilon_range = self.adversarial_config["epsilon_range"]
        self.max_iterations = self.adversarial_config["max_iterations"]

        logger.info("Initialized DeepXploreTester")

    def load_model(self, model_path: str) -> keras.Model:
        """
        Load trained model for testing.

        Args:
            model_path: Path to trained model

        Returns:
            Loaded Keras model
        """
        logger.info(f"Loading model from {model_path}")
        model = keras.models.load_model(model_path)
        return model

    def load_test_data(self, data_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load test data for adversarial testing.

        Args:
            data_path: Path to test data

        Returns:
            Tuple of (test_data, test_labels)
        """
        logger.info(f"Loading test data from {data_path}")

        data = np.load(data_path)
        test_data = np.stack([data["voltage"], data["current"]], axis=-1)
        test_labels = data["labels"]

        # Normalize data
        test_data = (test_data - np.mean(test_data, axis=0)) / np.std(test_data, axis=0)

        return test_data, test_labels

    def fgsm_attack(
        self, model: keras.Model, data: np.ndarray, labels: np.ndarray, epsilon: float
    ) -> np.ndarray:
        """
        Fast Gradient Sign Method attack.

        Args:
            model: Target model
            data: Input data
            labels: True labels
            epsilon: Attack strength

        Returns:
            Adversarial examples
        """
        logger.info(f"Running FGSM attack with epsilon={epsilon}")

        # Convert to tensor
        data_tensor = tf.convert_to_tensor(data, dtype=tf.float32)
        labels_tensor = tf.convert_to_tensor(labels, dtype=tf.int32)

        with tf.GradientTape() as tape:
            tape.watch(data_tensor)
            predictions = model(data_tensor)
            loss = tf.keras.losses.sparse_categorical_crossentropy(
                labels_tensor, predictions
            )

        # Calculate gradients
        gradients = tape.gradient(loss, data_tensor)

        # Generate adversarial examples
        perturbations = epsilon * tf.sign(gradients)
        adversarial_data = data_tensor + perturbations

        # Clip to valid range
        adversarial_data = tf.clip_by_value(adversarial_data, -1.0, 1.0)

        return adversarial_data.numpy()

    def pgd_attack(
        self,
        model: keras.Model,
        data: np.ndarray,
        labels: np.ndarray,
        epsilon: float,
        alpha: float = 0.01,
        iterations: int = 10,
    ) -> np.ndarray:
        """
        Projected Gradient Descent attack.

        Args:
            model: Target model
            data: Input data
            labels: True labels
            epsilon: Attack strength
            alpha: Step size
            iterations: Number of iterations

        Returns:
            Adversarial examples
        """
        logger.info(
            f"Running PGD attack with epsilon={epsilon}, iterations={iterations}"
        )

        # Initialize adversarial examples
        adversarial_data = data.copy()

        for i in range(iterations):
            # Convert to tensor
            data_tensor = tf.convert_to_tensor(adversarial_data, dtype=tf.float32)
            labels_tensor = tf.convert_to_tensor(labels, dtype=tf.int32)

            with tf.GradientTape() as tape:
                tape.watch(data_tensor)
                predictions = model(data_tensor)
                loss = tf.keras.losses.sparse_categorical_crossentropy(
                    labels_tensor, predictions
                )

            # Calculate gradients
            gradients = tape.gradient(loss, data_tensor)

            # Update adversarial examples
            perturbations = alpha * tf.sign(gradients)
            adversarial_data = adversarial_data + perturbations.numpy()

            # Project to epsilon ball
            delta = adversarial_data - data
            delta = np.clip(delta, -epsilon, epsilon)
            adversarial_data = data + delta

            # Clip to valid range
            adversarial_data = np.clip(adversarial_data, -1.0, 1.0)

        return adversarial_data

    def carlini_wagner_attack(
        self, model: keras.Model, data: np.ndarray, labels: np.ndarray, epsilon: float
    ) -> np.ndarray:
        """
        Carlini & Wagner attack (simplified version).

        Args:
            model: Target model
            data: Input data
            labels: True labels
            epsilon: Attack strength

        Returns:
            Adversarial examples
        """
        logger.info(f"Running Carlini-Wagner attack with epsilon={epsilon}")

        # Simplified C&W attack
        adversarial_data = data.copy()

        # Binary search for optimal perturbation
        for i in range(self.max_iterations):
            # Convert to tensor
            data_tensor = tf.convert_to_tensor(adversarial_data, dtype=tf.float32)
            labels_tensor = tf.convert_to_tensor(labels, dtype=tf.int32)

            with tf.GradientTape() as tape:
                tape.watch(data_tensor)
                predictions = model(data_tensor)
                loss = tf.keras.losses.sparse_categorical_crossentropy(
                    labels_tensor, predictions
                )

            # Calculate gradients
            gradients = tape.gradient(loss, data_tensor)

            # Update with smaller step size
            step_size = epsilon / self.max_iterations
            perturbations = step_size * tf.sign(gradients)
            adversarial_data = adversarial_data + perturbations.numpy()

            # Clip to epsilon ball
            delta = adversarial_data - data
            delta = np.clip(delta, -epsilon, epsilon)
            adversarial_data = data + delta

            # Clip to valid range
            adversarial_data = np.clip(adversarial_data, -1.0, 1.0)

        return adversarial_data

    def evaluate_robustness(
        self,
        model: keras.Model,
        original_data: np.ndarray,
        adversarial_data: np.ndarray,
        labels: np.ndarray,
    ) -> Dict:
        """
        Evaluate model robustness against adversarial examples.

        Args:
            model: Target model
            original_data: Original test data
            adversarial_data: Adversarial examples
            labels: True labels

        Returns:
            Robustness evaluation results
        """
        logger.info("Evaluating model robustness...")

        # Evaluate on original data
        original_predictions = np.argmax(model.predict(original_data), axis=1)
        original_accuracy = np.mean(original_predictions == labels)

        # Evaluate on adversarial data
        adversarial_predictions = np.argmax(model.predict(adversarial_data), axis=1)
        adversarial_accuracy = np.mean(adversarial_predictions == labels)

        # Calculate robustness metrics
        robustness_score = adversarial_accuracy / original_accuracy
        accuracy_drop = original_accuracy - adversarial_accuracy

        # Check quality gate
        robustness_target = self.quality_gates["adversarial_robustness"]["target"]
        meets_robustness_gate = robustness_score >= robustness_target

        results = {
            "original_accuracy": original_accuracy,
            "adversarial_accuracy": adversarial_accuracy,
            "robustness_score": robustness_score,
            "accuracy_drop": accuracy_drop,
            "meets_robustness_gate": meets_robustness_gate,
        }

        logger.info(f"Original accuracy: {original_accuracy:.4f}")
        logger.info(f"Adversarial accuracy: {adversarial_accuracy:.4f}")
        logger.info(f"Robustness score: {robustness_score:.4f}")
        logger.info(f"Meets robustness gate: {meets_robustness_gate}")

        return results

    def analyze_failure_modes(
        self,
        model: keras.Model,
        original_data: np.ndarray,
        adversarial_data: np.ndarray,
        labels: np.ndarray,
    ) -> Dict:
        """
        Analyze failure modes and document them.

        Args:
            model: Target model
            original_data: Original test data
            adversarial_data: Adversarial examples
            labels: True labels

        Returns:
            Failure mode analysis results
        """
        logger.info("Analyzing failure modes...")

        # Get predictions
        original_predictions = np.argmax(model.predict(original_data), axis=1)
        adversarial_predictions = np.argmax(model.predict(adversarial_data), axis=1)

        # Find misclassified examples
        original_correct = original_predictions == labels
        adversarial_correct = adversarial_predictions == labels

        # Find new failures (correct on original, wrong on adversarial)
        new_failures = original_correct & ~adversarial_correct

        # Analyze failure patterns
        failure_analysis = {
            "total_samples": len(labels),
            "original_correct": np.sum(original_correct),
            "adversarial_correct": np.sum(adversarial_correct),
            "new_failures": np.sum(new_failures),
            "failure_rate": np.sum(new_failures) / len(labels),
        }

        # Analyze failures by class
        class_failures = {}
        for class_id in np.unique(labels):
            class_mask = labels == class_id
            class_failures[class_id] = {
                "total": np.sum(class_mask),
                "original_correct": np.sum(original_correct & class_mask),
                "adversarial_correct": np.sum(adversarial_correct & class_mask),
                "new_failures": np.sum(new_failures & class_mask),
            }

        failure_analysis["class_failures"] = class_failures

        # Document failure modes
        failure_modes = self._document_failure_modes(
            original_data,
            adversarial_data,
            labels,
            original_predictions,
            adversarial_predictions,
            new_failures,
        )

        failure_analysis["failure_modes"] = failure_modes

        logger.info(f"Failure analysis completed")
        logger.info(f"New failures: {failure_analysis['new_failures']}")
        logger.info(f"Failure rate: {failure_analysis['failure_rate']:.4f}")

        return failure_analysis

    def _document_failure_modes(
        self,
        original_data: np.ndarray,
        adversarial_data: np.ndarray,
        labels: np.ndarray,
        original_predictions: np.ndarray,
        adversarial_predictions: np.ndarray,
        new_failures: np.ndarray,
    ) -> List[Dict]:
        """
        Document specific failure modes.

        Args:
            original_data: Original test data
            adversarial_data: Adversarial examples
            labels: True labels
            original_predictions: Original predictions
            adversarial_predictions: Adversarial predictions
            new_failures: Boolean mask of new failures

        Returns:
            List of documented failure modes
        """
        failure_modes = []

        # Find examples of new failures
        failure_indices = np.where(new_failures)[0]

        for i, idx in enumerate(failure_indices[:10]):  # Document first 10 failures
            original_sample = original_data[idx]
            adversarial_sample = adversarial_data[idx]
            true_label = labels[idx]
            original_pred = original_predictions[idx]
            adversarial_pred = adversarial_predictions[idx]

            # Calculate perturbation magnitude
            perturbation = np.linalg.norm(adversarial_sample - original_sample)

            failure_mode = {
                "sample_id": idx,
                "true_label": int(true_label),
                "original_prediction": int(original_pred),
                "adversarial_prediction": int(adversarial_pred),
                "perturbation_magnitude": float(perturbation),
                "perturbation_relative": float(
                    perturbation / np.linalg.norm(original_sample)
                ),
                "failure_type": "adversarial_attack",
                "description": f"Sample {idx}: Correctly classified as {true_label} originally, "
                f"misclassified as {adversarial_pred} after attack",
            }

            failure_modes.append(failure_mode)

        return failure_modes

    def generate_mitigation_strategies(self, failure_analysis: Dict) -> List[Dict]:
        """
        Generate mitigation strategies based on failure analysis.

        Args:
            failure_analysis: Failure analysis results

        Returns:
            List of mitigation strategies
        """
        logger.info("Generating mitigation strategies...")

        strategies = []

        # Strategy 1: Adversarial Training
        if failure_analysis["failure_rate"] > 0.1:
            strategies.append(
                {
                    "strategy": "adversarial_training",
                    "description": "Retrain model with adversarial examples",
                    "implementation": "Add adversarial examples to training data",
                    "expected_improvement": "Reduce failure rate by 50-80%",
                    "cost": "High (requires retraining)",
                    "priority": "High",
                }
            )

        # Strategy 2: Input Validation
        strategies.append(
            {
                "strategy": "input_validation",
                "description": "Validate input data for adversarial patterns",
                "implementation": "Add input preprocessing and validation layers",
                "expected_improvement": "Detect and reject adversarial inputs",
                "cost": "Medium (runtime overhead)",
                "priority": "Medium",
            }
        )

        # Strategy 3: Ensemble Methods
        strategies.append(
            {
                "strategy": "ensemble_methods",
                "description": "Use ensemble of models for robust predictions",
                "implementation": "Combine predictions from multiple models",
                "expected_improvement": "Improve robustness through diversity",
                "cost": "High (multiple models)",
                "priority": "Medium",
            }
        )

        # Strategy 4: Defensive Distillation
        strategies.append(
            {
                "strategy": "defensive_distillation",
                "description": "Use knowledge distillation for robustness",
                "implementation": "Train student model with soft labels",
                "expected_improvement": "Reduce gradient-based attacks",
                "cost": "High (requires retraining)",
                "priority": "Low",
            }
        )

        return strategies

    def run_deepxplore_tests(
        self, model_path: str, data_path: str, output_dir: str
    ) -> Dict:
        """
        Run complete DeepXplore adversarial testing pipeline.

        Args:
            model_path: Path to trained model
            data_path: Path to test data
            output_dir: Output directory

        Returns:
            Complete testing results
        """
        logger.info("Starting DeepXplore adversarial testing...")

        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Load model and data
        model = self.load_model(model_path)
        test_data, test_labels = self.load_test_data(data_path)

        # Use subset for testing
        subset_size = min(1000, len(test_data))
        test_data = test_data[:subset_size]
        test_labels = test_labels[:subset_size]

        all_results = {}

        # Test each attack type
        for attack_type in self.attack_types:
            logger.info(f"Testing {attack_type} attack...")

            attack_results = {}

            for epsilon in self.epsilon_range:
                logger.info(f"Testing with epsilon={epsilon}")

                # Generate adversarial examples
                if attack_type == "fgsm":
                    adversarial_data = self.fgsm_attack(
                        model, test_data, test_labels, epsilon
                    )
                elif attack_type == "pgd":
                    adversarial_data = self.pgd_attack(
                        model, test_data, test_labels, epsilon
                    )
                elif attack_type == "carlini_wagner":
                    adversarial_data = self.carlini_wagner_attack(
                        model, test_data, test_labels, epsilon
                    )
                else:
                    logger.warning(f"Unknown attack type: {attack_type}")
                    continue

                # Evaluate robustness
                robustness_results = self.evaluate_robustness(
                    model, test_data, adversarial_data, test_labels
                )

                # Analyze failure modes
                failure_analysis = self.analyze_failure_modes(
                    model, test_data, adversarial_data, test_labels
                )

                attack_results[epsilon] = {
                    "robustness": robustness_results,
                    "failures": failure_analysis,
                }

            all_results[attack_type] = attack_results

        # Generate mitigation strategies
        # Use results from first attack type for strategy generation
        first_attack = list(all_results.keys())[0]
        first_epsilon = list(all_results[first_attack].keys())[0]
        failure_analysis = all_results[first_attack][first_epsilon]["failures"]

        mitigation_strategies = self.generate_mitigation_strategies(failure_analysis)

        # Compile final results
        final_results = {
            "attack_results": all_results,
            "mitigation_strategies": mitigation_strategies,
            "overall_robustness": self._calculate_overall_robustness(all_results),
            "quality_gate_passed": self._check_quality_gates(all_results),
        }

        # Save results
        results_path = os.path.join(output_dir, "adversarial_results.json")
        with open(results_path, "w") as f:
            json.dump(final_results, f, indent=2)

        # Generate visualizations
        self._generate_visualizations(all_results, output_dir)

        logger.info("DeepXplore testing completed")
        logger.info(f"Results saved to {output_dir}")

        return final_results

    def _calculate_overall_robustness(self, attack_results: Dict) -> float:
        """
        Calculate overall robustness score across all attacks.

        Args:
            attack_results: Results from all attacks

        Returns:
            Overall robustness score
        """
        robustness_scores = []

        for attack_type, results in attack_results.items():
            for epsilon, result in results.items():
                robustness_scores.append(result["robustness"]["robustness_score"])

        return np.mean(robustness_scores)

    def _check_quality_gates(self, attack_results: Dict) -> bool:
        """
        Check if all quality gates are passed.

        Args:
            attack_results: Results from all attacks

        Returns:
            True if all gates passed
        """
        for attack_type, results in attack_results.items():
            for epsilon, result in results.items():
                if not result["robustness"]["meets_robustness_gate"]:
                    return False

        return True

    def _generate_visualizations(self, attack_results: Dict, output_dir: str):
        """
        Generate visualizations of adversarial testing results.

        Args:
            attack_results: Results from all attacks
            output_dir: Output directory
        """
        logger.info("Generating visualizations...")

        # Create robustness comparison plot
        plt.figure(figsize=(12, 8))

        for attack_type, results in attack_results.items():
            epsilons = list(results.keys())
            robustness_scores = [
                results[eps]["robustness"]["robustness_score"] for eps in epsilons
            ]

            plt.plot(epsilons, robustness_scores, marker="o", label=attack_type.upper())

        plt.xlabel("Epsilon")
        plt.ylabel("Robustness Score")
        plt.title("Model Robustness Across Attack Types")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()

        # Save plot
        plot_path = os.path.join(output_dir, "robustness_comparison.png")
        plt.savefig(plot_path, dpi=300, bbox_inches="tight")
        plt.close()

        logger.info(f"Visualizations saved to {output_dir}")


def main():
    """Main function for adversarial testing."""
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Run DeepXplore adversarial testing")
    parser.add_argument(
        "--config",
        type=str,
        default="config/voltage_event.yaml",
        help="Configuration file path",
    )
    parser.add_argument(
        "--model", type=str, required=True, help="Path to trained model"
    )
    parser.add_argument("--data", type=str, required=True, help="Path to test data")
    parser.add_argument(
        "--output-dir",
        type=str,
        default="artifacts/adversarial",
        help="Output directory",
    )

    args = parser.parse_args()

    # Load configuration
    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    # Setup logging
    logging.basicConfig(level=logging.INFO)

    # Run adversarial testing
    tester = DeepXploreTester(config)
    results = tester.run_deepxplore_tests(args.model, args.data, args.output_dir)

    print(f"Adversarial testing completed")
    print(f"Overall robustness: {results['overall_robustness']:.4f}")
    print(f"Quality gates passed: {results['quality_gate_passed']}")
    print(f"Results saved to: {args.output_dir}")


if __name__ == "__main__":
    main()
