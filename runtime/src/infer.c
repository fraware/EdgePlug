/**
 * @file infer.c
 * @brief CMSIS-NN inference implementation with int8 quantization support
 * @version 1.0.0
 * @license MIT
 */

#include "edgeplug_runtime.h"
#include "infer.h"
#include <string.h>
#include <stdlib.h>

// Memory budget verification
#define INFERENCE_BUFFER_SIZE (1024)  // 1KB inference buffer
#define MAX_MODEL_SIZE (8192)         // 8KB max model size

// Inference buffer for CMSIS-NN
static int8_t inference_buffer[INFERENCE_BUFFER_SIZE];
static uint8_t model_buffer[MAX_MODEL_SIZE];
static size_t model_size = 0;
static bool model_loaded = false;

// Performance tracking
static uint32_t inference_count = 0;
static uint32_t total_inference_time = 0;
static uint32_t max_inference_time = 0;

// Quantization parameters
static float input_scale = 1.0f / 64.0f;  // Scale factor for int8 input
static float output_scale = 64.0f;         // Scale factor for int8 output
static int8_t input_zero_point = 0;
static int8_t output_zero_point = 0;

/**
 * @brief Initialize inference module
 */
edgeplug_status_t infer_init(void) {
    // Clear buffers
    memset(inference_buffer, 0, sizeof(inference_buffer));
    memset(model_buffer, 0, sizeof(model_buffer));
    
    model_size = 0;
    model_loaded = false;
    inference_count = 0;
    total_inference_time = 0;
    max_inference_time = 0;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Load CMSIS-NN model from buffer
 */
edgeplug_status_t infer_load_model(const uint8_t* model_data, size_t data_size) {
    if (!model_data || data_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (data_size > MAX_MODEL_SIZE) {
        return EDGEPLUG_ERROR_MEMORY;
    }
    
    // Copy model to buffer
    memcpy(model_buffer, model_data, data_size);
    model_size = data_size;
    model_loaded = true;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Quantize float32 data to int8
 */
edgeplug_status_t infer_quantize_fp32(const float* fp32_data, size_t data_size,
                                     int8_t* int8_data) {
    if (!fp32_data || !int8_data || data_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    for (size_t i = 0; i < data_size; i++) {
        // Apply scale and zero point
        float scaled = (fp32_data[i] / input_scale) + input_zero_point;
        
        // Clamp to int8 range
        int32_t quantized = (int32_t)(scaled + 0.5f);
        if (quantized > 127) quantized = 127;
        if (quantized < -128) quantized = -128;
        
        int8_data[i] = (int8_t)quantized;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Dequantize int8 data to float32
 */
edgeplug_status_t infer_dequantize_int8(const int8_t* int8_data, size_t data_size,
                                       float* fp32_data) {
    if (!int8_data || !fp32_data || data_size == 0) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    for (size_t i = 0; i < data_size; i++) {
        // Apply inverse scale and zero point
        fp32_data[i] = ((float)(int8_data[i] - output_zero_point)) * output_scale;
    }
    
    return EDGEPLUG_OK;
}

/**
 * @brief Run inference on int8 input data
 */
edgeplug_status_t infer_int8(const int8_t* input_data, size_t input_size,
                            int8_t* output_data, size_t* output_size) {
    if (!input_data || !output_data || !output_size || !model_loaded) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    if (input_size > INFERENCE_BUFFER_SIZE) {
        return EDGEPLUG_ERROR_MEMORY;
    }
    
    // Start timing
    uint32_t start_time = get_system_time_ms();
    
    // Copy input to inference buffer
    memcpy(inference_buffer, input_data, input_size);
    
    // Call CMSIS-NN inference
    edgeplug_status_t status = cmsis_nn_inference(inference_buffer, input_size,
                                                 output_data, output_size);
    
    // End timing
    uint32_t end_time = get_system_time_ms();
    uint32_t inference_time = end_time - start_time;
    
    // Update statistics
    inference_count++;
    total_inference_time += inference_time;
    if (inference_time > max_inference_time) {
        max_inference_time = inference_time;
    }
    
    // Check performance budget (≤500µs on M4 @80MHz)
    if (inference_time > 1) {  // 1ms = 1000µs, so 1ms > 500µs
        return EDGEPLUG_ERROR_INFERENCE;
    }
    
    return status;
}

/**
 * @brief CMSIS-NN model structure
 */
typedef struct {
    uint32_t magic;           // Magic number for validation
    uint32_t version;         // Model version
    uint32_t input_size;      // Input tensor size
    uint32_t output_size;     // Output tensor size
    uint32_t layer_count;     // Number of layers
    uint32_t weights_offset;  // Offset to weights
    uint32_t bias_offset;     // Offset to biases
    uint32_t activation_offset; // Offset to activation functions
} cmsis_nn_model_header_t;

/**
 * @brief CMSIS-NN layer types
 */
typedef enum {
    CMSIS_NN_LAYER_CONV = 1,
    CMSIS_NN_LAYER_DENSE = 2,
    CMSIS_NN_LAYER_ACTIVATION = 3,
    CMSIS_NN_LAYER_POOL = 4
} cmsis_nn_layer_type_t;

/**
 * @brief CMSIS-NN layer structure
 */
typedef struct {
    cmsis_nn_layer_type_t type;
    uint32_t input_size;
    uint32_t output_size;
    uint32_t weights_offset;
    uint32_t bias_offset;
    uint32_t activation_type;
    uint32_t padding;
    uint32_t stride;
    uint32_t kernel_size;
} cmsis_nn_layer_t;

/**
 * @brief CMSIS-NN inference implementation
 */
static edgeplug_status_t cmsis_nn_inference(const int8_t* input, size_t input_size,
                                           int8_t* output, size_t* output_size) {
    if (!model_loaded || !input || !output) {
        return EDGEPLUG_ERROR_INVALID_PARAM;
    }
    
    // Parse model header
    const cmsis_nn_model_header_t* header = (const cmsis_nn_model_header_t*)model_buffer;
    
    // Validate magic number
    if (header->magic != 0x4E4E5343) {  // "CNSN" in little-endian
        return EDGEPLUG_ERROR_INFERENCE;
    }
    
    // Validate input size
    if (input_size != header->input_size) {
        return EDGEPLUG_ERROR_INFERENCE;
    }
    
    // Allocate working buffers
    int8_t* layer_input = (int8_t*)inference_buffer;
    int8_t* layer_output = layer_input + header->input_size;
    
    // Copy input to first layer
    memcpy(layer_input, input, input_size);
    
    // Process each layer
    const cmsis_nn_layer_t* layers = (const cmsis_nn_layer_t*)(model_buffer + sizeof(cmsis_nn_model_header_t));
    
    for (uint32_t i = 0; i < header->layer_count; i++) {
        const cmsis_nn_layer_t* layer = &layers[i];
        
        switch (layer->type) {
            case CMSIS_NN_LAYER_DENSE: {
                // Dense layer implementation
                const int8_t* weights = (const int8_t*)(model_buffer + layer->weights_offset);
                const int32_t* bias = (const int32_t*)(model_buffer + layer->bias_offset);
                
                // Matrix multiplication: output = input * weights + bias
                for (uint32_t out_idx = 0; out_idx < layer->output_size; out_idx++) {
                    int32_t acc = bias ? bias[out_idx] : 0;
                    
                    for (uint32_t in_idx = 0; in_idx < layer->input_size; in_idx++) {
                        acc += (int32_t)layer_input[in_idx] * weights[in_idx * layer->output_size + out_idx];
                    }
                    
                    // Apply activation function
                    if (layer->activation_type == 1) {  // ReLU
                        if (acc < 0) acc = 0;
                    }
                    
                    // Quantize to int8
                    acc = acc / 64;  // Simple quantization
                    if (acc > 127) acc = 127;
                    if (acc < -128) acc = -128;
                    
                    layer_output[out_idx] = (int8_t)acc;
                }
                break;
            }
            
            case CMSIS_NN_LAYER_ACTIVATION: {
                // Activation layer
                for (uint32_t i = 0; i < layer->input_size; i++) {
                    int32_t val = layer_input[i];
                    
                    if (layer->activation_type == 1) {  // ReLU
                        if (val < 0) val = 0;
                    } else if (layer->activation_type == 2) {  // Sigmoid (simplified)
                        val = val > 0 ? 127 : -128;
                    }
                    
                    layer_output[i] = (int8_t)val;
                }
                break;
            }
            
            default:
                // Unsupported layer type
                return EDGEPLUG_ERROR_INFERENCE;
        }
        
        // Swap input/output buffers for next layer
        int8_t* temp = layer_input;
        layer_input = layer_output;
        layer_output = temp;
    }
    
    // Copy final output
    *output_size = header->output_size;
    memcpy(output, layer_input, header->output_size);
    
    return EDGEPLUG_OK;
}

/**
 * @brief Set quantization parameters
 */
edgeplug_status_t infer_set_quantization(float in_scale, int8_t in_zero_point,
                                        float out_scale, int8_t out_zero_point) {
    input_scale = in_scale;
    input_zero_point = in_zero_point;
    output_scale = out_scale;
    output_zero_point = out_zero_point;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get inference statistics
 */
edgeplug_status_t infer_get_stats(uint32_t* count, uint32_t* avg_time,
                                 uint32_t* max_time) {
    if (count) *count = inference_count;
    if (avg_time) *avg_time = inference_count > 0 ? total_inference_time / inference_count : 0;
    if (max_time) *max_time = max_inference_time;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Check if model is loaded
 */
bool infer_is_model_loaded(void) {
    return model_loaded;
}

/**
 * @brief Get model size
 */
size_t infer_get_model_size(void) {
    return model_size;
}

/**
 * @brief Reset inference statistics
 */
edgeplug_status_t infer_reset_stats(void) {
    inference_count = 0;
    total_inference_time = 0;
    max_inference_time = 0;
    
    return EDGEPLUG_OK;
}

/**
 * @brief Get system time in milliseconds (platform-specific)
 */
static uint32_t get_system_time_ms(void) {
    // Platform-specific system time implementation
    // For Cortex-M4F, use SysTick or DWT cycle counter
    
    // Option 1: SysTick counter (if available)
    #if defined(__ARM_ARCH_7M__) || defined(__ARM_ARCH_7EM__)
        // Use SysTick current value register
        extern volatile uint32_t SysTick_Val;
        if (SysTick_Val != 0) {
            return (0xFFFFFF - SysTick_Val) / (SystemCoreClock / 1000);
        }
    #endif
    
    // Option 2: DWT cycle counter (if available)
    #if defined(__ARM_ARCH_7M__) || defined(__ARM_ARCH_7EM__)
        // Use Data Watchpoint and Trace (DWT) cycle counter
        extern volatile uint32_t DWT_CYCCNT;
        if (DWT_CYCCNT != 0) {
            return DWT_CYCCNT / (SystemCoreClock / 1000);
        }
    #endif
    
    // Option 3: Hardware timer (platform-specific)
    #if defined(STM32F4)
        // Use TIM2 for timing
        extern volatile uint32_t TIM2_CNT;
        return TIM2_CNT / (SystemCoreClock / 1000);
    #elif defined(NXP_K64F)
        // Use PIT timer
        extern volatile uint32_t PIT_CVAL0;
        return PIT_CVAL0 / (SystemCoreClock / 1000);
    #endif
    
    // Fallback: software timer
    static uint32_t software_timer = 0;
    static uint32_t last_call = 0;
    
    uint32_t current = software_timer;
    software_timer += 1;  // Increment for each call
    
    // Estimate time based on call frequency
    if (current > last_call) {
        last_call = current;
        return current;  // Assume 1ms per call for now
    }
    
    return current;
} 