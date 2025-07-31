/**
 * @file infer.h
 * @brief Inference module header
 * @version 1.0.0
 * @license MIT
 */

#ifndef INFER_H
#define INFER_H

#include "edgeplug_runtime.h"
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Initialize inference module
 */
edgeplug_status_t infer_init(void);

/**
 * @brief Load CMSIS-NN model from buffer
 */
edgeplug_status_t infer_load_model(const uint8_t* model_data, size_t data_size);

/**
 * @brief Quantize float32 data to int8
 */
edgeplug_status_t infer_quantize_fp32(const float* fp32_data, size_t data_size,
                                     int8_t* int8_data);

/**
 * @brief Dequantize int8 data to float32
 */
edgeplug_status_t infer_dequantize_int8(const int8_t* int8_data, size_t data_size,
                                       float* fp32_data);

/**
 * @brief Run inference on int8 input data
 */
edgeplug_status_t infer_int8(const int8_t* input_data, size_t input_size,
                            int8_t* output_data, size_t* output_size);

/**
 * @brief Set quantization parameters
 */
edgeplug_status_t infer_set_quantization(float in_scale, int8_t in_zero_point,
                                        float out_scale, int8_t out_zero_point);

/**
 * @brief Get inference statistics
 */
edgeplug_status_t infer_get_stats(uint32_t* count, uint32_t* avg_time,
                                 uint32_t* max_time);

/**
 * @brief Check if model is loaded
 */
bool infer_is_model_loaded(void);

/**
 * @brief Get model size
 */
size_t infer_get_model_size(void);

/**
 * @brief Reset inference statistics
 */
edgeplug_status_t infer_reset_stats(void);

#ifdef __cplusplus
}
#endif

#endif /* INFER_H */ 