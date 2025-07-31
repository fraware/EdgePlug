/**
 * @file preprocess.h
 * @brief Pre-processing module header
 * @version 1.0.0
 * @license MIT
 */

#ifndef PREPROCESS_H
#define PREPROCESS_H

#include "edgeplug_runtime.h"
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Initialize pre-processing module
 */
edgeplug_status_t preprocess_init(uint32_t window_size);

/**
 * @brief Add sensor data to window buffer
 */
edgeplug_status_t preprocess_add_sample(const edgeplug_sensor_data_t* sensor_data);

/**
 * @brief Normalize window data to int8 range
 */
edgeplug_status_t preprocess_normalize_window(int8_t* normalized_data, size_t* data_size);

/**
 * @brief Apply windowing function to data
 */
edgeplug_status_t preprocess_apply_window(float* windowed_data, size_t data_size);

/**
 * @brief Get window statistics
 */
edgeplug_status_t preprocess_get_stats(float* mean, float* std_dev, float* min_val, float* max_val);

/**
 * @brief Set normalization parameters
 */
edgeplug_status_t preprocess_set_normalization(float v_mean, float v_std, 
                                             float c_mean, float c_std);

/**
 * @brief Set filter parameters
 */
edgeplug_status_t preprocess_set_filter(float alpha);

/**
 * @brief Check if window is ready for processing
 */
bool preprocess_is_window_ready(void);

/**
 * @brief Reset window buffer
 */
edgeplug_status_t preprocess_reset(void);

#ifdef __cplusplus
}
#endif

#endif /* PREPROCESS_H */ 