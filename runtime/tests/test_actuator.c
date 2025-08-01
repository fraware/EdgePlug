/**
 * @file test_actuator.c
 * @brief Test suite for EdgePlug actuator functionality
 * @version 1.0.0
 * @license MIT
 */

#include "actuator.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <math.h>

// Mock hardware interface for testing
static bool mock_gpio_states[16] = {false};
static float mock_analog_values[8] = {0.0f};
static uint16_t mock_modbus_registers[100] = {0};
static uint16_t mock_opcua_nodes[100] = {0};

void test_actuator_init(void) {
    printf("Testing actuator initialization...\n");
    
    actuator_config_t config = {
        .gpio_count = 16,
        .analog_count = 8,
        .modbus_slave_count = 4,
        .opcua_server_count = 2,
        .enable_safety_checks = true,
        .enable_limits = true,
        .max_voltage = 24.0f,
        .max_current = 5.0f
    };
    
    actuator_status_t status = actuator_init(&config);
    assert(status == ACTUATOR_OK);
    assert(actuator_is_initialized());
    
    printf("✓ Actuator initialization passed\n");
}

void test_gpio_control(void) {
    printf("Testing GPIO control...\n");
    
    // Test GPIO output
    actuator_gpio_cmd_t gpio_cmd = {
        .pin = 5,
        .state = true,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up = false,
        .pull_down = false
    };
    
    actuator_status_t status = actuator_set_gpio(&gpio_cmd);
    assert(status == ACTUATOR_OK);
    assert(mock_gpio_states[5] == true);
    
    // Test GPIO input reading
    bool input_state;
    status = actuator_get_gpio(5, &input_state);
    assert(status == ACTUATOR_OK);
    assert(input_state == true);
    
    // Test GPIO toggle
    status = actuator_toggle_gpio(5);
    assert(status == ACTUATOR_OK);
    assert(mock_gpio_states[5] == false);
    
    printf("✓ GPIO control passed\n");
}

void test_analog_output(void) {
    printf("Testing analog output...\n");
    
    actuator_analog_cmd_t analog_cmd = {
        .channel = 2,
        .value = 3.3f,
        .voltage_range = 0.0f,
        .current_range = 5.0f,
        .resolution = 12
    };
    
    actuator_status_t status = actuator_set_analog(&analog_cmd);
    assert(status == ACTUATOR_OK);
    assert(fabs(mock_analog_values[2] - 3.3f) < 0.1f);
    
    // Test analog reading
    float read_value;
    status = actuator_get_analog(2, &read_value);
    assert(status == ACTUATOR_OK);
    assert(fabs(read_value - 3.3f) < 0.1f);
    
    printf("✓ Analog output passed\n");
}

void test_modbus_control(void) {
    printf("Testing Modbus control...\n");
    
    actuator_modbus_cmd_t modbus_cmd = {
        .slave_id = 1,
        .register_addr = 1001,
        .register_count = 2,
        .function_code = MODBUS_FUNCTION_WRITE_HOLDING_REGISTERS,
        .data = {100, 200},
        .timeout_ms = 1000
    };
    
    actuator_status_t status = actuator_modbus_write(&modbus_cmd);
    assert(status == ACTUATOR_OK);
    assert(mock_modbus_registers[1001] == 100);
    assert(mock_modbus_registers[1002] == 200);
    
    // Test Modbus read
    uint16_t read_data[2];
    status = actuator_modbus_read(1, 1001, 2, read_data);
    assert(status == ACTUATOR_OK);
    assert(read_data[0] == 100);
    assert(read_data[1] == 200);
    
    printf("✓ Modbus control passed\n");
}

void test_opcua_control(void) {
    printf("Testing OPC UA control...\n");
    
    actuator_opcua_cmd_t opcua_cmd = {
        .server_id = 1,
        .node_id = 1001,
        .data_type = OPCUA_DATA_TYPE_FLOAT,
        .value = {.float_value = 42.5f},
        .quality = OPCUA_QUALITY_GOOD,
        .timestamp = 1234567890
    };
    
    actuator_status_t status = actuator_opcua_write(&opcua_cmd);
    assert(status == ACTUATOR_OK);
    assert(mock_opcua_nodes[1001] == 42);
    
    // Test OPC UA read
    actuator_opcua_value_t read_value;
    status = actuator_opcua_read(1, 1001, &read_value);
    assert(status == ACTUATOR_OK);
    assert(fabs(read_value.float_value - 42.5f) < 0.1f);
    
    printf("✓ OPC UA control passed\n");
}

void test_pwm_control(void) {
    printf("Testing PWM control...\n");
    
    actuator_pwm_cmd_t pwm_cmd = {
        .channel = 3,
        .frequency = 1000,
        .duty_cycle = 75.0f,
        .voltage = 12.0f,
        .enable = true
    };
    
    actuator_status_t status = actuator_set_pwm(&pwm_cmd);
    assert(status == ACTUATOR_OK);
    
    // Test PWM reading
    actuator_pwm_info_t pwm_info;
    status = actuator_get_pwm(3, &pwm_info);
    assert(status == ACTUATOR_OK);
    assert(pwm_info.frequency == 1000);
    assert(fabs(pwm_info.duty_cycle - 75.0f) < 0.1f);
    assert(pwm_info.enable == true);
    
    printf("✓ PWM control passed\n");
}

void test_safety_checks(void) {
    printf("Testing safety checks...\n");
    
    // Test voltage limit violation
    actuator_analog_cmd_t overvoltage_cmd = {
        .channel = 1,
        .value = 30.0f,  // Exceeds 24V limit
        .voltage_range = 0.0f,
        .current_range = 5.0f,
        .resolution = 12
    };
    
    actuator_status_t status = actuator_set_analog(&overvoltage_cmd);
    assert(status == ACTUATOR_ERROR_SAFETY_VIOLATION);
    
    // Test current limit violation
    actuator_analog_cmd_t overcurrent_cmd = {
        .channel = 2,
        .value = 6.0f,  // Exceeds 5A limit
        .voltage_range = 0.0f,
        .current_range = 5.0f,
        .resolution = 12
    };
    
    status = actuator_set_analog(&overcurrent_cmd);
    assert(status == ACTUATOR_ERROR_SAFETY_VIOLATION);
    
    printf("✓ Safety checks passed\n");
}

void test_emergency_stop(void) {
    printf("Testing emergency stop...\n");
    
    // Set some outputs
    actuator_gpio_cmd_t gpio_cmd = {
        .pin = 3,
        .state = true,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up = false,
        .pull_down = false
    };
    actuator_set_gpio(&gpio_cmd);
    
    actuator_analog_cmd_t analog_cmd = {
        .channel = 4,
        .value = 5.0f,
        .voltage_range = 0.0f,
        .current_range = 5.0f,
        .resolution = 12
    };
    actuator_set_analog(&analog_cmd);
    
    // Trigger emergency stop
    actuator_status_t status = actuator_emergency_stop();
    assert(status == ACTUATOR_OK);
    
    // Verify all outputs are disabled
    assert(mock_gpio_states[3] == false);
    assert(mock_analog_values[4] == 0.0f);
    
    printf("✓ Emergency stop passed\n");
}

void test_status_monitoring(void) {
    printf("Testing status monitoring...\n");
    
    actuator_status_info_t status_info;
    actuator_status_t status = actuator_get_status(&status_info);
    assert(status == ACTUATOR_OK);
    
    // Verify status information
    assert(status_info.gpio_count >= 0);
    assert(status_info.analog_count >= 0);
    assert(status_info.modbus_slave_count >= 0);
    assert(status_info.opcua_server_count >= 0);
    assert(status_info.temperature >= 0.0f);
    assert(status_info.voltage >= 0.0f);
    assert(status_info.current >= 0.0f);
    
    printf("✓ Status monitoring passed\n");
}

void test_error_handling(void) {
    printf("Testing error handling...\n");
    
    // Test invalid GPIO pin
    actuator_gpio_cmd_t invalid_gpio = {
        .pin = 20,  // Invalid pin
        .state = true,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up = false,
        .pull_down = false
    };
    
    actuator_status_t status = actuator_set_gpio(&invalid_gpio);
    assert(status == ACTUATOR_ERROR_INVALID_PARAMETER);
    
    // Test invalid analog channel
    actuator_analog_cmd_t invalid_analog = {
        .channel = 10,  // Invalid channel
        .value = 5.0f,
        .voltage_range = 0.0f,
        .current_range = 5.0f,
        .resolution = 12
    };
    
    status = actuator_set_analog(&invalid_analog);
    assert(status == ACTUATOR_ERROR_INVALID_PARAMETER);
    
    // Test null pointer
    status = actuator_get_status(NULL);
    assert(status == ACTUATOR_ERROR_NULL_POINTER);
    
    printf("✓ Error handling passed\n");
}

void test_actuator_cleanup(void) {
    printf("Testing actuator cleanup...\n");
    
    actuator_status_t status = actuator_cleanup();
    assert(status == ACTUATOR_OK);
    assert(!actuator_is_initialized());
    
    printf("✓ Actuator cleanup passed\n");
}

int main(void) {
    printf("=== EdgePlug Actuator Test Suite ===\n\n");
    
    test_actuator_init();
    test_gpio_control();
    test_analog_output();
    test_modbus_control();
    test_opcua_control();
    test_pwm_control();
    test_safety_checks();
    test_emergency_stop();
    test_status_monitoring();
    test_error_handling();
    test_actuator_cleanup();
    
    printf("\n=== All actuator tests passed! ===\n");
    return 0;
} 