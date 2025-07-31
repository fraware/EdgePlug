# EdgePlug System Architecture Blueprint

## Prompt 01 Deliverables

### 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Host Layer"
        A[Config Tool<br/>Electron/TypeScript]
        B[Marketplace<br/>Go + Postgres]
        C[Cert Pipeline<br/>Kubernetes Jobs]
    end
    
    subgraph "Network Layer"
        D[gRPC/HTTP<br/>Serial/Ethernet]
        E[OPC-UA<br/>Modbus RTU/TCP]
    end
    
    subgraph "Firmware Layer"
        F[Agent Runtime<br/>C/C++17]
        G[Hot-Swap Engine<br/>Double-bank]
        H[Safety Kernel<br/>Invariant VM]
    end
    
    subgraph "Hardware Layer"
        I[Cortex-M4F<br/>≤32KB Flash<br/>≤4KB SRAM]
        J[Sensors<br/>Voltage/Current]
        K[Actuators<br/>GPIO/Relays]
    end
    
    A --> D
    B --> D
    C --> D
    D --> F
    F --> G
    F --> H
    G --> I
    H --> I
    I --> J
    I --> K
    F --> E
```

### 2. MCU Runtime Layer Architecture

```mermaid
graph LR
    subgraph "MCU Runtime (≤32KB Flash, ≤4KB SRAM)"
        A[Agent Loader<br/>CBOR Parser]
        B[Pre-processing<br/>Windowing/Filters]
        C[CMSIS-NN<br/>Int8 Inference]
        D[Actuator Layer<br/>OPC-UA/Modbus/GPIO]
        E[Safety Guard<br/>Invariant VM]
        F[Hot-Swap<br/>Double-bank]
    end
    
    subgraph "Memory Map"
        G[Agent Slot A<br/>16KB]
        H[Agent Slot B<br/>16KB]
        I[Runtime Stack<br/>2KB]
        J[Safety VM<br/>1KB]
        K[Actuator Buffers<br/>1KB]
    end
    
    A --> G
    A --> H
    B --> C
    C --> D
    E --> D
    F --> G
    F --> H
```

### 3. Host-Side Config Tool Architecture

```mermaid
graph TB
    subgraph "Electron App"
        A[React Canvas<br/>react-flow]
        B[Agent Library<br/>Drag & Drop]
        C[Digital Twin<br/>Asset Mapping]
        D[Config Generator<br/>deploy.json]
    end
    
    subgraph "Backend Services"
        E[Agent Registry<br/>REST API]
        F[Cert Pipeline<br/>Kubernetes]
        G[Billing Service<br/>Per-agent-hour]
    end
    
    subgraph "Deployment"
        H[edgeplug-push<br/>CLI Tool]
        I[Firmware Builder<br/>CMake]
        J[Manifest Signer<br/>Ed25519]
    end
    
    A --> B
    B --> C
    C --> D
    D --> H
    H --> I
    I --> J
    E --> G
    F --> G
```

### 4. Marketplace & Certification Pipeline

```mermaid
graph LR
    subgraph "Vendor Upload"
        A[Agent Package<br/>.tar.gz]
        B[Manifest<br/>.proto]
        C[Safety Spec<br/>invariant.ebnf]
    end
    
    subgraph "Cert Pipeline"
        D[Renode Sim<br/>HW-in-Loop]
        E[Invariant Suite<br/>Property Tests]
        F[Security Scan<br/>SBOM Analysis]
        G[Performance Test<br/>≤500µs Inference]
    end
    
    subgraph "Marketplace"
        H[Certified Agents<br/>Postgres]
        I[Billing Engine<br/>Per-agent-hour]
        J[Operator Portal<br/>REST/gRPC]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J
```

### 5. Module Interface Table

| Module | Public APIs | Data Contracts | Memory Budget | Latency Budget | Protocol Mappings |
|--------|-------------|----------------|---------------|----------------|-------------------|
| **Agent Loader** | `load_agent(cbor_data)`<br/>`verify_manifest(sig)` | CBOR-encoded agent image<br/>Ed25519 signature | 2KB stack<br/>16KB agent slot | <100µs load time | CBOR, Ed25519 |
| **Pre-processing** | `window_data(samples, size)`<br/>`normalize_data(window)` | Float32 sensor samples<br/>Int8 normalized window | 1KB window buffer | <50µs per window | Raw ADC, I2C, SPI |
| **CMSIS-NN Runtime** | `infer_int8(input, model)`<br/>`quantize_fp32(fp32_data)` | Int8 quantized tensors<br/>CMSIS-NN model blob | 1KB inference buffer | <500µs inference | CMSIS-NN API |
| **Actuator Layer** | `write_opcua(node, value)`<br/>`write_modbus(addr, value)`<br/>`write_gpio(pin, state)` | OPC-UA node values<br/>Modbus registers<br/>GPIO states | 512B protocol buffers | <10ms actuation | OPC-UA, Modbus RTU/TCP, GPIO |
| **Safety Guard** | `check_invariant(inputs, spec)`<br/>`fail_closed()` | Invariant bytecode<br/>Safety bounds | 1KB VM stack | <10µs check | Custom bytecode |
| **Hot-Swap Engine** | `swap_agent(new_agent)`<br/>`rollback_on_failure()` | Double-bank agent slots<br/>CRC32 validation | 32KB total agent space | <1s swap time | gRPC over serial |
| **Config Tool** | `deploy_agent(asset, agent)`<br/>`generate_config()` | deploy.json<br/>Digital twin canvas | N/A (host) | <5s deployment | REST API, gRPC |
| **Marketplace** | `upload_agent(package)`<br/>`certify_agent(agent_id)`<br/>`bill_usage(agent_hours)` | Agent packages<br/>Cert results<br/>Billing records | N/A (cloud) | <300ms API calls | REST API, gRPC |

### 6. Memory Budget Verification

```mermaid
graph TD
    A[Total Flash: 32KB] --> B[Agent Slot A: 16KB]
    A --> C[Agent Slot B: 16KB]
    
    D[Total SRAM: 4KB] --> E[Runtime Stack: 2KB]
    D --> F[Safety VM: 1KB]
    D --> G[Actuator Buffers: 1KB]
    
    H[Runtime Components] --> I[Agent Loader: 2KB]
    H --> J[Pre-processing: 1KB]
    H --> K[CMSIS-NN: 1KB]
    H --> L[Actuator Layer: 1KB]
    H --> M[Hot-Swap: 1KB]
    
    N[Total Runtime: 6KB] --> O[Fits in 32KB Flash ✓]
    P[Total SRAM: 4KB] --> Q[Fits in 4KB SRAM ✓]
```

### 7. Security Architecture

```mermaid
graph TB
    subgraph "Secure Boot Chain"
        A[MCU OTP Keys] --> B[Bootloader]
        B --> C[Manifest Verification]
        C --> D[Agent Load]
        D --> E[Runtime Execution]
    end
    
    subgraph "Cryptographic Components"
        F[Ed25519 Signatures]
        G[SHA-512 Hashing]
        H[CBOR Encoding]
        I[Secure Key Storage]
    end
    
    subgraph "Threat Model"
        J[STRIDE Analysis]
        K[IEC 62443-4-2 SL3]
        L[Fail-Closed Design]
    end
    
    C --> F
    C --> G
    D --> H
    A --> I
    E --> J
    E --> K
    E --> L
```

### 8. Quality Gates - Prompt 01

#### Architecture Decision Record (ADR-001)
- [ ] Architecture reviewed by lead engineer
- [ ] Memory budgets verified at link-time
- [ ] Latency budgets validated with benchmarks
- [ ] Security architecture approved by security team
- [ ] Protocol mappings tested with real hardware

#### Static Analysis
- [ ] OCL rules defined for cyclic dependencies
- [ ] UML model validated with static analysis
- [ ] No forbidden cyclic dependencies found
- [ ] Architecture compliance verified

### 9. Next Steps

This architecture blueprint feeds into Prompt 02 (Firmware Runtime Implementation) where we will:
1. Implement the C/C++17 runtime library
2. Create CMake cross-build targets for STM32 & NXP
3. Implement memory-map documentation
4. Establish MISRA-C 2023 compliance 