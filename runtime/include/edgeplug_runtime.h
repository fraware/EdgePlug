/**
 * @file edgeplug_runtime.h
 * @brief EdgePlug Runtime - Main API for ML agent execution on PLC hardware
 * @version 1.0.0
 * @license MIT
 */

#ifndef EDGEPLUG_RUNTIME_H
#define EDGEPLUG_RUNTIME_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Runtime status codes
 */
typedef enum {
    EDGEPLUG_OK = 0,
    EDGEPLUG_ERROR_INVALID_PARAM = -1,
    EDGEPLUG_ERROR_MEMORY = -2,
    EDGEPLUG_ERROR_AGENT_LOAD = -3,
    EDGEPLUG_ERROR_INFERENCE = -4,
    EDGEPLUG_ERROR_ACTUATION = -5,
    EDGEPLUG_ERROR_SAFETY = -6,
    EDGEPLUG_ERROR_HOTSWAP = -7
} edgeplug_status_t;

/**
 * @brief Agent manifest structure
 */
typedef struct {
    uint32_t version;
    uint32_t agent_id;
    uint32_t flash_size;
    uint32_t sram_size;
    uint8_t signature[64];  // Ed25519 signature
    uint8_t hash[64];       // SHA-512 hash
} edgeplug_manifest_t;

/**
 * @brief Sensor data structure
 */
typedef struct {
    float voltage;
    float current;
    uint64_t timestamp;
    uint8_t quality;
} edgeplug_sensor_data_t;

/**
 * @brief Actuation command structure
 */
typedef struct {
    uint16_t opcua_node;
    uint16_t modbus_addr;
    uint8_t gpio_pin;
    uint8_t gpio_state;
    float value;
} edgeplug_actuation_cmd_t;

/**
 * @brief Runtime configuration
 */
typedef struct {
    uint32_t window_size;
    uint32_t sample_rate;
    uint32_t inference_interval;
    bool enable_safety_guard;
    bool enable_hotswap;
} edgeplug_config_t;

/**
 * @brief Initialize the EdgePlug runtime
 * 
 * @param config Runtime configuration
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_init(const edgeplug_config_t* config);

/**
 * @brief Load an agent from CBOR-encoded data
 * 
 * @param cbor_data CBOR-encoded agent image
 * @param data_size Size of CBOR data
 * @param manifest Agent manifest for verification
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_load_agent(const uint8_t* cbor_data, 
                                     size_t data_size,
                                     const edgeplug_manifest_t* manifest);

/**
 * @brief Process sensor data through the agent
 * 
 * @param sensor_data Input sensor data
 * @param actuation_cmd Output actuation command
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_process_sensors(const edgeplug_sensor_data_t* sensor_data,
                                         edgeplug_actuation_cmd_t* actuation_cmd);

/**
 * @brief Execute actuation command
 * 
 * @param cmd Actuation command to execute
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_execute_actuation(const edgeplug_actuation_cmd_t* cmd);

/**
 * @brief Hot-swap to a new agent
 * 
 * @param new_agent_cbor CBOR-encoded new agent
 * @param new_agent_size Size of new agent data
 * @param new_manifest New agent manifest
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_hotswap_agent(const uint8_t* new_agent_cbor,
                                        size_t new_agent_size,
                                        const edgeplug_manifest_t* new_manifest);

/**
 * @brief Get runtime statistics
 * 
 * @param inference_time_ms Pointer to store inference time in ms
 * @param memory_usage_bytes Pointer to store memory usage in bytes
 * @param safety_trips Pointer to store number of safety guard trips
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_get_stats(uint32_t* inference_time_ms,
                                   uint32_t* memory_usage_bytes,
                                   uint32_t* safety_trips);

/**
 * @brief Deinitialize the runtime
 * 
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t edgeplug_deinit(void);

#ifdef __cplusplus
}
#endif

#endif /* EDGEPLUG_RUNTIME_H */ 