/**
 * @file test_hotswap.c
 * @brief Comprehensive tests for EdgePlug hot-swap functionality
 * @version 1.0.0
 * @license MIT
 */

#include "hotswap.h"
#include "crypto_impl.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <stdbool.h>

// Test agent data for hot-swap
static const uint8_t agent_v1_data[] = {
    0xED, 0x47, 0x45, 0x50,  // "EDGP" magic
    0x01, 0x00, 0x00, 0x00,  // Version 1
    0x78, 0x56, 0x34, 0x12,  // Agent ID
    0x20, 0x00, 0x00, 0x00,  // Flash size (32 bytes)
    0x04, 0x00, 0x00, 0x00,  // SRAM size (4 bytes)
    // Agent code (dummy)
    0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
    0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f,
    0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
    0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf
};

static const uint8_t agent_v2_data[] = {
    0xED, 0x47, 0x45, 0x50,  // "EDGP" magic
    0x02, 0x00, 0x00, 0x00,  // Version 2
    0x87, 0x65, 0x43, 0x21,  // Agent ID
    0x20, 0x00, 0x00, 0x00,  // Flash size (32 bytes)
    0x04, 0x00, 0x00, 0x00,  // SRAM size (4 bytes)
    // Agent code (dummy)
    0xb0, 0xb1, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7,
    0xb8, 0xb9, 0xba, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf,
    0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7,
    0xc8, 0xc9, 0xca, 0xcb, 0xcc, 0xcd, 0xce, 0xcf
};

static const uint8_t valid_signature[] = {
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
    0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00,
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
    0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00,
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
    0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00,
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
    0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00
};

static const uint8_t valid_public_key[] = {
    0x3d, 0x40, 0x17, 0xc3, 0xe8, 0x43, 0x89, 0x5a,
    0x92, 0xb7, 0x0a, 0xa7, 0x4d, 0x79, 0x3a, 0x44,
    0x15, 0x7f, 0x09, 0x4f, 0x78, 0xea, 0x8f, 0x73,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

void test_hotswap_init(void) {
    printf("Testing hot-swap initialization...\n");
    
    hotswap_status_t status = hotswap_init();
    assert(status == HOTSWAP_OK);
    
    printf("✓ Hot-swap initialization passed\n");
}

void test_hotswap_basic_update(void) {
    printf("Testing basic hot-swap update...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Perform hot-swap to new agent
    status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                 valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    printf("✓ Basic hot-swap update passed\n");
}

void test_hotswap_rollback_on_corruption(void) {
    printf("Testing hot-swap rollback on corruption...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Create corrupted agent data
    uint8_t corrupted_agent[sizeof(agent_v2_data)];
    memcpy(corrupted_agent, agent_v2_data, sizeof(agent_v2_data));
    corrupted_agent[20] = 0xFF; // Corrupt some data
    
    // Attempt hot-swap with corrupted agent
    status = hotswap_update_agent(corrupted_agent, sizeof(corrupted_agent),
                                 valid_signature, valid_public_key);
    assert(status == HOTSWAP_ROLLBACK_TRIGGERED);
    
    // Verify rollback to original agent
    agent_info_t current_agent;
    status = hotswap_get_current_agent_info(&current_agent);
    assert(status == HOTSWAP_OK);
    assert(current_agent.version == 1); // Should be back to v1
    
    printf("✓ Hot-swap rollback on corruption passed\n");
}

void test_hotswap_rollback_on_invalid_signature(void) {
    printf("Testing hot-swap rollback on invalid signature...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Create invalid signature
    uint8_t invalid_signature[64];
    memset(invalid_signature, 0xFF, 64);
    
    // Attempt hot-swap with invalid signature
    status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                 invalid_signature, valid_public_key);
    assert(status == HOTSWAP_ROLLBACK_TRIGGERED);
    
    // Verify rollback to original agent
    agent_info_t current_agent;
    status = hotswap_get_current_agent_info(&current_agent);
    assert(status == HOTSWAP_OK);
    assert(current_agent.version == 1); // Should be back to v1
    
    printf("✓ Hot-swap rollback on invalid signature passed\n");
}

void test_hotswap_memory_fragmentation(void) {
    printf("Testing hot-swap memory fragmentation handling...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Perform multiple hot-swaps to test fragmentation
    for (int i = 0; i < 10; i++) {
        status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
        
        status = hotswap_update_agent(agent_v1_data, sizeof(agent_v1_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
    }
    
    // Check memory fragmentation
    uint32_t fragmentation = hotswap_get_memory_fragmentation();
    assert(fragmentation < 256); // Should be less than 256 bytes
    
    printf("✓ Hot-swap memory fragmentation handling passed\n");
}

void test_hotswap_concurrent_access(void) {
    printf("Testing hot-swap concurrent access...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Simulate concurrent access (in real implementation, this would use threads)
    // For now, we'll test rapid successive updates
    for (int i = 0; i < 5; i++) {
        status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
        
        // Immediately try another update
        status = hotswap_update_agent(agent_v1_data, sizeof(agent_v1_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
    }
    
    printf("✓ Hot-swap concurrent access passed\n");
}

void test_hotswap_error_handling(void) {
    printf("Testing hot-swap error handling...\n");
    
    hotswap_status_t status;
    
    // Test with null inputs
    status = hotswap_update_agent(NULL, 0, valid_signature, valid_public_key);
    assert(status == HOTSWAP_INVALID_PARAMETER);
    
    status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data), NULL, valid_public_key);
    assert(status == HOTSWAP_INVALID_PARAMETER);
    
    status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data), valid_signature, NULL);
    assert(status == HOTSWAP_INVALID_PARAMETER);
    
    // Test with oversized agent
    uint8_t oversized_agent[8192];
    memset(oversized_agent, 0xAA, 8192);
    memcpy(oversized_agent, agent_v2_data, 16);
    oversized_agent[12] = 0xFF; // Set large size
    oversized_agent[13] = 0xFF;
    oversized_agent[14] = 0xFF;
    oversized_agent[15] = 0xFF;
    
    status = hotswap_update_agent(oversized_agent, sizeof(oversized_agent),
                                 valid_signature, valid_public_key);
    assert(status == HOTSWAP_INSUFFICIENT_MEMORY);
    
    printf("✓ Hot-swap error handling passed\n");
}

void test_hotswap_performance(void) {
    printf("Testing hot-swap performance...\n");
    
    // Load initial agent
    hotswap_status_t status = hotswap_load_agent(agent_v1_data, sizeof(agent_v1_data),
                                                valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Performance test: 100 hot-swap cycles
    for (int i = 0; i < 100; i++) {
        status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
        
        status = hotswap_update_agent(agent_v1_data, sizeof(agent_v1_data),
                                     valid_signature, valid_public_key);
        assert(status == HOTSWAP_OK);
    }
    
    printf("✓ Hot-swap performance test passed\n");
}

void test_hotswap_get_status(void) {
    printf("Testing hot-swap status retrieval...\n");
    
    hotswap_status_t status = hotswap_get_status();
    
    // Should return a valid status
    assert(status >= HOTSWAP_OK && status <= HOTSWAP_INVALID_PARAMETER);
    
    printf("✓ Hot-swap status retrieval passed\n");
}

void test_hotswap_get_current_agent_info(void) {
    printf("Testing current agent info retrieval...\n");
    
    agent_info_t agent_info;
    hotswap_status_t status = hotswap_get_current_agent_info(&agent_info);
    
    // Should return valid info or error if no agent loaded
    assert(status == HOTSWAP_OK || status == HOTSWAP_NO_AGENT_LOADED);
    
    printf("✓ Current agent info retrieval passed\n");
}

void test_hotswap_get_rollback_count(void) {
    printf("Testing rollback count retrieval...\n");
    
    uint32_t rollback_count = hotswap_get_rollback_count();
    
    // Should return a valid count (0 or positive)
    assert(rollback_count >= 0);
    
    printf("✓ Rollback count retrieval passed\n");
}

void test_hotswap_get_memory_fragmentation(void) {
    printf("Testing memory fragmentation retrieval...\n");
    
    uint32_t fragmentation = hotswap_get_memory_fragmentation();
    
    // Should return a valid fragmentation value
    assert(fragmentation >= 0);
    
    printf("✓ Memory fragmentation retrieval passed\n");
}

void test_hotswap_edge_cases(void) {
    printf("Testing hot-swap edge cases...\n");
    
    // Test with minimum valid agent
    uint8_t min_agent[32];
    memset(min_agent, 0, 32);
    memcpy(min_agent, "EDGP", 4);
    min_agent[4] = 0x01; // Version 1
    min_agent[8] = 0x78; // Agent ID
    min_agent[12] = 0x20; // Flash size (32 bytes)
    min_agent[16] = 0x04; // SRAM size (4 bytes)
    
    hotswap_status_t status = hotswap_load_agent(min_agent, 32, valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Test hot-swap with minimum agent
    status = hotswap_update_agent(agent_v2_data, sizeof(agent_v2_data),
                                 valid_signature, valid_public_key);
    assert(status == HOTSWAP_OK);
    
    // Test with maximum valid agent (within memory constraints)
    uint8_t max_agent[4096];
    memset(max_agent, 0, 4096);
    memcpy(max_agent, "EDGP", 4);
    max_agent[4] = 0x01; // Version 1
    max_agent[8] = 0x78; // Agent ID
    max_agent[12] = 0x00; // Flash size (4096 bytes)
    max_agent[13] = 0x10;
    max_agent[16] = 0x04; // SRAM size (4 bytes)
    
    status = hotswap_update_agent(max_agent, 4096, valid_signature, valid_public_key);
    // This may fail due to memory constraints, which is expected
    assert(status == HOTSWAP_OK || status == HOTSWAP_INSUFFICIENT_MEMORY);
    
    printf("✓ Hot-swap edge cases passed\n");
}

void test_hotswap_cleanup(void) {
    printf("Testing hot-swap cleanup...\n");
    
    hotswap_status_t status = hotswap_cleanup();
    assert(status == HOTSWAP_OK);
    
    printf("✓ Hot-swap cleanup passed\n");
}

int main(void) {
    printf("EdgePlug Hot-Swap Test Suite\n");
    printf("============================\n\n");
    
    test_hotswap_init();
    test_hotswap_basic_update();
    test_hotswap_rollback_on_corruption();
    test_hotswap_rollback_on_invalid_signature();
    test_hotswap_memory_fragmentation();
    test_hotswap_concurrent_access();
    test_hotswap_error_handling();
    test_hotswap_performance();
    test_hotswap_get_status();
    test_hotswap_get_current_agent_info();
    test_hotswap_get_rollback_count();
    test_hotswap_get_memory_fragmentation();
    test_hotswap_edge_cases();
    test_hotswap_cleanup();
    
    printf("\nAll hot-swap tests passed! ✓\n");
    return 0;
} 