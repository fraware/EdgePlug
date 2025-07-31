# Voltage Event Detection Model

This directory contains the ML pipeline for training and deploying voltage event detection models for EdgePlug.

## Model Specifications

- **Input**: Voltage/current sensor data (windowed)
- **Output**: Binary classification (voltage event detected/not detected)
- **Target**: ≤500µs inference on M4 @80MHz
- **Size**: <16KB quantized model
- **Accuracy**: ≥98% precision on pilot dataset

## Directory Structure

```
models/voltage_event/
├── data/                    # Training datasets
├── notebooks/              # Jupyter notebooks
├── src/                    # Python source code
├── tests/                  # Model validation tests
├── config/                 # Model configuration files
└── artifacts/              # Trained models and binaries
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run training pipeline
python src/train.py --config config/model_spec.yaml

# Generate CMSIS-NN binary
python src/export.py --model artifacts/voltage_event_model.h5
```

## Model Architecture

The voltage event detection model uses a lightweight CNN architecture:

- **Input**: 128-sample voltage/current window
- **Layers**: 2D CNN → Global Average Pooling → Dense → Softmax
- **Parameters**: ~15K parameters (fits in 16KB when quantized)
- **Quantization**: Int8 with dynamic range quantization

## Training Pipeline

1. **Data Preparation**: Load voltage sag datasets, apply windowing
2. **Training**: Train CNN with data augmentation
3. **Quantization**: Convert to TensorFlow Lite Micro format
4. **Validation**: Test on holdout dataset
5. **Export**: Generate CMSIS-NN C code

## Quality Gates

- [x] Model accuracy ≥98% precision
- [x] Inference time ≤500µs on M4 @80MHz
- [x] Model size <16KB when quantized
- [x] Adversarial robustness testing
- [x] Reproducible training (deterministic) 