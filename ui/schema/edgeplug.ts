import { z } from 'zod';

// Base schemas
export const AgentIdentitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().max(500).optional(),
});

export const VendorInfoSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  website: z.string().url().optional(),
  supportContact: z.string().email().optional(),
});

export const VersionInfoSchema = z.object({
  major: z.number().int().min(0),
  minor: z.number().int().min(0),
  patch: z.number().int().min(0),
  build: z.string().optional(),
  releaseDate: z.string().datetime(),
});

export const CompatibilityInfoSchema = z.object({
  platform: z.enum(['STM32F4', 'NXP_K64F', 'ARM_CORTEX_M4']),
  minFlashSize: z.number().int().min(1),
  minRamSize: z.number().int().min(1),
  maxInferenceTime: z.number().int().min(1),
  supportedProtocols: z.array(z.enum(['OPC_UA', 'MODBUS_RTU', 'MODBUS_TCP', 'GPIO'])),
});

// Safety schemas
export const SafetyLevelSchema = z.enum(['SL1', 'SL2', 'SL3', 'SL4']);

export const DataTypeSchema = z.enum(['FLOAT32', 'INT32', 'UINT32', 'INT16', 'UINT16', 'INT8', 'UINT8', 'BOOLEAN']);

export const RangeConstraintSchema = z.object({
  min: z.number(),
  max: z.number(),
  step: z.number().optional(),
});

export const RateLimitSchema = z.object({
  maxRequestsPerSecond: z.number().int().min(1),
  maxRequestsPerMinute: z.number().int().min(1),
  burstSize: z.number().int().min(1),
});

export const QualityRequirementSchema = z.object({
  minAccuracy: z.number().min(0).max(1),
  maxLatency: z.number().int().min(1),
  minUptime: z.number().min(0).max(1),
});

export const InputValidationRuleSchema = z.object({
  fieldName: z.string().min(1),
  dataType: DataTypeSchema,
  required: z.boolean(),
  range: RangeConstraintSchema.optional(),
  rateLimit: RateLimitSchema.optional(),
  qualityRequirement: QualityRequirementSchema.optional(),
});

export const OutputConstraintSchema = z.object({
  fieldName: z.string().min(1),
  dataType: DataTypeSchema,
  range: RangeConstraintSchema.optional(),
  rateLimit: RateLimitSchema.optional(),
});

export const SafetyBoundsSchema = z.object({
  inputValidation: z.array(InputValidationRuleSchema),
  outputConstraints: z.array(OutputConstraintSchema),
  failSafeBehavior: z.enum(['STOP', 'CONTINUE', 'ROLLBACK', 'ALERT']),
  recoveryStrategy: z.enum(['AUTOMATIC', 'MANUAL', 'HYBRID']),
});

export const InvariantSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const InvariantSpecSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  severity: InvariantSeveritySchema,
  condition: z.string().min(1), // EBNF expression
  timeout: z.number().int().min(1).optional(),
  retryCount: z.number().int().min(0).optional(),
});

export const FailSafeBehaviorSchema = z.object({
  action: z.enum(['STOP', 'CONTINUE', 'ROLLBACK', 'ALERT']),
  timeout: z.number().int().min(1).optional(),
  retryCount: z.number().int().min(0).optional(),
  notificationChannels: z.array(z.string()).optional(),
});

export const RecoveryBehaviorSchema = z.object({
  strategy: z.enum(['AUTOMATIC', 'MANUAL', 'HYBRID']),
  backoffStrategy: z.object({
    initialDelay: z.number().int().min(1),
    maxDelay: z.number().int().min(1),
    multiplier: z.number().min(1),
    maxAttempts: z.number().int().min(1),
  }),
  rollbackPoint: z.string().optional(),
});

export const NotificationChannelTypeSchema = z.enum(['EMAIL', 'SMS', 'WEBHOOK', 'SLACK', 'PAGERDUTY']);

export const NotificationLevelSchema = z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']);

export const NotificationChannelSchema = z.object({
  type: NotificationChannelTypeSchema,
  endpoint: z.string().url(),
  headers: z.record(z.string()).optional(),
  template: z.string().optional(),
});

export const NotificationSettingsSchema = z.object({
  channels: z.array(NotificationChannelSchema),
  levels: z.array(NotificationLevelSchema),
  schedule: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    timezone: z.string().optional(),
  }),
});

export const SafetyCertificationSchema = z.object({
  level: SafetyLevelSchema,
  certifier: z.string().min(1),
  certificationDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  certificateId: z.string().min(1),
  standards: z.array(z.string()),
});

// Resource schemas
export const MemoryRequirementsSchema = z.object({
  flashSize: z.number().int().min(1),
  ramSize: z.number().int().min(1),
  stackSize: z.number().int().min(1),
  heapSize: z.number().int().min(1),
});

export const CPURequirementsSchema = z.object({
  minFrequency: z.number().int().min(1),
  maxInferenceTime: z.number().int().min(1),
  maxConcurrentTasks: z.number().int().min(1),
});

export const StorageRequirementsSchema = z.object({
  minSize: z.number().int().min(1),
  maxSize: z.number().int().min(1),
  fileSystem: z.enum(['FAT32', 'EXT4', 'NONE']),
});

export const NetworkRequirementsSchema = z.object({
  bandwidth: z.number().int().min(1),
  latency: z.number().int().min(1),
  protocols: z.array(z.enum(['HTTP', 'HTTPS', 'MQTT', 'COAP', 'OPC_UA'])),
});

export const PowerRequirementsSchema = z.object({
  voltage: z.number().min(1),
  current: z.number().min(0),
  powerMode: z.enum(['ACTIVE', 'SLEEP', 'STANDBY']),
});

export const ResourceRequirementsSchema = z.object({
  memory: MemoryRequirementsSchema,
  cpu: CPURequirementsSchema,
  storage: StorageRequirementsSchema,
  network: NetworkRequirementsSchema,
  power: PowerRequirementsSchema,
});

// Signature schemas
export const SignatureAlgorithmSchema = z.enum(['ED25519', 'RSA_2048', 'RSA_4096', 'ECDSA_P256']);

export const SignatureScopeSchema = z.enum(['FULL', 'PARTIAL', 'METADATA_ONLY']);

export const SignatureSchema = z.object({
  algorithm: SignatureAlgorithmSchema,
  scope: SignatureScopeSchema,
  signature: z.string().min(1),
  publicKey: z.string().min(1),
  timestamp: z.string().datetime(),
  signer: z.string().min(1),
});

// Deployment schemas
export const DeploymentModeSchema = z.enum(['SINGLE', 'MULTI', 'CLUSTER', 'EDGE']);

export const UpdateTypeSchema = z.enum(['IMMEDIATE', 'SCHEDULED', 'ROLLING', 'BLUE_GREEN', 'CANARY']);

export const RollingUpdateConfigSchema = z.object({
  maxUnavailable: z.number().int().min(0),
  maxSurge: z.number().int().min(0),
  minReadySeconds: z.number().int().min(0),
  progressDeadlineSeconds: z.number().int().min(1),
});

export const BlueGreenConfigSchema = z.object({
  autoSwitchback: z.boolean(),
  switchbackWindow: z.number().int().min(1).optional(),
  preSwitchbackValidation: z.boolean(),
});

export const CanaryConfigSchema = z.object({
  percentage: z.number().min(0).max(100),
  duration: z.number().int().min(1),
  evaluationCriteria: z.array(z.string()),
});

export const UpdateStrategySchema = z.object({
  type: UpdateTypeSchema,
  rollingUpdate: RollingUpdateConfigSchema.optional(),
  blueGreen: BlueGreenConfigSchema.optional(),
  canary: CanaryConfigSchema.optional(),
});

export const SuccessCriteriaSchema = z.object({
  metrics: z.array(z.string()),
  thresholds: z.record(z.number()),
  evaluationPeriod: z.number().int().min(1),
});

export const RollbackTriggerTypeSchema = z.enum(['ERROR_RATE', 'LATENCY', 'CPU_USAGE', 'MEMORY_USAGE', 'CUSTOM']);

export const RollbackTriggerSchema = z.object({
  type: RollbackTriggerTypeSchema,
  threshold: z.number(),
  duration: z.number().int().min(1),
  metric: z.string().optional(),
});

export const RollbackConfigSchema = z.object({
  enabled: z.boolean(),
  triggers: z.array(RollbackTriggerSchema),
  automatic: z.boolean(),
  timeout: z.number().int().min(1),
});

export const HealthCheckConfigSchema = z.object({
  enabled: z.boolean(),
  interval: z.number().int().min(1),
  timeout: z.number().int().min(1),
  failureThreshold: z.number().int().min(1),
  successThreshold: z.number().int().min(1),
  path: z.string().optional(),
});

export const DeploymentConfigSchema = z.object({
  mode: DeploymentModeSchema,
  replicas: z.number().int().min(1),
  updateStrategy: UpdateStrategySchema,
  rollbackConfig: RollbackConfigSchema,
  healthCheck: HealthCheckConfigSchema,
  successCriteria: SuccessCriteriaSchema,
});

// Monitoring schemas
export const MetricTypeSchema = z.enum(['COUNTER', 'GAUGE', 'HISTOGRAM', 'SUMMARY']);

export const CustomMetricSchema = z.object({
  name: z.string().min(1),
  type: MetricTypeSchema,
  description: z.string().optional(),
  unit: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export const MetricsConfigSchema = z.object({
  enabled: z.boolean(),
  interval: z.number().int().min(1),
  customMetrics: z.array(CustomMetricSchema),
  retention: z.number().int().min(1),
});

export const LogLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']);

export const LogFormatSchema = z.enum(['JSON', 'TEXT', 'STRUCTURED']);

export const LoggingConfigSchema = z.object({
  level: LogLevelSchema,
  format: LogFormatSchema,
  output: z.enum(['STDOUT', 'STDERR', 'FILE', 'SYSLOG']),
  filePath: z.string().optional(),
  maxSize: z.number().int().min(1).optional(),
  maxFiles: z.number().int().min(1).optional(),
});

export const AlertSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const AlertRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  severity: AlertSeveritySchema,
  condition: z.string().min(1),
  duration: z.number().int().min(1),
  labels: z.record(z.string()).optional(),
});

export const AlertGroupingSchema = z.object({
  enabled: z.boolean(),
  groupBy: z.array(z.string()),
  interval: z.number().int().min(1),
});

export const AlertingConfigSchema = z.object({
  enabled: z.boolean(),
  rules: z.array(AlertRuleSchema),
  grouping: AlertGroupingSchema,
  notificationChannels: z.array(NotificationChannelSchema),
});

export const CustomSpanSchema = z.object({
  name: z.string().min(1),
  attributes: z.record(z.string()).optional(),
  events: z.array(z.object({
    name: z.string().min(1),
    timestamp: z.string().datetime(),
    attributes: z.record(z.string()).optional(),
  })).optional(),
});

export const TracingConfigSchema = z.object({
  enabled: z.boolean(),
  samplingRate: z.number().min(0).max(1),
  customSpans: z.array(CustomSpanSchema),
  propagation: z.enum(['W3C', 'JAEGER', 'B3']),
});

export const MonitoringConfigSchema = z.object({
  metrics: MetricsConfigSchema,
  logging: LoggingConfigSchema,
  alerting: AlertingConfigSchema,
  tracing: TracingConfigSchema,
});

// Resource limits schemas
export const CPULimitsSchema = z.object({
  requests: z.number().min(0),
  limits: z.number().min(0),
  burst: z.number().min(0).optional(),
});

export const MemoryLimitsSchema = z.object({
  requests: z.number().int().min(0),
  limits: z.number().int().min(0),
  swap: z.number().int().min(0).optional(),
});

export const StorageLimitsSchema = z.object({
  requests: z.number().int().min(0),
  limits: z.number().int().min(0),
  ephemeral: z.number().int().min(0).optional(),
});

export const NetworkLimitsSchema = z.object({
  bandwidth: z.number().int().min(0),
  connections: z.number().int().min(0),
  rateLimit: z.number().int().min(0).optional(),
});

export const ResourceLimitsSchema = z.object({
  cpu: CPULimitsSchema,
  memory: MemoryLimitsSchema,
  storage: StorageLimitsSchema,
  network: NetworkLimitsSchema,
});

// Main Agent Manifest Schema
export const AgentManifestSchema = z.object({
  identity: AgentIdentitySchema,
  vendor: VendorInfoSchema,
  version: VersionInfoSchema,
  compatibility: CompatibilityInfoSchema,
  safety: z.object({
    level: SafetyLevelSchema,
    bounds: SafetyBoundsSchema,
    invariants: z.array(InvariantSpecSchema),
    failSafe: FailSafeBehaviorSchema,
    recovery: RecoveryBehaviorSchema,
    notifications: NotificationSettingsSchema,
    certification: SafetyCertificationSchema.optional(),
  }),
  resources: ResourceRequirementsSchema,
  signature: SignatureSchema,
  deployment: DeploymentConfigSchema,
  monitoring: MonitoringConfigSchema,
  limits: ResourceLimitsSchema,
});

// Export types
export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;
export type VendorInfo = z.infer<typeof VendorInfoSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;
export type CompatibilityInfo = z.infer<typeof CompatibilityInfoSchema>;
export type SafetyLevel = z.infer<typeof SafetyLevelSchema>;
export type DataType = z.infer<typeof DataTypeSchema>;
export type RangeConstraint = z.infer<typeof RangeConstraintSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type QualityRequirement = z.infer<typeof QualityRequirementSchema>;
export type InputValidationRule = z.infer<typeof InputValidationRuleSchema>;
export type OutputConstraint = z.infer<typeof OutputConstraintSchema>;
export type SafetyBounds = z.infer<typeof SafetyBoundsSchema>;
export type InvariantSeverity = z.infer<typeof InvariantSeveritySchema>;
export type InvariantSpec = z.infer<typeof InvariantSpecSchema>;
export type FailSafeBehavior = z.infer<typeof FailSafeBehaviorSchema>;
export type RecoveryBehavior = z.infer<typeof RecoveryBehaviorSchema>;
export type NotificationChannelType = z.infer<typeof NotificationChannelTypeSchema>;
export type NotificationLevel = z.infer<typeof NotificationLevelSchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type SafetyCertification = z.infer<typeof SafetyCertificationSchema>;
export type MemoryRequirements = z.infer<typeof MemoryRequirementsSchema>;
export type CPURequirements = z.infer<typeof CPURequirementsSchema>;
export type StorageRequirements = z.infer<typeof StorageRequirementsSchema>;
export type NetworkRequirements = z.infer<typeof NetworkRequirementsSchema>;
export type PowerRequirements = z.infer<typeof PowerRequirementsSchema>;
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
export type SignatureAlgorithm = z.infer<typeof SignatureAlgorithmSchema>;
export type SignatureScope = z.infer<typeof SignatureScopeSchema>;
export type Signature = z.infer<typeof SignatureSchema>;
export type DeploymentMode = z.infer<typeof DeploymentModeSchema>;
export type UpdateType = z.infer<typeof UpdateTypeSchema>;
export type RollingUpdateConfig = z.infer<typeof RollingUpdateConfigSchema>;
export type BlueGreenConfig = z.infer<typeof BlueGreenConfigSchema>;
export type CanaryConfig = z.infer<typeof CanaryConfigSchema>;
export type UpdateStrategy = z.infer<typeof UpdateStrategySchema>;
export type SuccessCriteria = z.infer<typeof SuccessCriteriaSchema>;
export type RollbackTriggerType = z.infer<typeof RollbackTriggerTypeSchema>;
export type RollbackTrigger = z.infer<typeof RollbackTriggerSchema>;
export type RollbackConfig = z.infer<typeof RollbackConfigSchema>;
export type HealthCheckConfig = z.infer<typeof HealthCheckConfigSchema>;
export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;
export type MetricType = z.infer<typeof MetricTypeSchema>;
export type CustomMetric = z.infer<typeof CustomMetricSchema>;
export type MetricsConfig = z.infer<typeof MetricsConfigSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;
export type LogFormat = z.infer<typeof LogFormatSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;
export type AlertRule = z.infer<typeof AlertRuleSchema>;
export type AlertGrouping = z.infer<typeof AlertGroupingSchema>;
export type AlertingConfig = z.infer<typeof AlertingConfigSchema>;
export type CustomSpan = z.infer<typeof CustomSpanSchema>;
export type TracingConfig = z.infer<typeof TracingConfigSchema>;
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type CPULimits = z.infer<typeof CPULimitsSchema>;
export type MemoryLimits = z.infer<typeof MemoryLimitsSchema>;
export type StorageLimits = z.infer<typeof StorageLimitsSchema>;
export type NetworkLimits = z.infer<typeof NetworkLimitsSchema>;
export type ResourceLimits = z.infer<typeof ResourceLimitsSchema>;
export type AgentManifest = z.infer<typeof AgentManifestSchema>;

// Validation functions
export const validateAgentManifest = (data: unknown): AgentManifest => {
  return AgentManifestSchema.parse(data);
};

export const validateAgentManifestSafe = (data: unknown): { success: true; data: AgentManifest } | { success: false; error: string } => {
  try {
    const result = AgentManifestSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Helper functions for partial validation
export const validatePartialManifest = (data: unknown, fields: (keyof AgentManifest)[]) => {
  const partialSchema = AgentManifestSchema.pick(
    fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
  );
  return partialSchema.parse(data);
};

// Export all schemas for individual use
export const schemas = {
  AgentIdentity: AgentIdentitySchema,
  VendorInfo: VendorInfoSchema,
  VersionInfo: VersionInfoSchema,
  CompatibilityInfo: CompatibilityInfoSchema,
  SafetyLevel: SafetyLevelSchema,
  DataType: DataTypeSchema,
  RangeConstraint: RangeConstraintSchema,
  RateLimit: RateLimitSchema,
  QualityRequirement: QualityRequirementSchema,
  InputValidationRule: InputValidationRuleSchema,
  OutputConstraint: OutputConstraintSchema,
  SafetyBounds: SafetyBoundsSchema,
  InvariantSeverity: InvariantSeveritySchema,
  InvariantSpec: InvariantSpecSchema,
  FailSafeBehavior: FailSafeBehaviorSchema,
  RecoveryBehavior: RecoveryBehaviorSchema,
  NotificationChannelType: NotificationChannelTypeSchema,
  NotificationLevel: NotificationLevelSchema,
  NotificationChannel: NotificationChannelSchema,
  NotificationSettings: NotificationSettingsSchema,
  SafetyCertification: SafetyCertificationSchema,
  MemoryRequirements: MemoryRequirementsSchema,
  CPURequirements: CPURequirementsSchema,
  StorageRequirements: StorageRequirementsSchema,
  NetworkRequirements: NetworkRequirementsSchema,
  PowerRequirements: PowerRequirementsSchema,
  ResourceRequirements: ResourceRequirementsSchema,
  SignatureAlgorithm: SignatureAlgorithmSchema,
  SignatureScope: SignatureScopeSchema,
  Signature: SignatureSchema,
  DeploymentMode: DeploymentModeSchema,
  UpdateType: UpdateTypeSchema,
  RollingUpdateConfig: RollingUpdateConfigSchema,
  BlueGreenConfig: BlueGreenConfigSchema,
  CanaryConfig: CanaryConfigSchema,
  UpdateStrategy: UpdateStrategySchema,
  SuccessCriteria: SuccessCriteriaSchema,
  RollbackTriggerType: RollbackTriggerTypeSchema,
  RollbackTrigger: RollbackTriggerSchema,
  RollbackConfig: RollbackConfigSchema,
  HealthCheckConfig: HealthCheckConfigSchema,
  DeploymentConfig: DeploymentConfigSchema,
  MetricType: MetricTypeSchema,
  CustomMetric: CustomMetricSchema,
  MetricsConfig: MetricsConfigSchema,
  LogLevel: LogLevelSchema,
  LogFormat: LogFormatSchema,
  LoggingConfig: LoggingConfigSchema,
  AlertSeverity: AlertSeveritySchema,
  AlertRule: AlertRuleSchema,
  AlertGrouping: AlertGroupingSchema,
  AlertingConfig: AlertingConfigSchema,
  CustomSpan: CustomSpanSchema,
  TracingConfig: TracingConfigSchema,
  MonitoringConfig: MonitoringConfigSchema,
  CPULimits: CPULimitsSchema,
  MemoryLimits: MemoryLimitsSchema,
  StorageLimits: StorageLimitsSchema,
  NetworkLimits: NetworkLimitsSchema,
  ResourceLimits: ResourceLimitsSchema,
  AgentManifest: AgentManifestSchema,
}; 