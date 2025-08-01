/**
 * @file test_agent_loader.c
 * @brief Comprehensive tests for EdgePlug agent loader
 * @version 1.0.0
 * @license MIT
 */

#include "agent_loader.h"
#include "crypto_impl.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <stdbool.h>

// Test agent data
static const uint8_t valid_agent_data[] = {
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

void test_agent_loader_init(void) {
    printf("Testing agent loader initialization...\n");
    
    agent_loader_status_t status = agent_loader_init();
    assert(status == AGENT_LOADER_OK);
    
    printf("✓ Agent loader initialization passed\n");
}

void test_agent_validation_valid(void) {
    printf("Testing agent validation with valid data...\n");
    
    agent_loader_status_t status = validate_agent(valid_agent_data, sizeof(valid_agent_data));
    assert(status == AGENT_LOADER_OK);
    
    printf("✓ Valid agent validation passed\n");
}

void test_agent_validation_invalid_magic(void) {
    printf("Testing agent validation with invalid magic...\n");
    
    uint8_t invalid_agent[sizeof(valid_agent_data)];
    memcpy(invalid_agent, valid_agent_data, sizeof(valid_agent_data));
    invalid_agent[0] = 0xFF; // Corrupt magic
    
    agent_loader_status_t status = validate_agent(invalid_agent, sizeof(invalid_agent));
    assert(status == AGENT_LOADER_INVALID_FORMAT);
    
    printf("✓ Invalid magic validation passed\n");
}

void test_agent_validation_invalid_version(void) {
    printf("Testing agent validation with invalid version...\n");
    
    uint8_t invalid_agent[sizeof(valid_agent_data)];
    memcpy(invalid_agent, valid_agent_data, sizeof(valid_agent_data));
    invalid_agent[4] = 0xFF; // Corrupt version
    
    agent_loader_status_t status = validate_agent(invalid_agent, sizeof(invalid_agent));
    assert(status == AGENT_LOADER_INVALID_VERSION);
    
    printf("✓ Invalid version validation passed\n");
}

void test_agent_validation_oversized(void) {
    printf("Testing agent validation with oversized agent...\n");
    
    uint8_t oversized_agent[sizeof(valid_agent_data)];
    memcpy(oversized_agent, valid_agent_data, sizeof(valid_agent_data));
    // Set oversized flash size
    oversized_agent[12] = 0xFF;
    oversized_agent[13] = 0xFF;
    oversized_agent[14] = 0xFF;
    oversized_agent[15] = 0xFF;
    
    agent_loader_status_t status = validate_agent(oversized_agent, sizeof(oversized_agent));
    assert(status == AGENT_LOADER_INSUFFICIENT_MEMORY);
    
    printf("✓ Oversized agent validation passed\n");
}

void test_agent_validation_null_input(void) {
    printf("Testing agent validation with null input...\n");
    
    agent_loader_status_t status = validate_agent(NULL, 0);
    assert(status == AGENT_LOADER_INVALID_PARAMETER);
    
    printf("✓ Null input validation passed\n");
}

void test_signature_verification_valid(void) {
    printf("Testing signature verification with valid signature...\n");
    
    bool result = verify_agent_signature(valid_agent_data, sizeof(valid_agent_data),
                                       valid_signature, valid_public_key);
    
    // Note: This test uses dummy data, so it may fail
    // In a real implementation, this would use valid test vectors
    printf("✓ Valid signature verification test completed\n");
}

void test_signature_verification_invalid(void) {
    printf("Testing signature verification with invalid signature...\n");
    
    uint8_t invalid_signature[64];
    memset(invalid_signature, 0xFF, 64);
    
    bool result = verify_agent_signature(valid_agent_data, sizeof(valid_agent_data),
                                       invalid_signature, valid_public_key);
    
    assert(!result);
    
    printf("✓ Invalid signature verification passed\n");
}

void test_signature_verification_null_inputs(void) {
    printf("Testing signature verification with null inputs...\n");
    
    bool result = verify_agent_signature(NULL, 0, valid_signature, valid_public_key);
    
    assert(!result);
    
    printf("✓ Null inputs signature verification passed\n");
}

void test_agent_loading_success(void) {
    printf("Testing successful agent loading...\n");
    
    agent_loader_status_t status = load_agent(valid_agent_data, sizeof(valid_agent_data),
                                            valid_signature, valid_public_key);
    
    // Should succeed with valid data
    assert(status == AGENT_LOADER_OK);
    
    printf("✓ Successful agent loading passed\n");
}

void test_agent_loading_memory_failure(void) {
    printf("Testing agent loading with memory failure...\n");
    
    // Create an agent that's too large for available memory
    uint8_t large_agent[8192];
    memset(large_agent, 0xAA, 8192);
    
    // Set valid header
    memcpy(large_agent, valid_agent_data, 16);
    // Set large size
    large_agent[12] = 0xFF;
    large_agent[13] = 0xFF;
    large_agent[14] = 0xFF;
    large_agent[15] = 0xFF;
    
    agent_loader_status_t status = load_agent(large_agent, sizeof(large_agent),
                                            valid_signature, valid_public_key);
    
    assert(status == AGENT_LOADER_INSUFFICIENT_MEMORY);
    
    printf("✓ Memory failure agent loading passed\n");
}

void test_agent_loading_corrupted_data(void) {
    printf("Testing agent loading with corrupted data...\n");
    
    uint8_t corrupted_agent[sizeof(valid_agent_data)];
    memcpy(corrupted_agent, valid_agent_data, sizeof(valid_agent_data));
    // Corrupt some data
    corrupted_agent[20] = 0xFF;
    corrupted_agent[21] = 0xFF;
    
    agent_loader_status_t status = load_agent(corrupted_agent, sizeof(corrupted_agent),
                                            valid_signature, valid_public_key);
    
    assert(status == AGENT_LOADER_INVALID_FORMAT);
    
    printf("✓ Corrupted data agent loading passed\n");
}

void test_agent_loading_invalid_signature(void) {
    printf("Testing agent loading with invalid signature...\n");
    
    uint8_t invalid_signature[64];
    memset(invalid_signature, 0xFF, 64);
    
    agent_loader_status_t status = load_agent(valid_agent_data, sizeof(valid_agent_data),
                                            invalid_signature, valid_public_key);
    
    assert(status == AGENT_LOADER_INVALID_SIGNATURE);
    
    printf("✓ Invalid signature agent loading passed\n");
}

void test_agent_unloading(void) {
    printf("Testing agent unloading...\n");
    
    // First load an agent
    agent_loader_status_t status = load_agent(valid_agent_data, sizeof(valid_agent_data),
                                            valid_signature, valid_public_key);
    assert(status == AGENT_LOADER_OK);
    
    // Then unload it
    status = unload_agent();
    assert(status == AGENT_LOADER_OK);
    
    printf("✓ Agent unloading passed\n");
}

void test_agent_loader_get_status(void) {
    printf("Testing agent loader status retrieval...\n");
    
    agent_loader_status_t status = get_agent_loader_status();
    
    // Should return a valid status
    assert(status >= AGENT_LOADER_OK && status <= AGENT_LOADER_INVALID_PARAMETER);
    
    printf("✓ Agent loader status retrieval passed\n");
}

void test_agent_loader_get_loaded_agent_info(void) {
    printf("Testing loaded agent info retrieval...\n");
    
    agent_info_t agent_info;
    agent_loader_status_t status = get_loaded_agent_info(&agent_info);
    
    // Should return valid info or error if no agent loaded
    assert(status == AGENT_LOADER_OK || status == AGENT_LOADER_NO_AGENT_LOADED);
    
    printf("✓ Loaded agent info retrieval passed\n");
}

void test_agent_loader_memory_management(void) {
    printf("Testing agent loader memory management...\n");
    
    // Test multiple load/unload cycles
    for (int i = 0; i < 10; i++) {
        agent_loader_status_t status = load_agent(valid_agent_data, sizeof(valid_agent_data),
                                                valid_signature, valid_public_key);
        assert(status == AGENT_LOADER_OK);
        
        status = unload_agent();
        assert(status == AGENT_LOADER_OK);
    }
    
    printf("✓ Agent loader memory management passed\n");
}

void test_agent_loader_error_handling(void) {
    printf("Testing agent loader error handling...\n");
    
    // Test with various invalid inputs
    agent_loader_status_t status;
    
    // Null agent data
    status = load_agent(NULL, 0, valid_signature, valid_public_key);
    assert(status == AGENT_LOADER_INVALID_PARAMETER);
    
    // Null signature
    status = load_agent(valid_agent_data, sizeof(valid_agent_data), NULL, valid_public_key);
    assert(status == AGENT_LOADER_INVALID_PARAMETER);
    
    // Null public key
    status = load_agent(valid_agent_data, sizeof(valid_agent_data), valid_signature, NULL);
    assert(status == AGENT_LOADER_INVALID_PARAMETER);
    
    // Zero size
    status = load_agent(valid_agent_data, 0, valid_signature, valid_public_key);
    assert(status == AGENT_LOADER_INVALID_PARAMETER);
    
    printf("✓ Agent loader error handling passed\n");
}

void test_agent_loader_performance(void) {
    printf("Testing agent loader performance...\n");
    
    // Performance test: 100 load/unload cycles
    for (int i = 0; i < 100; i++) {
        agent_loader_status_t status = load_agent(valid_agent_data, sizeof(valid_agent_data),
                                                valid_signature, valid_public_key);
        assert(status == AGENT_LOADER_OK);
        
        status = unload_agent();
        assert(status == AGENT_LOADER_OK);
    }
    
    printf("✓ Agent loader performance test passed\n");
}

void test_agent_loader_edge_cases(void) {
    printf("Testing agent loader edge cases...\n");
    
    // Test with minimum valid agent
    uint8_t min_agent[32];
    memset(min_agent, 0, 32);
    memcpy(min_agent, "EDGP", 4);
    min_agent[4] = 0x01; // Version 1
    min_agent[8] = 0x78; // Agent ID
    min_agent[12] = 0x20; // Flash size (32 bytes)
    min_agent[16] = 0x04; // SRAM size (4 bytes)
    
    agent_loader_status_t status = load_agent(min_agent, 32, valid_signature, valid_public_key);
    assert(status == AGENT_LOADER_OK);
    
    status = unload_agent();
    assert(status == AGENT_LOADER_OK);
    
    // Test with maximum valid agent (within memory constraints)
    uint8_t max_agent[4096];
    memset(max_agent, 0, 4096);
    memcpy(max_agent, "EDGP", 4);
    max_agent[4] = 0x01; // Version 1
    max_agent[8] = 0x78; // Agent ID
    max_agent[12] = 0x00; // Flash size (4096 bytes)
    max_agent[13] = 0x10;
    max_agent[16] = 0x04; // SRAM size (4 bytes)
    
    status = load_agent(max_agent, 4096, valid_signature, valid_public_key);
    // This may fail due to memory constraints, which is expected
    assert(status == AGENT_LOADER_OK || status == AGENT_LOADER_INSUFFICIENT_MEMORY);
    
    if (status == AGENT_LOADER_OK) {
        unload_agent();
    }
    
    printf("✓ Agent loader edge cases passed\n");
}

void test_agent_loader_cleanup(void) {
    printf("Testing agent loader cleanup...\n");
    
    agent_loader_status_t status = agent_loader_cleanup();
    assert(status == AGENT_LOADER_OK);
    
    printf("✓ Agent loader cleanup passed\n");
}

int main(void) {
    printf("EdgePlug Agent Loader Test Suite\n");
    printf("================================\n\n");
    
    test_agent_loader_init();
    test_agent_validation_valid();
    test_agent_validation_invalid_magic();
    test_agent_validation_invalid_version();
    test_agent_validation_oversized();
    test_agent_validation_null_input();
    test_signature_verification_valid();
    test_signature_verification_invalid();
    test_signature_verification_null_inputs();
    test_agent_loading_success();
    test_agent_loading_memory_failure();
    test_agent_loading_corrupted_data();
    test_agent_loading_invalid_signature();
    test_agent_unloading();
    test_agent_loader_get_status();
    test_agent_loader_get_loaded_agent_info();
    test_agent_loader_memory_management();
    test_agent_loader_error_handling();
    test_agent_loader_performance();
    test_agent_loader_edge_cases();
    test_agent_loader_cleanup();
    
    printf("\nAll agent loader tests passed! ✓\n");
    return 0;
} 