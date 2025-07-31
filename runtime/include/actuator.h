/**
 * @file actuator.h
 * @brief Actuator module header
 * @version 1.0.0
 * @license MIT
 */

#ifndef ACTUATOR_H
#define ACTUATOR_H

#include "edgeplug_runtime.h"
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Initialize actuator layer
 */
edgeplug_status_t actuator_init(void);

/**
 * @brief Write to OPC-UA node
 */
edgeplug_status_t actuator_write_opcua(uint16_t node_id, float value);

/**
 * @brief Write to Modbus register
 */
edgeplug_status_t actuator_write_modbus(uint16_t address, uint16_t value);

/**
 * @brief Write to GPIO pin
 */
edgeplug_status_t actuator_write_gpio(uint8_t pin, uint8_t state);

/**
 * @brief Execute actuation command
 */
edgeplug_status_t actuator_execute_command(const edgeplug_actuation_cmd_t* cmd);

/**
 * @brief Configure OPC-UA connection
 */
edgeplug_status_t actuator_config_opcua(const char* server_url, uint16_t port);

/**
 * @brief Configure Modbus connection
 */
edgeplug_status_t actuator_config_modbus(uint8_t slave_id, uint32_t baud_rate);

/**
 * @brief Configure GPIO pins
 */
edgeplug_status_t actuator_config_gpio(const uint8_t* pins, uint8_t pin_count);

/**
 * @brief Get actuator statistics
 */
edgeplug_status_t actuator_get_stats(uint32_t* count, uint32_t* avg_time,
                                   uint32_t* max_time);

/**
 * @brief Check connection status
 */
edgeplug_status_t actuator_get_connection_status(bool* opcua_connected, bool* modbus_connected);

/**
 * @brief Reset actuator statistics
 */
edgeplug_status_t actuator_reset_stats(void);

#ifdef __cplusplus
}
#endif

#endif /* ACTUATOR_H */ 