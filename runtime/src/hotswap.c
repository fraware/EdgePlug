/**
 * @file hotswap.c
 * @brief Hot-swap update engine with double-bank agent slots and CRC32 validation
 * @version 1.0.0
 * @license MIT
 */

#include "edgeplug_runtime.h"
#include "hotswap.h"
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

// Hot-swap configuration
#define AGENT_SLOT_A_ADDR 0x08000000
#define AGENT_SLOT_B_ADDR 0x08003800
#define AGENT_SLOT_SIZE (14 * 1024)  // 14KB per slot
#define CRC32_POLYNOMIAL 0x04C11DB7

// Agent slot metadata
typedef struct {
    uint32_t magic;           // Magic number for validation
    uint32_t version;         // Agent version
    uint32_t size;           // Agent size in bytes
    uint32_t crc32;          // CRC32 checksum
    uint32_t timestamp;      // Update timestamp
    uint8_t signature[64];   // Ed25519 signature
    uint8_t reserved[32];    // Reserved for future use
} agent_slot_metadata_t;

// Hot-swap state
typedef struct {
    uint8_t active_slot;     // 0 = Slot A, 1 = Slot B
    uint8_t update_in_progress;
    uint32_t update_start_time;
    uint32_t update_attempts;
    uint32_t successful_updates;
    uint32_t failed_updates;
    uint32_t last_update_timestamp;
} hotswap_state_t;

static hotswap_state_t hotswap_state = {0};

// CRC32 calculation table
static uint32_t crc32_table[256];

/**
 * @brief Initialize CRC32 table
 */
static void init_crc32_table(void) {
    for (int i = 0; i < 256; i++) {
        uint32_t crc = i;
        for (int j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >> 1) ^ CRC32_POLYNOMIAL;
            } else {
                crc = crc >> 1;
            }
        }
        crc32_table[i] = crc;
    }
}

/**
 * @brief Calculate CRC32 checksum
 */
static uint32_t calculate_crc32(const uint8_t* data, size_t size) {
    uint32_t crc = 0xFFFFFFFF;
    
    for (size_t i = 0; i < size; i++) {
        uint8_t table_index = (crc ^ data[i]) & 0xFF;
        crc = (crc >> 8) ^ crc32_table[table_index];
    }
    
    return crc ^ 0xFFFFFFFF;
}

/**
 * @brief Read agent slot metadata
 */
static bool read_slot_metadata(uint8_t slot, agent_slot_metadata_t* metadata) {
    if (!metadata || slot > 1) {
        return false;
    }
    
    uint32_t slot_addr = (slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    
    // Read metadata from end of slot
    const agent_slot_metadata_t* slot_metadata = 
        (const agent_slot_metadata_t*)(slot_addr + AGENT_SLOT_SIZE - sizeof(agent_slot_metadata_t));
    
    memcpy(metadata, slot_metadata, sizeof(agent_slot_metadata_t));
    
    return true;
}

/**
 * @brief Write agent slot metadata
 */
static bool write_slot_metadata(uint8_t slot, const agent_slot_metadata_t* metadata) {
    if (!metadata || slot > 1) {
        return false;
    }
    
    uint32_t slot_addr = (slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    
    // Write metadata to end of slot
    agent_slot_metadata_t* slot_metadata = 
        (agent_slot_metadata_t*)(slot_addr + AGENT_SLOT_SIZE - sizeof(agent_slot_metadata_t));
    
    memcpy(slot_metadata, metadata, sizeof(agent_slot_metadata_t));
    
    return true;
}

/**
 * @brief Validate agent slot
 */
static bool validate_agent_slot(uint8_t slot) {
    agent_slot_metadata_t metadata;
    
    if (!read_slot_metadata(slot, &metadata)) {
        return false;
    }
    
    // Check magic number
    if (metadata.magic != 0xEDGEPLUG) {
        return false;
    }
    
    // Check size
    if (metadata.size > AGENT_SLOT_SIZE - sizeof(agent_slot_metadata_t)) {
        return false;
    }
    
    // Calculate CRC32 of agent data
    uint32_t slot_addr = (slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    uint32_t calculated_crc = calculate_crc32((const uint8_t*)slot_addr, metadata.size);
    
    if (calculated_crc != metadata.crc32) {
        return false;
    }
    
    return true;
}

/**
 * @brief Initialize hot-swap engine
 */
edgeplug_status_t hotswap_init(void) {
    // Initialize CRC32 table
    init_crc32_table();
    
    // Reset state
    memset(&hotswap_state, 0, sizeof(hotswap_state));
    
    // Determine active slot
    bool slot_a_valid = validate_agent_slot(0);
    bool slot_b_valid = validate_agent_slot(1);
    
    if (slot_a_valid && slot_b_valid) {
        // Both slots valid, use the one with newer timestamp
        agent_slot_metadata_t metadata_a, metadata_b;
        read_slot_metadata(0, &metadata_a);
        read_slot_metadata(1, &metadata_b);
        
        hotswap_state.active_slot = (metadata_a.timestamp > metadata_b.timestamp) ? 0 : 1;
    } else if (slot_a_valid) {
        hotswap_state.active_slot = 0;
    } else if (slot_b_valid) {
        hotswap_state.active_slot = 1;
    } else {
        // No valid slots
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get active agent data
 */
const uint8_t* hotswap_get_active_agent(size_t* size) {
    if (!size) {
        return NULL;
    }
    
    agent_slot_metadata_t metadata;
    if (!read_slot_metadata(hotswap_state.active_slot, &metadata)) {
        return NULL;
    }
    
    *size = metadata.size;
    
    uint32_t slot_addr = (hotswap_state.active_slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    return (const uint8_t*)slot_addr;
}

/**
 * @brief Get inactive slot number
 */
static uint8_t get_inactive_slot(void) {
    return (hotswap_state.active_slot == 0) ? 1 : 0;
}

/**
 * @brief Write agent to inactive slot
 */
static edgeplug_status_t write_agent_to_slot(uint8_t slot, const uint8_t* agent_data, 
                                           size_t agent_size, const manifest_t* manifest) {
    if (!agent_data || !manifest || slot > 1) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (agent_size > AGENT_SLOT_SIZE - sizeof(agent_slot_metadata_t)) {
        return EDGEPLUG_ERROR_MEMORY;
    }
    
    uint32_t slot_addr = (slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    
    // Write agent data
    memcpy((void*)slot_addr, agent_data, agent_size);
    
    // Create metadata
    agent_slot_metadata_t metadata = {0};
    metadata.magic = 0xEDGEPLUG;
    metadata.version = manifest->version;
    metadata.size = agent_size;
    metadata.crc32 = calculate_crc32(agent_data, agent_size);
    metadata.timestamp = get_system_time_ms();
    
    // Copy signature from manifest
    memcpy(metadata.signature, manifest->signature, sizeof(metadata.signature));
    
    // Write metadata
    if (!write_slot_metadata(slot, &metadata)) {
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Perform hot-swap to new agent
 */
edgeplug_status_t hotswap_update_agent(const uint8_t* new_agent_data, size_t new_agent_size,
                                     const manifest_t* new_manifest) {
    if (!new_agent_data || !new_manifest) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Check if update is already in progress
    if (hotswap_state.update_in_progress) {
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    // Start update
    hotswap_state.update_in_progress = 1;
    hotswap_state.update_start_time = get_system_time_ms();
    hotswap_state.update_attempts++;
    
    // Get inactive slot
    uint8_t inactive_slot = get_inactive_slot();
    
    // Write new agent to inactive slot
    edgeplug_status_t status = write_agent_to_slot(inactive_slot, new_agent_data, 
                                                  new_agent_size, new_manifest);
    if (status != EDGEPLUG_OK) {
        hotswap_state.update_in_progress = 0;
        hotswap_state.failed_updates++;
        return status;
    }
    
    // Validate the new agent
    if (!validate_agent_slot(inactive_slot)) {
        hotswap_state.update_in_progress = 0;
        hotswap_state.failed_updates++;
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    // Switch to new slot
    hotswap_state.active_slot = inactive_slot;
    hotswap_state.update_in_progress = 0;
    hotswap_state.successful_updates++;
    hotswap_state.last_update_timestamp = get_system_time_ms();
    
    return EDGEPLUG_OK;
}

/**
 * @brief Rollback to previous agent
 */
edgeplug_status_t hotswap_rollback(void) {
    uint8_t previous_slot = get_inactive_slot();
    
    // Check if previous slot is valid
    if (!validate_agent_slot(previous_slot)) {
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    // Switch back to previous slot
    hotswap_state.active_slot = previous_slot;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get hot-swap statistics
 */
edgeplug_status_t hotswap_get_stats(uint32_t* successful_updates, uint32_t* failed_updates,
                                  uint32_t* total_attempts, uint32_t* last_update_time) {
    if (successful_updates) *successful_updates = hotswap_state.successful_updates;
    if (failed_updates) *failed_updates = hotswap_state.failed_updates;
    if (total_attempts) *total_attempts = hotswap_state.update_attempts;
    if (last_update_time) *last_update_time = hotswap_state.last_update_timestamp;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Check if update is in progress
 */
bool hotswap_is_update_in_progress(void) {
    return hotswap_state.update_in_progress;
}

/**
 * @brief Get active slot number
 */
uint8_t hotswap_get_active_slot(void) {
    return hotswap_state.active_slot;
}

/**
 * @brief Get system time in milliseconds
 */
static uint32_t get_system_time_ms(void) {
    // Platform-specific system time implementation
    // This would use the same implementation as in actuator.c and infer.c
    
    // For now, return a simple counter
    static uint32_t time_counter = 0;
    return time_counter++;
}

/**
 * @brief Watchdog timer for rollback on failure
 */
void hotswap_watchdog_check(void) {
    // Check if update has been in progress too long
    if (hotswap_state.update_in_progress) {
        uint32_t current_time = get_system_time_ms();
        uint32_t update_duration = current_time - hotswap_state.update_start_time;
        
        // If update has been in progress for more than 30 seconds, rollback
        if (update_duration > 30000) {
            hotswap_rollback();
            hotswap_state.update_in_progress = 0;
            hotswap_state.failed_updates++;
        }
    }
}

/**
 * @brief Validate both agent slots
 */
edgeplug_status_t hotswap_validate_slots(void) {
    bool slot_a_valid = validate_agent_slot(0);
    bool slot_b_valid = validate_agent_slot(1);
    
    if (!slot_a_valid && !slot_b_valid) {
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Clear agent slot
 */
edgeplug_status_t hotswap_clear_slot(uint8_t slot) {
    if (slot > 1) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    uint32_t slot_addr = (slot == 0) ? AGENT_SLOT_A_ADDR : AGENT_SLOT_B_ADDR;
    
    // Clear the slot
    memset((void*)slot_addr, 0xFF, AGENT_SLOT_SIZE);
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get slot information
 */
edgeplug_status_t hotswap_get_slot_info(uint8_t slot, agent_slot_metadata_t* metadata) {
    if (slot > 1 || !metadata) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (!read_slot_metadata(slot, metadata)) {
        return EDGEPLUG_ERROR_HOTSWAP;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Check if slot is valid
 */
bool hotswap_is_slot_valid(uint8_t slot) {
    if (slot > 1) {
        return false;
    }
    
    return validate_agent_slot(slot);
} 