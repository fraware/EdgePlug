# EdgePlug Requirements Analysis

## Prompt 00 Deliverables

### Functional Requirements (F)

#### Core Runtime (F1-F6)
- **F1**: ML agent runtime for PLC hardware with ≤32KB flash / ≤4KB SRAM
- **F2**: Hot-swap update mechanism without RTOS reflashing  
- **F3**: Cryptographic manifest system for agent identity/version/safety
- **F4**: Pre-processing stack for sensor data cleaning and windowing
- **F5**: Quantized int8 model support with CMSIS-NN kernels
- **F6**: Multi-protocol actuation layer (OPC-UA, Modbus RTU/TCP, GPIO)

#### Host Tools & Ecosystem (F7-F12)
- **F7**: No-code drag-and-drop deployment tool with digital twin canvas
- **F8**: Agent marketplace with third-party vendor support
- **F9**: Per-agent-hour billing system
- **F10**: Safety invariant system with fail-closed behavior
- **F11**: Certification pipeline for agent validation
- **F12**: Observability and remote operations support

### Non-Functional Requirements (NF)

#### Performance Targets (NF1-NF6)
- **NF1**: Response time improvement target: 28% faster voltage-sag response
- **NF2**: Code reduction: 70% fewer bespoke firmware lines
- **NF3**: Model inference time: ≤500µs on M4 @80MHz
- **NF4**: Model accuracy: ≥98% precision on pilot dataset
- **NF5**: Memory budget: ≤32KB flash, ≤4KB SRAM
- **NF6**: Power consumption: <10mA delta in idle

#### Security & Compliance (NF7-NF9)
- **NF7**: Security compliance: IEC 62443-4-2 SL3
- **NF8**: Open-source core with paid certification packs
- **NF9**: Auditable guardrails for regulated industries

### Success Metrics

#### Business Impact (SM1-SM4)
- **SM1**: 28% improvement in voltage-sag response times
- **SM2**: 70% reduction in bespoke firmware development
- **SM3**: Shorter OEM sales cycles
- **SM4**: Auditable control systems for operators

### Gaps / Open Questions

#### Technical Specifications
1. **Q1**: What specific PLC brands/models are supported in v1.0?
2. **Q2**: What are the specific voltage-sag detection thresholds and response actions?
3. **Q3**: What are the specific OPC-UA and Modbus protocol versions supported?
4. **Q4**: What is the maximum number of concurrent agents per PLC?

#### Business & Market
5. **Q5**: What is the target market size for the pilot (50 substations mentioned)?
6. **Q6**: What is the pricing model for per-agent-hour billing?
7. **Q7**: What is the target deployment timeline for the pilot?

#### Safety & Compliance
8. **Q8**: What are the specific safety invariants for VoltageEventAgent?

### Quality Gates - Prompt 00

#### Peer Review Checklist
- [ ] All functional requirements from synopsis captured
- [ ] All non-functional requirements from synopsis captured  
- [ ] All explicit success metrics from synopsis captured
- [ ] Requirements properly categorized (F/NF/SM)
- [ ] Gaps and open questions identified
- [ ] No requirements missed or mis-categorized

#### LLM Consistency Check
- [ ] Feed synopsis and requirements list to GPT-4o
- [ ] System prompt: "Highlight missing or mis-categorized requirements"
- [ ] Revise until model returns "No issues found"
- [ ] Document any clarifications or additions

### Next Steps

This requirements analysis feeds into Prompt 01 (System Architecture Blueprint) where we will:
1. Design end-to-end architecture for production-grade EdgePlug v1.0
2. Create Mermaid diagrams covering all system layers
3. Define module interface table with public APIs and data contracts
4. Establish memory/latency budgets and protocol mappings 