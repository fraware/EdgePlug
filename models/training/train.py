"""
Reproducible Model Training Pipeline
EdgePlug ML Pipeline - Training Module

Implements deterministic training with quality gate validation,
model architecture optimization, and experiment tracking.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from typing import Dict, Tuple, Optional, List
import yaml
import logging
import mlflow
import hashlib
import json
from pathlib import Path
import time
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

logger = logging.getLogger(__name__)


class ReproducibleTrainer:
    """
    Reproducible model trainer with quality gate validation.

    Features:
    - Deterministic training with fixed seeds
    - Model architecture optimization for size constraints
    - Quality gate validation during training
    - Experiment tracking with MLflow
    - Hash verification for reproducibility
    """

    def __init__(self, config: Dict, seed: int = 42):
        """
        Initialize the trainer.

        Args:
            config: Configuration dictionary
            seed: Random seed for reproducibility
        """
        self.config = config
        self.seed = seed

        # Set deterministic behavior
        self._set_deterministic_behavior()

        # Extract training configuration
        self.train_config = config["training"]
        self.model_config = config["model"]
        self.quality_gates = config["model"]["quality_gates"]

        # Initialize MLflow
        if config["experiment_tracking"]["mlflow"]["enabled"]:
            mlflow.set_tracking_uri(
                config["experiment_tracking"]["mlflow"]["tracking_uri"]
            )
            mlflow.set_experiment(
                config["experiment_tracking"]["mlflow"]["experiment_name"]
            )

        logger.info("Initialized ReproducibleTrainer")

    def _set_deterministic_behavior(self):
        """Set deterministic behavior for reproducibility."""
        # Set seeds
        np.random.seed(self.seed)
        tf.random.set_seed(self.seed)

        # Set TensorFlow to deterministic mode
        tf.config.experimental.enable_op_determinism()

        # Disable mixed precision for reproducibility
        tf.keras.mixed_precision.set_global_policy("float32")

        logger.info(f"Set deterministic behavior with seed {self.seed}")

    def build_model(
        self, input_shape: Tuple[int, int], num_classes: int
    ) -> keras.Model:
        """
        Build optimized model architecture for size constraints.

        Args:
            input_shape: Input shape (window_size, features)
            num_classes: Number of output classes

        Returns:
            Compiled Keras model
        """
        # Calculate target parameters for ≤16KB binary
        target_params = self.model_config["architecture"]["max_parameters"]

        # Build 1D CNN architecture optimized for size
        model = keras.Sequential(
            [
                # Input layer
                keras.layers.Input(shape=input_shape),
                # First conv block - optimized for size
                keras.layers.Conv1D(
                    filters=16,
                    kernel_size=8,
                    strides=2,
                    activation="relu",
                    padding="same",
                    kernel_regularizer=keras.regularizers.l2(1e-4),
                ),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(
                    self.train_config["regularization"]["dropout_rate"]
                ),
                # Second conv block
                keras.layers.Conv1D(
                    filters=32,
                    kernel_size=4,
                    strides=2,
                    activation="relu",
                    padding="same",
                    kernel_regularizer=keras.regularizers.l2(1e-4),
                ),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(
                    self.train_config["regularization"]["dropout_rate"]
                ),
                # Third conv block
                keras.layers.Conv1D(
                    filters=32,
                    kernel_size=4,
                    strides=1,
                    activation="relu",
                    padding="same",
                    kernel_regularizer=keras.regularizers.l2(1e-4),
                ),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(
                    self.train_config["regularization"]["dropout_rate"]
                ),
                # Global pooling
                keras.layers.GlobalAveragePooling1D(),
                # Dense layers - minimal for size
                keras.layers.Dense(
                    16,
                    activation="relu",
                    kernel_regularizer=keras.regularizers.l2(1e-4),
                ),
                keras.layers.Dropout(
                    self.train_config["regularization"]["dropout_rate"]
                ),
                # Output layer
                keras.layers.Dense(num_classes, activation="softmax"),
            ]
        )

        # Compile model
        optimizer = keras.optimizers.Adam(
            learning_rate=self.train_config["optimizer"]["learning_rate"],
            beta_1=self.train_config["optimizer"]["beta_1"],
            beta_2=self.train_config["optimizer"]["beta_2"],
            epsilon=self.train_config["optimizer"]["epsilon"],
        )

        model.compile(
            optimizer=optimizer,
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy", "sparse_categorical_accuracy"],
        )

        # Check model size
        param_count = model.count_params()
        logger.info(f"Model parameters: {param_count:,}")

        if param_count > target_params:
            logger.warning(
                f"Model exceeds target parameters: {param_count:,} > {target_params:,}"
            )

        return model

    def load_data(self, data_path: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Load and preprocess training data.

        Args:
            data_path: Path to dataset file

        Returns:
            Tuple of (X_train, X_val, y_train, y_val)
        """
        logger.info(f"Loading data from {data_path}")

        # Load data
        data = np.load(data_path)
        voltage_data = data["voltage"]
        current_data = data["current"]
        labels = data["labels"]

        # Combine voltage and current features
        X = np.stack([voltage_data, current_data], axis=-1)
        y = labels

        # Normalize data
        X = (X - np.mean(X, axis=0)) / np.std(X, axis=0)

        # Split data
        split_idx = int(
            len(X)
            * (
                1
                - self.train_config["validation_split"]
                - self.train_config["test_split"]
            )
        )
        val_split_idx = int(len(X) * (1 - self.train_config["test_split"]))

        X_train = X[:split_idx]
        y_train = y[:split_idx]
        X_val = X[split_idx:val_split_idx]
        y_val = y[split_idx:val_split_idx]
        X_test = X[val_split_idx:]
        y_test = y[val_split_idx:]

        logger.info(
            f"Data shapes: Train {X_train.shape}, Val {X_val.shape}, Test {X_test.shape}"
        )
        logger.info(f"Class distribution: {np.bincount(y_train)}")

        return X_train, X_val, y_train, y_val, X_test, y_test

    def create_callbacks(self, model_save_path: str) -> List[keras.callbacks.Callback]:
        """
        Create training callbacks.

        Args:
            model_save_path: Path to save best model

        Returns:
            List of callbacks
        """
        callbacks = [
            # Early stopping
            keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=self.train_config["regularization"]["early_stopping_patience"],
                restore_best_weights=True,
                verbose=1,
            ),
            # Model checkpointing
            keras.callbacks.ModelCheckpoint(
                model_save_path, monitor="val_accuracy", save_best_only=True, verbose=1
            ),
            # Reduce learning rate on plateau
            keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss", factor=0.5, patience=5, min_lr=1e-7, verbose=1
            ),
            # Custom callback for quality gate monitoring
            QualityGateCallback(self.quality_gates),
        ]

        return callbacks

    def train(self, data_path: str, model_save_path: str) -> Dict:
        """
        Train the model with quality gate validation.

        Args:
            data_path: Path to training data
            model_save_path: Path to save trained model

        Returns:
            Training results dictionary
        """
        logger.info("Starting reproducible training...")

        # Load data
        X_train, X_val, y_train, y_val, X_test, y_test = self.load_data(data_path)

        # Build model
        model = self.build_model(
            input_shape=X_train.shape[1:], num_classes=len(np.unique(y_train))
        )

        # Create callbacks
        callbacks = self.create_callbacks(model_save_path)

        # Start MLflow run
        with mlflow.start_run():
            # Log parameters
            mlflow.log_params(
                {
                    "seed": self.seed,
                    "batch_size": self.train_config["batch_size"],
                    "epochs": self.train_config["epochs"],
                    "learning_rate": self.train_config["optimizer"]["learning_rate"],
                    "dropout_rate": self.train_config["regularization"]["dropout_rate"],
                }
            )

            # Train model
            start_time = time.time()
            history = model.fit(
                X_train,
                y_train,
                validation_data=(X_val, y_val),
                batch_size=self.train_config["batch_size"],
                epochs=self.train_config["epochs"],
                callbacks=callbacks,
                verbose=1,
            )
            training_time = time.time() - start_time

            # Evaluate model
            train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
            val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
            test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)

            # Generate predictions
            y_pred = np.argmax(model.predict(X_test), axis=1)

            # Calculate metrics
            metrics = {
                "train_accuracy": train_acc,
                "val_accuracy": val_acc,
                "test_accuracy": test_acc,
                "training_time": training_time,
                "model_parameters": model.count_params(),
            }

            # Log metrics
            mlflow.log_metrics(metrics)

            # Log model
            mlflow.keras.log_model(model, "model")

            # Generate and log confusion matrix
            cm = confusion_matrix(y_test, y_pred)
            plt.figure(figsize=(8, 6))
            sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
            plt.title("Confusion Matrix")
            plt.ylabel("True Label")
            plt.xlabel("Predicted Label")
            plt.tight_layout()
            mlflow.log_figure(plt.gcf(), "confusion_matrix.png")
            plt.close()

            # Log classification report
            report = classification_report(y_test, y_pred, output_dict=True)
            mlflow.log_dict(report, "classification_report.json")

            logger.info(f"Training completed in {training_time:.2f}s")
            logger.info(f"Test accuracy: {test_acc:.4f}")

            return {
                "model": model,
                "history": history,
                "metrics": metrics,
                "predictions": y_pred,
                "true_labels": y_test,
            }

    def calculate_model_hash(self, model: keras.Model) -> str:
        """
        Calculate hash of model weights for reproducibility verification.

        Args:
            model: Trained Keras model

        Returns:
            SHA-256 hash of model weights
        """
        # Get model weights as bytes
        weights_bytes = b""
        for layer in model.layers:
            if layer.weights:
                for weight in layer.get_weights():
                    weights_bytes += weight.tobytes()

        # Calculate hash
        model_hash = hashlib.sha256(weights_bytes).hexdigest()
        return model_hash

    def verify_reproducibility(self, model1: keras.Model, model2: keras.Model) -> bool:
        """
        Verify that two training runs produce identical models.

        Args:
            model1: First trained model
            model2: Second trained model

        Returns:
            True if models are identical
        """
        hash1 = self.calculate_model_hash(model1)
        hash2 = self.calculate_model_hash(model2)

        is_identical = hash1 == hash2

        logger.info(f"Model 1 hash: {hash1}")
        logger.info(f"Model 2 hash: {hash2}")
        logger.info(f"Models identical: {is_identical}")

        return is_identical


class QualityGateCallback(keras.callbacks.Callback):
    """Custom callback for quality gate monitoring during training."""

    def __init__(self, quality_gates: Dict):
        super().__init__()
        self.quality_gates = quality_gates
        self.best_val_acc = 0.0

    def on_epoch_end(self, epoch, logs=None):
        """Monitor quality gates at end of each epoch."""
        val_acc = logs.get("val_accuracy", 0.0)

        # Update best validation accuracy
        if val_acc > self.best_val_acc:
            self.best_val_acc = val_acc

        # Check precision quality gate
        precision_target = self.quality_gates["precision"]["target"]
        if val_acc >= precision_target:
            logger.info(
                f"✅ Precision quality gate met: {val_acc:.4f} >= {precision_target}"
            )
        else:
            logger.info(
                f"⚠️  Precision quality gate not met: {val_acc:.4f} < {precision_target}"
            )


def main():
    """Main function for training."""
    import argparse

    parser = argparse.ArgumentParser(description="Train voltage event detection model")
    parser.add_argument(
        "--config",
        type=str,
        default="config/voltage_event.yaml",
        help="Configuration file path",
    )
    parser.add_argument(
        "--data", type=str, default="data/voltage_events.npz", help="Training data path"
    )
    parser.add_argument(
        "--output", type=str, default="artifacts/model.h5", help="Output model path"
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument(
        "--double-run", action="store_true", help="Verify reproducibility"
    )

    args = parser.parse_args()

    # Load configuration
    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    # Setup logging
    logging.basicConfig(level=logging.INFO)

    # Create output directory
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    # Train model
    trainer = ReproducibleTrainer(config, seed=args.seed)
    results = trainer.train(args.data, args.output)

    # Verify reproducibility if requested
    if args.double_run:
        logger.info("Running second training for reproducibility verification...")
        trainer2 = ReproducibleTrainer(config, seed=args.seed)
        results2 = trainer2.train(args.data, args.output.replace(".h5", "_run2.h5"))

        is_reproducible = trainer.verify_reproducibility(
            results["model"], results2["model"]
        )

        if is_reproducible:
            logger.info("✅ Reproducibility verified - models are identical")
        else:
            logger.error("❌ Reproducibility failed - models differ")

    # Save results
    results_path = args.output.replace(".h5", "_results.json")
    with open(results_path, "w") as f:
        json.dump(results["metrics"], f, indent=2)

    logger.info(f"Training completed. Results saved to {results_path}")
    logger.info(f"Model saved to {args.output}")


if __name__ == "__main__":
    main()
