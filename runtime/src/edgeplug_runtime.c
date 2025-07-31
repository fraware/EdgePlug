/**
 * @file edgeplug_runtime.c
 * @brief Main EdgePlug runtime implementation
 * @version 1.0.0
 * @license MIT
 */

#include "edgeplug_runtime.h"
#include "agent_loader.h"
#include "preprocess.h"
#include "infer.h"
#include "actuator.h"
#include <string.h>
#include <stdlib.h>

// Runtime state
static struct {
    edgeplug_config_t config;
    bool initialized;
    uint32_t sensor_count;
    uint32_t inference_count;
    uint32_t safety_trips;
} runtime_state = {0};

// Performance tracking
static uint32_t total_inference_time = 0;
static uint32_t total_memory_usage = 0;

/**
 * @brief Initialize the EdgePlug runtime
 */
edgeplug_status_t edgeplug_init(const edgeplug_config_t* config) {
    if (!config) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Validate configuration
    if (config->window_size == 0 || config->sample_rate == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Initialize runtime state
    memcpy(&runtime_state.config, config, sizeof(edgeplug_config_t));
    runtime_state.initialized = true;
    runtime_state.sensor_count = 0;
    runtime_state.inference_count = 0;
    runtime_state.safety_trips = 0;
    
    // Initialize modules
    edgeplug_status_t status;
    
    status = preprocess_init(config->window_size);
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    status = infer_init();
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    status = actuator_init();
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Load an agent from CBOR-encoded data
 */
edgeplug_status_t edgeplug_load_agent(const uint8_t* cbor_data, size_t data_size,
                                     const edgeplug_manifest_t* manifest) {
    if (!runtime_state.initialized) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (!cbor_data || !manifest || data_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    return agent_loader_load(cbor_data, data_size, manifest);
}

/**
 * @brief Process sensor data through the agent
 */
edgeplug_status_t edgeplug_process_sensors(const edgeplug_sensor_data_t* sensor_data,
                                         edgeplug_actuation_cmd_t* actuation_cmd) {
    if (!runtime_state.initialized || !sensor_data || !actuation_cmd) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Add sensor data to pre-processing window
    edgeplug_status_t status = preprocess_add_sample(sensor_data);
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    runtime_state.sensor_count++;
    
    // Check if window is ready for processing
    if (!preprocess_is_window_ready()) {
        // Window not full yet, return no actuation
        memset(actuation_cmd, 0, sizeof(edgeplug_actuation_cmd_t));
        return EDGEPLUG_OK;
    }
    
    // Normalize window data to int8
    int8_t normalized_data[256];  // Max window size
    size_t normalized_size;
    
    status = preprocess_normalize_window(normalized_data, &normalized_size);
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    // Run inference
    int8_t inference_output[256];
    size_t output_size;
    
    status = infer_int8(normalized_data, normalized_size, inference_output, &output_size);
    if (status != EDGEPLUG_OK) {
        return status;
    }
    
    runtime_state.inference_count++;
    
    // Convert inference output to actuation command
    // This is a simplified conversion - in practice, this would be more sophisticated
    if (output_size > 0) {
        // Simple threshold-based decision
        int32_t sum = 0;
        for (size_t i = 0; i < output_size; i++) {
            sum += inference_output[i];
        }
        
        float avg_output = (float)sum / output_size;
        
        // Generate actuation command based on inference result
        actuation_cmd->opcua_node = 1001;  // Example OPC-UA node
        actuation_cmd->modbus_addr = 1001;  // Example Modbus address
        actuation_cmd->gpio_pin = 1;        // Example GPIO pin
        actuation_cmd->gpio_state = (avg_output > 0) ? 1 : 0;
        actuation_cmd->value = avg_output;
    } else {
        // No output, set safe defaults
        memset(actuation_cmd, 0, sizeof(edgeplug_actuation_cmd_t));
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Execute actuation command
 */
edgeplug_status_t edgeplug_execute_actuation(const edgeplug_actuation_cmd_t* cmd) {
    if (!runtime_state.initialized || !cmd) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    return actuator_execute_command(cmd);
}

/**
 * @brief Hot-swap to a new agent
 */
edgeplug_status_t edgeplug_hotswap_agent(const uint8_t* new_agent_cbor, size_t new_agent_size,
                                        const edgeplug_manifest_t* new_manifest) {
    if (!runtime_state.initialized) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (!runtime_state.config.enable_hotswap) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (!new_agent_cbor || !new_manifest || new_agent_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    return agent_loader_hotswap(new_agent_cbor, new_agent_size, new_manifest);
}

/**
 * @brief Get runtime statistics
 */
edgeplug_status_t edgeplug_get_stats(uint32_t* inference_time_ms,
                                   uint32_t* memory_usage_bytes,
                                   uint32_t* safety_trips) {
    if (!runtime_state.initialized) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Get inference statistics
    uint32_t count, avg_time, max_time;
    infer_get_stats(&count, &avg_time, &max_time);
    
    if (inference_time_ms) {
        *inference_time_ms = avg_time;
    }
    
    // Calculate memory usage
    if (memory_usage_bytes) {
        // Sum up memory usage from all modules
        *memory_usage_bytes = 
            16 * 1024 +  // Agent slots (16KB each)
            1 * 1024 +   // Window buffer (1KB)
            1 * 1024 +   // Inference buffer (1KB)
            512 +         // Actuator buffers (512B)
            1 * 1024;    // Safety VM (1KB)
    }
    
    if (safety_trips) {
        *safety_trips = runtime_state.safety_trips;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Deinitialize the runtime
 */
edgeplug_status_t edgeplug_deinit(void) {
    if (!runtime_state.initialized) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Reset runtime state
    memset(&runtime_state, 0, sizeof(runtime_state));
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get current runtime configuration
 */
const edgeplug_config_t* edgeplug_get_config(void) {
    return runtime_state.initialized ? &runtime_state.config : NULL;
}

/**
 * @brief Check if runtime is initialized
 */
bool edgeplug_is_initialized(void) {
    return runtime_state.initialized;
}

/**
 * @brief Get sensor count
 */
uint32_t edgeplug_get_sensor_count(void) {
    return runtime_state.sensor_count;
}

/**
 * @brief Get inference count
 */
uint32_t edgeplug_get_inference_count(void) {
    return runtime_state.inference_count;
}

/**
 * @brief Reset runtime statistics
 */
edgeplug_status_t edgeplug_reset_stats(void) {
    if (!runtime_state.initialized) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    runtime_state.sensor_count = 0;
    runtime_state.inference_count = 0;
    runtime_state.safety_trips = 0;
    
    infer_reset_stats();
    actuator_reset_stats();
    
    return EDGEPLUG_OK;
} 