# EdgePlug

EdgePlug drops ready-made ML intelligence into legacy PLCs with a single firmware call. Grid operators stuck with brittle ladder logic can now swap in a spec-driven 'VoltageEventAgent v1.0' as easily as loading a function block.

## Project Overview

EdgePlug converts fixed-function hardware into updatable, modular intelligence—so the grid evolves at software speed.

### Key Features

- **ML Agent Runtime**: ≤32KB flash / ≤4KB SRAM on Cortex-M4F
- **Hot-Swap Updates**: Agent updates without RTOS reflashing
- **Cryptographic Security**: Signed manifests for identity/version/safety
- **Multi-Protocol Support**: OPC-UA, Modbus RTU/TCP, GPIO
- **No-Code Deployment**: Drag-and-drop digital twin canvas
- **Marketplace**: Third-party agent ecosystem
- **Safety First**: Fail-closed behavior with invariant checking

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Host Config   │    │   Marketplace   │    │   Firmware      │
│   Tool          │    │   & Cert        │    │   Runtime       │
│   (Electron)    │    │   Pipeline      │    │   (C/C++)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Observability │
                    │   & Remote Ops  │
                    └─────────────────┘
```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/fraware/EdgePlug.git
cd EdgePlug

# Build firmware
cd runtime
cmake -B build -S .
cmake --build build

# Run host tools
cd ../host
npm install
npm start
```

### Development Status

This project is under active development following a structured 12-prompt engineering approach:

- [x] Prompt 00: Context Sync & Requirements Analysis
- [x] Prompt 01: System Architecture Blueprint
- [x] Prompt 02: Firmware Runtime Implementation
- [ ] Prompt 03: ML Model Tool-chain
- [ ] Prompt 04: Cryptographic Manifest & Secure Boot
- [ ] Prompt 05: Hot-Swap Update Engine
- [ ] Prompt 06: Safety Invariants & Fail-Closed Kernel
- [ ] Prompt 07: Host-Side Config & Digital-Twin Tool
- [ ] Prompt 08: Marketplace & Certification Pipeline
- [ ] Prompt 09: Observability & Remote Ops
- [ ] Prompt 10: CI/CD & Triple-Check Framework
- [ ] Prompt 11: Documentation & SDK
- [ ] Prompt 12: Production Roll-out Playbook

### License

Open-source core with paid certification packs for regulated industries.

## Requirements Analysis

### Functional Requirements (F)
- F1: ML agent runtime for PLC hardware with ≤32KB flash / ≤4KB SRAM
- F2: Hot-swap update mechanism without RTOS reflashing
- F3: Cryptographic manifest system for agent identity/version/safety
- F4: Pre-processing stack for sensor data cleaning and windowing
- F5: Quantized int8 model support with CMSIS-NN kernels
- F6: Multi-protocol actuation layer (OPC-UA, Modbus RTU/TCP, GPIO)
- F7: No-code drag-and-drop deployment tool with digital twin canvas
- F8: Agent marketplace with third-party vendor support
- F9: Per-agent-hour billing system
- F10: Safety invariant system with fail-closed behavior
- F11: Certification pipeline for agent validation
- F12: Observability and remote operations support

### Non-Functional Requirements (NF)
- NF1: Response time improvement target: 28% faster voltage-sag response
- NF2: Code reduction: 70% fewer bespoke firmware lines
- NF3: Model inference time: ≤500µs on M4 @80MHz
- NF4: Model accuracy: ≥98% precision on pilot dataset
- NF5: Memory budget: ≤32KB flash, ≤4KB SRAM
- NF6: Power consumption: <10mA delta in idle
- NF7: Security compliance: IEC 62443-4-2 SL3
- NF8: Open-source core with paid certification packs
- NF9: Auditable guardrails for regulated industries

### Success Metrics
- SM1: 28% improvement in voltage-sag response times
- SM2: 70% reduction in bespoke firmware development
- SM3: Shorter OEM sales cycles
- SM4: Auditable control systems for operators 