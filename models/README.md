# EdgePlug ML Modeling Pipeline

machine learning pipeline for converting Keras models to CMSIS-NN binaries with strict quality gates and reproducibility guarantees.

## Overview

This pipeline implements a reproducible ML workflow that converts Keras models to optimized int8 CMSIS-NN binaries under 16KB, meeting EdgePlug's stringent requirements for embedded deployment.

## Quality Gates

- **Precision**: ≥98% on pilot dataset
- **Inference Time**: ≤500µs on Cortex-M4 @80MHz
- **Model Size**: ≤16KB binary
- **Adversarial Robustness**: DeepXplore testing with documented failure modes
- **Reproducibility**: Double-run hash verification for identical quantized weights

## Architecture

```
models/
├── config/                 # Model specifications and hyperparameters
├── data/                   # Dataset management and preprocessing
├── training/               # Training pipeline with reproducibility
├── quantization/           # CMSIS-NN quantization pipeline
├── validation/             # Quality gate validation
├── adversarial/            # DeepXplore robustness testing
├── deployment/             # Binary generation and deployment
└── experiments/            # Experiment tracking and results
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run full pipeline
python -m models.pipeline --config config/voltage_event.yaml

# Run specific stage
python -m models.training.train --config config/voltage_event.yaml
python -m models.quantization.quantize --model-path models/artifacts/model.h5
python -m models.validation.validate --binary-path models/artifacts/model.bin
```

## Pipeline Stages

### 1. Data Preparation
- Synthetic voltage event dataset generation
- Data augmentation and normalization
- Train/validation/test splits with stratification

### 2. Model Training
- Reproducible training with fixed seeds
- Model architecture optimization for size constraints
- Early stopping and model checkpointing

### 3. Quantization
- Post-training quantization to int8
- CMSIS-NN format conversion
- Size optimization and validation

### 4. Quality Validation
- Precision testing on pilot dataset
- Inference time measurement on target hardware
- Binary size verification

### 5. Adversarial Testing
- DeepXplore adversarial example generation
- Robustness evaluation and failure mode documentation
- Mitigation strategy development

### 6. Reproducibility Verification
- Double-run training with hash comparison
- Deterministic quantization verification
- Artifact integrity checks

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and quality standards. 