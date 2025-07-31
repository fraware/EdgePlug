/**
 * @file preprocess.c
 * @brief Pre-processing implementation for sensor data windowing and normalization
 * @version 1.0.0
 * @license MIT
 */

#include "edgeplug_runtime.h"
#include "preprocess.h"
#include <string.h>
#include <math.h>

// Memory budget verification
#define WINDOW_BUFFER_SIZE (1024)  // 1KB window buffer
#define MAX_WINDOW_SIZE (256)      // Max 256 samples per window

// Window buffer for sensor data
static float window_buffer[WINDOW_BUFFER_SIZE];
static uint32_t window_index = 0;
static uint32_t window_size = 64;  // Default window size
static bool window_full = false;

// Normalization parameters
static float voltage_mean = 120.0f;    // Default voltage mean
static float voltage_std = 10.0f;      // Default voltage std
static float current_mean = 1.0f;      // Default current mean
static float current_std = 0.1f;       // Default current std

// Filter coefficients (simple moving average)
static float filter_alpha = 0.1f;      // Low-pass filter coefficient

/**
 * @brief Initialize pre-processing module
 */
edgeplug_status_t preprocess_init(uint32_t window_sz) {
    if (window_sz == 0 || window_sz > MAX_WINDOW_SIZE) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    window_size = window_sz;
    window_index = 0;
    window_full = false;
    
    // Clear window buffer
    memset(window_buffer, 0, sizeof(window_buffer));
    
    return EDGEPLUG_OK;
}

/**
 * @brief Add sensor data to window buffer
 */
edgeplug_status_t preprocess_add_sample(const edgeplug_sensor_data_t* sensor_data) {
    if (!sensor_data) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Apply low-pass filter to voltage
    static float filtered_voltage = 0.0f;
    filtered_voltage = filter_alpha * sensor_data->voltage + 
                      (1.0f - filter_alpha) * filtered_voltage;
    
    // Add filtered voltage to window buffer
    window_buffer[window_index] = filtered_voltage;
    window_index = (window_index + 1) % window_size;
    
    // Check if window is full
    if (window_index == 0) {
        window_full = true;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Normalize window data to int8 range
 */
edgeplug_status_t preprocess_normalize_window(int8_t* normalized_data, size_t* data_size) {
    if (!normalized_data || !data_size || !window_full) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Calculate window statistics
    float sum = 0.0f;
    float sum_sq = 0.0f;
    
    for (uint32_t i = 0; i < window_size; i++) {
        sum += window_buffer[i];
        sum_sq += window_buffer[i] * window_buffer[i];
    }
    
    float mean = sum / window_size;
    float variance = (sum_sq / window_size) - (mean * mean);
    float std_dev = sqrtf(variance);
    
    // Avoid division by zero
    if (std_dev < 1e-6f) {
        std_dev = 1.0f;
    }
    
    // Normalize to int8 range (-128 to 127)
    for (uint32_t i = 0; i < window_size; i++) {
        float normalized = (window_buffer[i] - mean) / std_dev;
        
        // Scale to int8 range
        int32_t scaled = (int32_t)(normalized * 64.0f);  // Scale factor
        
        // Clamp to int8 range
        if (scaled > 127) scaled = 127;
        if (scaled < -128) scaled = -128;
        
        normalized_data[i] = (int8_t)scaled;
    }
    
    *data_size = window_size;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Apply windowing function to data
 */
edgeplug_status_t preprocess_apply_window(float* windowed_data, size_t data_size) {
    if (!windowed_data || data_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Apply Hamming window
    for (size_t i = 0; i < data_size; i++) {
        float window_coeff = 0.54f - 0.46f * cosf(2.0f * M_PI * i / (data_size - 1));
        windowed_data[i] *= window_coeff;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get window statistics
 */
edgeplug_status_t preprocess_get_stats(float* mean, float* std_dev, float* min_val, float* max_val) {
    if (!window_full) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (mean) *mean = 0.0f;
    if (std_dev) *std_dev = 0.0f;
    if (min_val) *min_val = window_buffer[0];
    if (max_val) *max_val = window_buffer[0];
    
    float sum = 0.0f;
    float sum_sq = 0.0f;
    
    for (uint32_t i = 0; i < window_size; i++) {
        float val = window_buffer[i];
        sum += val;
        sum_sq += val * val;
        
        if (min_val && val < *min_val) *min_val = val;
        if (max_val && val > *max_val) *max_val = val;
    }
    
    if (mean) *mean = sum / window_size;
    
    if (std_dev) {
        float variance = (sum_sq / window_size) - (*mean * *mean);
        *std_dev = sqrtf(variance);
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Set normalization parameters
 */
edgeplug_status_t preprocess_set_normalization(float v_mean, float v_std, 
                                             float c_mean, float c_std) {
    voltage_mean = v_mean;
    voltage_std = v_std;
    current_mean = c_mean;
    current_std = c_std;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Set filter parameters
 */
edgeplug_status_t preprocess_set_filter(float alpha) {
    if (alpha < 0.0f || alpha > 1.0f) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    filter_alpha = alpha;
    return EDGEPLUG_OK;
}

/**
 * @brief Check if window is ready for processing
 */
bool preprocess_is_window_ready(void) {
    return window_full;
}

/**
 * @brief Reset window buffer
 */
edgeplug_status_t preprocess_reset(void) {
    window_index = 0;
    window_full = false;
    memset(window_buffer, 0, sizeof(window_buffer));
    
    return EDGEPLUG_OK;
} 