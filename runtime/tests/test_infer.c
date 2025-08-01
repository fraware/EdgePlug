/**
 * @file test_infer.c
 * @brief Test suite for EdgePlug inference functionality
 * @version 1.0.0
 * @license MIT
 */

#include "infer.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <math.h>

// Mock model data for testing
static uint8_t mock_model_data[] = {
    0x4D, 0x4F, 0x44, 0x45, 0x4C, 0x31, 0x2E, 0x30,  // "MODEL1.0"
    0x00, 0x00, 0x00, 0x40,  // Input size: 64
    0x00, 0x00, 0x00, 0x10,  // Output size: 16
    0x00, 0x00, 0x00, 0x20,  // Layer count: 32
    // Mock weights and biases would follow...
};

static float test_input_data[64] = {
    120.0f, 121.0f, 119.0f, 122.0f, 118.0f, 123.0f, 117.0f, 124.0f,
    116.0f, 125.0f, 115.0f, 126.0f, 114.0f, 127.0f, 113.0f, 128.0f,
    112.0f, 129.0f, 111.0f, 130.0f, 110.0f, 131.0f, 109.0f, 132.0f,
    108.0f, 133.0f, 107.0f, 134.0f, 106.0f, 135.0f, 105.0f, 136.0f,
    104.0f, 137.0f, 103.0f, 138.0f, 102.0f, 139.0f, 101.0f, 140.0f,
    100.0f, 141.0f, 99.0f, 142.0f, 98.0f, 143.0f, 97.0f, 144.0f,
    96.0f, 145.0f, 95.0f, 146.0f, 94.0f, 147.0f, 93.0f, 148.0f,
    92.0f, 149.0f, 91.0f, 150.0f, 90.0f, 151.0f, 89.0f, 152.0f
};

void test_infer_init(void) {
    printf("Testing inference initialization...\n");
    
    infer_config_t config = {
        .model_data = mock_model_data,
        .model_size = sizeof(mock_model_data),
        .input_size = 64,
        .output_size = 16,
        .enable_quantization = true,
        .enable_optimization = true,
        .memory_pool_size = 4096
    };
    
    infer_status_t status = infer_init(&config);
    assert(status == INFER_OK);
    assert(infer_is_initialized());
    
    printf("✓ Inference initialization passed\n");
}

void test_model_loading(void) {
    printf("Testing model loading...\n");
    
    infer_model_info_t model_info;
    infer_status_t status = infer_load_model(mock_model_data, sizeof(mock_model_data), &model_info);
    assert(status == INFER_OK);
    
    assert(model_info.input_size == 64);
    assert(model_info.output_size == 16);
    assert(model_info.layer_count > 0);
    assert(model_info.model_size == sizeof(mock_model_data));
    
    printf("✓ Model loading passed\n");
}

void test_input_preprocessing(void) {
    printf("Testing input preprocessing...\n");
    
    float preprocessed_input[64];
    infer_status_t status = infer_preprocess_input(
        test_input_data,
        preprocessed_input,
        64,
        PREPROCESS_NORMALIZE
    );
    assert(status == INFER_OK);
    
    // Verify preprocessing
    float sum = 0.0f;
    for (int i = 0; i < 64; i++) {
        sum += preprocessed_input[i];
    }
    float mean = sum / 64.0f;
    assert(fabs(mean) < 1.0f); // Should be normalized
    
    printf("✓ Input preprocessing passed\n");
}

void test_inference_execution(void) {
    printf("Testing inference execution...\n");
    
    float output[16];
    infer_result_t result;
    
    infer_status_t status = infer_execute(
        test_input_data,
        64,
        output,
        16,
        &result
    );
    assert(status == INFER_OK);
    
    // Verify inference results
    assert(result.inference_time > 0);
    assert(result.memory_usage > 0);
    assert(result.confidence >= 0.0f && result.confidence <= 1.0f);
    
    // Verify output values are reasonable
    for (int i = 0; i < 16; i++) {
        assert(!isnan(output[i]));
        assert(!isinf(output[i]));
    }
    
    printf("✓ Inference execution passed\n");
}

void test_batch_inference(void) {
    printf("Testing batch inference...\n");
    
    float batch_input[3][64];
    float batch_output[3][16];
    infer_result_t batch_results[3];
    
    // Prepare batch data
    for (int batch = 0; batch < 3; batch++) {
        for (int i = 0; i < 64; i++) {
            batch_input[batch][i] = test_input_data[i] + (float)batch * 10.0f;
        }
    }
    
    infer_status_t status = infer_execute_batch(
        (float*)batch_input,
        3,  // batch size
        64,  // input size
        (float*)batch_output,
        16,  // output size
        batch_results
    );
    assert(status == INFER_OK);
    
    // Verify batch results
    for (int batch = 0; batch < 3; batch++) {
        assert(batch_results[batch].inference_time > 0);
        assert(batch_results[batch].memory_usage > 0);
        
        for (int i = 0; i < 16; i++) {
            assert(!isnan(batch_output[batch][i]));
            assert(!isinf(batch_output[batch][i]));
        }
    }
    
    printf("✓ Batch inference passed\n");
}

void test_quantization(void) {
    printf("Testing quantization...\n");
    
    float original_data[64];
    int8_t quantized_data[64];
    float dequantized_data[64];
    
    // Copy test data
    memcpy(original_data, test_input_data, sizeof(test_input_data));
    
    // Test quantization
    infer_status_t status = infer_quantize_data(
        original_data,
        quantized_data,
        64,
        QUANTIZE_INT8
    );
    assert(status == INFER_OK);
    
    // Test dequantization
    status = infer_dequantize_data(
        quantized_data,
        dequantized_data,
        64,
        QUANTIZE_INT8
    );
    assert(status == INFER_OK);
    
    // Verify quantization accuracy
    float total_error = 0.0f;
    for (int i = 0; i < 64; i++) {
        float error = fabs(original_data[i] - dequantized_data[i]);
        total_error += error;
    }
    float avg_error = total_error / 64.0f;
    assert(avg_error < 1.0f); // Acceptable quantization error
    
    printf("✓ Quantization passed\n");
}

void test_performance_monitoring(void) {
    printf("Testing performance monitoring...\n");
    
    infer_performance_stats_t stats;
    infer_status_t status = infer_get_performance_stats(&stats);
    assert(status == INFER_OK);
    
    // Verify performance metrics
    assert(stats.total_inferences >= 0);
    assert(stats.avg_inference_time >= 0.0f);
    assert(stats.max_inference_time >= 0.0f);
    assert(stats.min_inference_time >= 0.0f);
    assert(stats.memory_usage >= 0);
    assert(stats.peak_memory_usage >= 0);
    
    printf("✓ Performance monitoring passed\n");
}

void test_error_handling(void) {
    printf("Testing error handling...\n");
    
    // Test with invalid input size
    float invalid_input[32];
    float output[16];
    infer_result_t result;
    
    infer_status_t status = infer_execute(invalid_input, 32, output, 16, &result);
    assert(status == INFER_ERROR_INVALID_INPUT);
    
    // Test with null pointers
    status = infer_execute(NULL, 64, output, 16, &result);
    assert(status == INFER_ERROR_NULL_POINTER);
    
    status = infer_execute(test_input_data, 64, NULL, 16, &result);
    assert(status == INFER_ERROR_NULL_POINTER);
    
    printf("✓ Error handling passed\n");
}

void test_infer_cleanup(void) {
    printf("Testing inference cleanup...\n");
    
    infer_status_t status = infer_cleanup();
    assert(status == INFER_OK);
    assert(!infer_is_initialized());
    
    printf("✓ Inference cleanup passed\n");
}

int main(void) {
    printf("=== EdgePlug Inference Test Suite ===\n\n");
    
    test_infer_init();
    test_model_loading();
    test_input_preprocessing();
    test_inference_execution();
    test_batch_inference();
    test_quantization();
    test_performance_monitoring();
    test_error_handling();
    test_infer_cleanup();
    
    printf("\n=== All inference tests passed! ===\n");
    return 0;
} 