/**
 * @file agent_loader.h
 * @brief Agent loader module header
 * @version 1.0.0
 * @license MIT
 */

#ifndef AGENT_LOADER_H
#define AGENT_LOADER_H

#include "edgeplug_runtime.h"
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Load agent from CBOR-encoded data
 */
edgeplug_status_t agent_loader_load(const uint8_t* cbor_data, size_t data_size,
                                   const edgeplug_manifest_t* manifest);

/**
 * @brief Hot-swap to a new agent
 */
edgeplug_status_t agent_loader_hotswap(const uint8_t* new_agent_cbor, size_t new_agent_size,
                                      const edgeplug_manifest_t* new_manifest);

/**
 * @brief Get active agent data
 */
const uint8_t* agent_loader_get_active_agent(size_t* size);

/**
 * @brief Get current manifest
 */
const edgeplug_manifest_t* agent_loader_get_manifest(void);

#ifdef __cplusplus
}
#endif

#endif /* AGENT_LOADER_H */ 