/**
 * @file test_runtime.c
 * @brief Basic test for EdgePlug runtime
 * @version 1.0.0
 * @license MIT
 */

#include "edgeplug_runtime.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>

// Mock agent data for testing
static uint8_t mock_agent_data[] = {
    0xA1, 0x63, 0x6D, 0x6F, 0x64, 0x65, 0x6C, 0x41,  // CBOR: {"model": "A"}
    0x63, 0x70, 0x72, 0x65, 0x70, 0x41,              // "prep": "A"
    0x63, 0x61, 0x63, 0x74, 0x41                      // "act": "A"
};

static edgeplug_manifest_t mock_manifest = {
    .version = 1,
    .agent_id = 0x12345678,
    .flash_size = sizeof(mock_agent_data),
    .sram_size = 1024,
    .signature = {0xAA, 0xBB, 0xCC, 0xDD, /* ... */},
    .hash = {0x11, 0x22, 0x33, 0x44, /* ... */}
};

static edgeplug_config_t test_config = {
    .window_size = 64,
    .sample_rate = 1000,
    .inference_interval = 100,
    .enable_safety_guard = true,
    .enable_hotswap = true
};

void test_runtime_init(void) {
    printf("Testing runtime initialization...\n");
    
    edgeplug_status_t status = edgeplug_init(&test_config);
    assert(status == EDGEPLUG_OK);
    assert(edgeplug_is_initialized());
    
    printf("✓ Runtime initialization passed\n");
}

void test_agent_loading(void) {
    printf("Testing agent loading...\n");
    
    edgeplug_status_t status = edgeplug_load_agent(mock_agent_data, 
                                                  sizeof(mock_agent_data),
                                                  &mock_manifest);
    assert(status == EDGEPLUG_OK);
    
    printf("✓ Agent loading passed\n");
}

void test_sensor_processing(void) {
    printf("Testing sensor processing...\n");
    
    // Create test sensor data
    edgeplug_sensor_data_t sensor_data = {
        .voltage = 120.0f,
        .current = 1.0f,
        .timestamp = 1234567890,
        .quality = 100
    };
    
    edgeplug_actuation_cmd_t actuation_cmd;
    
    // Process multiple samples to fill window
    for (int i = 0; i < 64; i++) {
        edgeplug_status_t status = edgeplug_process_sensors(&sensor_data, &actuation_cmd);
        assert(status == EDGEPLUG_OK);
    }
    
    printf("✓ Sensor processing passed\n");
}

void test_actuation(void) {
    printf("Testing actuation...\n");
    
    edgeplug_actuation_cmd_t cmd = {
        .opcua_node = 1001,
        .modbus_addr = 1001,
        .gpio_pin = 1,
        .gpio_state = 1,
        .value = 5.0f
    };
    
    edgeplug_status_t status = edgeplug_execute_actuation(&cmd);
    assert(status == EDGEPLUG_OK);
    
    printf("✓ Actuation passed\n");
}

void test_statistics(void) {
    printf("Testing statistics...\n");
    
    uint32_t inference_time, memory_usage, safety_trips;
    edgeplug_status_t status = edgeplug_get_stats(&inference_time, &memory_usage, &safety_trips);
    assert(status == EDGEPLUG_OK);
    
    printf("  Inference time: %u ms\n", inference_time);
    printf("  Memory usage: %u bytes\n", memory_usage);
    printf("  Safety trips: %u\n", safety_trips);
    
    printf("✓ Statistics passed\n");
}

void test_hotswap(void) {
    printf("Testing hot-swap...\n");
    
    // Create new agent data
    uint8_t new_agent_data[] = {
        0xA1, 0x63, 0x6D, 0x6F, 0x64, 0x65, 0x6C, 0x42,  // CBOR: {"model": "B"}
        0x63, 0x70, 0x72, 0x65, 0x70, 0x42,              // "prep": "B"
        0x63, 0x61, 0x63, 0x74, 0x42                      // "act": "B"
    };
    
    edgeplug_manifest_t new_manifest = {
        .version = 2,
        .agent_id = 0x87654321,
        .flash_size = sizeof(new_agent_data),
        .sram_size = 1024,
        .signature = {0xEE, 0xFF, 0x00, 0x11, /* ... */},
        .hash = {0x55, 0x66, 0x77, 0x88, /* ... */}
    };
    
    edgeplug_status_t status = edgeplug_hotswap_agent(new_agent_data, 
                                                     sizeof(new_agent_data),
                                                     &new_manifest);
    assert(status == EDGEPLUG_OK);
    
    printf("✓ Hot-swap passed\n");
}

void test_cleanup(void) {
    printf("Testing cleanup...\n");
    
    edgeplug_status_t status = edgeplug_deinit();
    assert(status == EDGEPLUG_OK);
    assert(!edgeplug_is_initialized());
    
    printf("✓ Cleanup passed\n");
}

int main(void) {
    printf("EdgePlug Runtime Test Suite\n");
    printf("==========================\n\n");
    
    test_runtime_init();
    test_agent_loading();
    test_sensor_processing();
    test_actuation();
    test_statistics();
    test_hotswap();
    test_cleanup();
    
    printf("\nAll tests passed! ✓\n");
    return 0;
} 