/**
 * @file hotswap.h
 * @brief Hot-swap update engine header
 * @version 1.0.0
 * @license MIT
 */

#ifndef HOTSWAP_H
#define HOTSWAP_H

#include "edgeplug_runtime.h"
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// Agent slot metadata structure
typedef struct {
    uint32_t magic;           // Magic number for validation
    uint32_t version;         // Agent version
    uint32_t size;           // Agent size in bytes
    uint32_t crc32;          // CRC32 checksum
    uint32_t timestamp;      // Update timestamp
    uint8_t signature[64];   // Ed25519 signature
    uint8_t reserved[32];    // Reserved for future use
} agent_slot_metadata_t;

/**
 * @brief Initialize hot-swap engine
 * 
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_init(void);

/**
 * @brief Get active agent data
 * 
 * @param size Pointer to store agent size
 * @return const uint8_t* Pointer to agent data, or NULL on error
 */
const uint8_t* hotswap_get_active_agent(size_t* size);

/**
 * @brief Update agent with hot-swap
 * 
 * @param new_agent_data New agent binary data
 * @param new_agent_size Size of new agent data
 * @param new_manifest New agent manifest
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_update_agent(const uint8_t* new_agent_data, 
                                     size_t new_agent_size,
                                     const manifest_t* new_manifest);

/**
 * @brief Rollback to previous agent
 * 
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_rollback(void);

/**
 * @brief Get hot-swap statistics
 * 
 * @param successful_updates Pointer to store successful update count
 * @param failed_updates Pointer to store failed update count
 * @param total_attempts Pointer to store total attempt count
 * @param last_update_time Pointer to store last update timestamp
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_get_stats(uint32_t* successful_updates,
                                  uint32_t* failed_updates,
                                  uint32_t* total_attempts,
                                  uint32_t* last_update_time);

/**
 * @brief Check if update is in progress
 * 
 * @return bool True if update is in progress
 */
bool hotswap_is_update_in_progress(void);

/**
 * @brief Get active slot number
 * 
 * @return uint8_t Active slot number (0 or 1)
 */
uint8_t hotswap_get_active_slot(void);

/**
 * @brief Watchdog timer check for rollback on failure
 * 
 * This function should be called periodically to check for stuck updates
 * and automatically rollback if necessary.
 */
void hotswap_watchdog_check(void);

/**
 * @brief Validate both agent slots
 * 
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_validate_slots(void);

/**
 * @brief Clear agent slot
 * 
 * @param slot Slot number to clear (0 or 1)
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_clear_slot(uint8_t slot);

/**
 * @brief Get slot information
 * 
 * @param slot Slot number (0 or 1)
 * @param metadata Pointer to store slot metadata
 * @return edgeplug_status_t Status code
 */
edgeplug_status_t hotswap_get_slot_info(uint8_t slot, agent_slot_metadata_t* metadata);

/**
 * @brief Check if slot is valid
 * 
 * @param slot Slot number (0 or 1)
 * @return bool True if slot is valid
 */
bool hotswap_is_slot_valid(uint8_t slot);

#ifdef __cplusplus
}
#endif

#endif /* HOTSWAP_H */ 