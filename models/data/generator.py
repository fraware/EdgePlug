"""
Synthetic Voltage Event Dataset Generator
EdgePlug ML Pipeline - Data Generation Module

Generates realistic voltage event datasets for training and validation
with configurable noise levels, event types, and system characteristics.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import yaml
import logging
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import signal
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class VoltageEventGenerator:
    """
    Generates synthetic voltage event datasets for ML training.

    Features:
    - Realistic power system characteristics
    - Multiple event types (sag, swell, interruption)
    - Configurable noise and distortion
    - Balanced class distribution
    - Reproducible generation
    """

    def __init__(self, config: Dict, seed: int = 42):
        """
        Initialize the voltage event generator.

        Args:
            config: Configuration dictionary
            seed: Random seed for reproducibility
        """
        self.config = config
        self.seed = seed
        np.random.seed(seed)

        # Extract configuration
        self.sampling_rate = config["data"]["preprocessing"]["sampling_rate"]
        self.window_size = config["data"]["preprocessing"]["window_size"]
        self.num_samples = config["data"]["synthetic"]["num_samples"]
        self.noise_levels = config["data"]["synthetic"]["noise_levels"]
        self.event_types = config["data"]["synthetic"]["event_types"]

        # Power system parameters
        self.nominal_voltage = 230.0  # V RMS
        self.nominal_frequency = 50.0  # Hz
        self.phase_shift = 0.0  # radians

        # Event characteristics
        self.event_params = {
            "sag": {
                "magnitude_range": (0.1, 0.9),
                "duration_range": (0.01, 0.5),
                "frequency": 0.3,
            },
            "swell": {
                "magnitude_range": (1.1, 1.8),
                "duration_range": (0.01, 0.3),
                "frequency": 0.2,
            },
            "interruption": {
                "magnitude_range": (0.0, 0.1),
                "duration_range": (0.01, 0.1),
                "frequency": 0.1,
            },
        }

        logger.info(
            f"Initialized VoltageEventGenerator with {self.num_samples} samples"
        )

    def generate_normal_voltage(self, duration: float) -> np.ndarray:
        """
        Generate normal voltage waveform.

        Args:
            duration: Duration in seconds

        Returns:
            Normal voltage waveform
        """
        t = np.linspace(0, duration, int(duration * self.sampling_rate))

        # Generate clean sine wave
        voltage = (
            self.nominal_voltage
            * np.sqrt(2)
            * np.sin(2 * np.pi * self.nominal_frequency * t)
        )

        # Add small random variations (realistic grid behavior)
        noise = np.random.normal(0, 0.02 * self.nominal_voltage, len(voltage))
        voltage += noise

        return voltage

    def generate_current(
        self, voltage: np.ndarray, power_factor: float = 0.95
    ) -> np.ndarray:
        """
        Generate corresponding current waveform.

        Args:
            voltage: Voltage waveform
            power_factor: Power factor (0.8-1.0 typical)

        Returns:
            Current waveform
        """
        # Calculate phase shift based on power factor
        phase_shift = np.arccos(power_factor)

        # Generate current with phase shift
        t = np.linspace(0, len(voltage) / self.sampling_rate, len(voltage))
        current = np.sin(2 * np.pi * self.nominal_frequency * t - phase_shift)

        # Scale current based on voltage and load
        current *= np.abs(voltage) / (self.nominal_voltage * np.sqrt(2))

        # Add realistic current harmonics
        harmonics = np.sin(2 * np.pi * 3 * self.nominal_frequency * t) * 0.05
        current += harmonics

        return current

    def add_voltage_event(
        self,
        voltage: np.ndarray,
        event_type: str,
        start_time: float,
        duration: float,
        magnitude: float,
    ) -> np.ndarray:
        """
        Add a voltage event to the waveform.

        Args:
            voltage: Base voltage waveform
            event_type: Type of event ('sag', 'swell', 'interruption')
            start_time: Start time of event
            duration: Duration of event
            magnitude: Magnitude factor

        Returns:
            Voltage waveform with event
        """
        modified_voltage = voltage.copy()

        # Calculate event indices
        start_idx = int(start_time * self.sampling_rate)
        end_idx = int((start_time + duration) * self.sampling_rate)

        # Ensure indices are within bounds
        start_idx = max(0, min(start_idx, len(voltage) - 1))
        end_idx = max(start_idx + 1, min(end_idx, len(voltage)))

        # Apply event
        if event_type == "sag":
            modified_voltage[start_idx:end_idx] *= magnitude
        elif event_type == "swell":
            modified_voltage[start_idx:end_idx] *= magnitude
        elif event_type == "interruption":
            modified_voltage[start_idx:end_idx] *= magnitude

        # Add smooth transitions
        transition_samples = int(0.01 * self.sampling_rate)  # 10ms transition

        if start_idx > transition_samples:
            # Smooth start transition
            for i in range(transition_samples):
                factor = i / transition_samples
                idx = start_idx - transition_samples + i
                if idx >= 0:
                    modified_voltage[idx] = (
                        voltage[idx] * (1 - factor) + modified_voltage[idx] * factor
                    )

        if end_idx + transition_samples < len(voltage):
            # Smooth end transition
            for i in range(transition_samples):
                factor = i / transition_samples
                idx = end_idx + i
                if idx < len(voltage):
                    modified_voltage[idx] = (
                        modified_voltage[idx] * (1 - factor) + voltage[idx] * factor
                    )

        return modified_voltage

    def add_noise_and_distortion(
        self, voltage: np.ndarray, current: np.ndarray, noise_level: float
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Add realistic noise and distortion to waveforms.

        Args:
            voltage: Voltage waveform
            current: Current waveform
            noise_level: Noise level factor

        Returns:
            Tuple of (noisy_voltage, noisy_current)
        """
        # Add Gaussian noise
        voltage_noise = np.random.normal(
            0, noise_level * self.nominal_voltage, len(voltage)
        )
        current_noise = np.random.normal(
            0, noise_level * np.max(np.abs(current)), len(current)
        )

        # Add harmonic distortion
        t = np.linspace(0, len(voltage) / self.sampling_rate, len(voltage))

        # 3rd harmonic
        voltage_harmonic = (
            np.sin(2 * np.pi * 3 * self.nominal_frequency * t)
            * 0.02
            * self.nominal_voltage
        )
        current_harmonic = (
            np.sin(2 * np.pi * 3 * self.nominal_frequency * t)
            * 0.05
            * np.max(np.abs(current))
        )

        # 5th harmonic
        voltage_harmonic += (
            np.sin(2 * np.pi * 5 * self.nominal_frequency * t)
            * 0.01
            * self.nominal_voltage
        )
        current_harmonic += (
            np.sin(2 * np.pi * 5 * self.nominal_frequency * t)
            * 0.03
            * np.max(np.abs(current))
        )

        # Add high-frequency noise (switching noise)
        switching_noise = np.random.normal(0, 0.01 * self.nominal_voltage, len(voltage))

        noisy_voltage = voltage + voltage_noise + voltage_harmonic + switching_noise
        noisy_current = current + current_noise + current_harmonic

        return noisy_voltage, noisy_current

    def generate_sample(
        self, event_type: Optional[str] = None
    ) -> Tuple[np.ndarray, np.ndarray, int]:
        """
        Generate a single sample with optional event.

        Args:
            event_type: Type of event to add (None for normal)

        Returns:
            Tuple of (voltage, current, label)
        """
        # Generate base waveform
        duration = self.window_size / self.sampling_rate
        voltage = self.generate_normal_voltage(duration)
        current = self.generate_current(voltage)

        label = 0  # Normal

        if event_type is not None and event_type in self.event_params:
            # Add event
            params = self.event_params[event_type]

            # Random event parameters
            magnitude = np.random.uniform(*params["magnitude_range"])
            event_duration = np.random.uniform(*params["duration_range"])
            start_time = np.random.uniform(0.1, duration - event_duration - 0.1)

            voltage = self.add_voltage_event(
                voltage, event_type, start_time, event_duration, magnitude
            )

            # Update label
            label = {"sag": 1, "swell": 2, "interruption": 3}[event_type]

        # Add noise and distortion
        noise_level = np.random.choice(self.noise_levels)
        voltage, current = self.add_noise_and_distortion(voltage, current, noise_level)

        return voltage, current, label

    def generate_dataset(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Generate complete dataset with balanced classes.

        Returns:
            Tuple of (voltage_data, current_data, labels)
        """
        logger.info("Generating synthetic voltage event dataset...")

        # Calculate samples per class for balanced dataset
        samples_per_class = (
            self.num_samples // 4
        )  # 4 classes: normal, sag, swell, interruption

        voltage_data = []
        current_data = []
        labels = []

        # Generate normal samples
        logger.info(f"Generating {samples_per_class} normal samples...")
        for _ in range(samples_per_class):
            voltage, current, label = self.generate_sample()
            voltage_data.append(voltage)
            current_data.append(current)
            labels.append(label)

        # Generate event samples
        for event_type in self.event_types:
            logger.info(f"Generating {samples_per_class} {event_type} samples...")
            for _ in range(samples_per_class):
                voltage, current, label = self.generate_sample(event_type)
                voltage_data.append(voltage)
                current_data.append(current)
                labels.append(label)

        # Convert to numpy arrays
        voltage_data = np.array(voltage_data)
        current_data = np.array(current_data)
        labels = np.array(labels)

        # Shuffle data
        indices = np.random.permutation(len(voltage_data))
        voltage_data = voltage_data[indices]
        current_data = current_data[indices]
        labels = labels[indices]

        logger.info(
            f"Generated dataset: {voltage_data.shape}, labels: {np.bincount(labels)}"
        )

        return voltage_data, current_data, labels

    def save_dataset(
        self,
        output_path: str,
        voltage_data: np.ndarray,
        current_data: np.ndarray,
        labels: np.ndarray,
    ):
        """
        Save dataset to file.

        Args:
            output_path: Output file path
            voltage_data: Voltage data array
            current_data: Current data array
            labels: Labels array
        """
        # Create output directory
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        # Save as numpy arrays
        np.savez_compressed(
            output_path, voltage=voltage_data, current=current_data, labels=labels
        )

        logger.info(f"Saved dataset to {output_path}")

    def visualize_sample(
        self,
        voltage: np.ndarray,
        current: np.ndarray,
        label: int,
        save_path: Optional[str] = None,
    ):
        """
        Visualize a sample waveform.

        Args:
            voltage: Voltage waveform
            current: Current waveform
            label: Sample label
            save_path: Optional path to save plot
        """
        t = np.linspace(0, len(voltage) / self.sampling_rate, len(voltage))

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

        # Plot voltage
        ax1.plot(t * 1000, voltage, "b-", linewidth=1)
        ax1.set_ylabel("Voltage (V)")
        ax1.set_title(f"Voltage Event Sample - Class {label}")
        ax1.grid(True, alpha=0.3)

        # Plot current
        ax2.plot(t * 1000, current, "r-", linewidth=1)
        ax2.set_xlabel("Time (ms)")
        ax2.set_ylabel("Current (A)")
        ax2.set_title("Current Waveform")
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches="tight")
            logger.info(f"Saved visualization to {save_path}")

        plt.show()


def main():
    """Main function for dataset generation."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate synthetic voltage event dataset"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="config/voltage_event.yaml",
        help="Configuration file path",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data/voltage_events.npz",
        help="Output dataset path",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument(
        "--visualize", action="store_true", help="Generate visualizations"
    )

    args = parser.parse_args()

    # Load configuration
    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    # Setup logging
    logging.basicConfig(level=logging.INFO)

    # Generate dataset
    generator = VoltageEventGenerator(config, seed=args.seed)
    voltage_data, current_data, labels = generator.generate_dataset()

    # Save dataset
    generator.save_dataset(args.output, voltage_data, current_data, labels)

    # Generate visualizations
    if args.visualize:
        for i in range(4):  # One sample per class
            mask = labels == i
            if np.any(mask):
                idx = np.where(mask)[0][0]
                generator.visualize_sample(
                    voltage_data[idx],
                    current_data[idx],
                    labels[idx],
                    save_path=f"data/sample_class_{i}.png",
                )

    print(f"Dataset generated successfully: {voltage_data.shape}")
    print(f"Class distribution: {np.bincount(labels)}")


if __name__ == "__main__":
    main()
