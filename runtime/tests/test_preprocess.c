/**
 * @file test_preprocess.c
 * @brief Test suite for EdgePlug preprocessing functionality
 * @version 1.0.0
 * @license MIT
 */

#include "preprocess.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <math.h>

// Test data structures
static float test_sensor_data[] = {
    120.0f, 121.0f, 119.0f, 122.0f, 118.0f,
    123.0f, 117.0f, 124.0f, 116.0f, 125.0f
};

static float test_voltage_data[] = {
    230.0f, 231.0f, 229.0f, 232.0f, 228.0f,
    233.0f, 227.0f, 234.0f, 226.0f, 235.0f
};

static float test_current_data[] = {
    15.0f, 15.1f, 14.9f, 15.2f, 14.8f,
    15.3f, 14.7f, 15.4f, 14.6f, 15.5f
};

void test_preprocess_init(void) {
    printf("Testing preprocessing initialization...\n");
    
    preprocess_config_t config = {
        .window_size = 64,
        .sample_rate = 1000,
        .normalization_enabled = true,
        .filtering_enabled = true,
        .feature_extraction_enabled = true
    };
    
    preprocess_status_t status = preprocess_init(&config);
    assert(status == PREPROCESS_OK);
    assert(preprocess_is_initialized());
    
    printf("✓ Preprocessing initialization passed\n");
}

void test_data_normalization(void) {
    printf("Testing data normalization...\n");
    
    float input_data[10];
    float normalized_data[10];
    
    // Copy test data
    memcpy(input_data, test_sensor_data, sizeof(test_sensor_data));
    
    preprocess_status_t status = preprocess_normalize_data(
        input_data, 
        normalized_data, 
        10, 
        NORMALIZE_Z_SCORE
    );
    assert(status == PREPROCESS_OK);
    
    // Verify normalization (mean should be close to 0, std dev close to 1)
    float sum = 0.0f;
    for (int i = 0; i < 10; i++) {
        sum += normalized_data[i];
    }
    float mean = sum / 10.0f;
    assert(fabs(mean) < 0.1f); // Mean should be close to 0
    
    printf("✓ Data normalization passed\n");
}

void test_signal_filtering(void) {
    printf("Testing signal filtering...\n");
    
    float input_data[10];
    float filtered_data[10];
    
    // Add some noise to test data
    memcpy(input_data, test_sensor_data, sizeof(test_sensor_data));
    for (int i = 0; i < 10; i++) {
        input_data[i] += (float)(rand() % 10 - 5) * 0.1f; // Add noise
    }
    
    preprocess_status_t status = preprocess_apply_filter(
        input_data,
        filtered_data,
        10,
        FILTER_LOW_PASS,
        50.0f  // 50Hz cutoff
    );
    assert(status == PREPROCESS_OK);
    
    // Verify filtering reduced noise
    float original_variance = 0.0f;
    float filtered_variance = 0.0f;
    float original_mean = 0.0f;
    float filtered_mean = 0.0f;
    
    for (int i = 0; i < 10; i++) {
        original_mean += input_data[i];
        filtered_mean += filtered_data[i];
    }
    original_mean /= 10.0f;
    filtered_mean /= 10.0f;
    
    for (int i = 0; i < 10; i++) {
        original_variance += (input_data[i] - original_mean) * (input_data[i] - original_mean);
        filtered_variance += (filtered_data[i] - filtered_mean) * (filtered_data[i] - filtered_mean);
    }
    original_variance /= 10.0f;
    filtered_variance /= 10.0f;
    
    // Filtered data should have lower variance (less noise)
    assert(filtered_variance <= original_variance);
    
    printf("✓ Signal filtering passed\n");
}

void test_feature_extraction(void) {
    printf("Testing feature extraction...\n");
    
    float input_data[64];
    preprocess_features_t features;
    
    // Generate test data
    for (int i = 0; i < 64; i++) {
        input_data[i] = 120.0f + 10.0f * sin(2.0f * M_PI * i / 64.0f) + 
                       (float)(rand() % 10 - 5) * 0.1f;
    }
    
    preprocess_status_t status = preprocess_extract_features(
        input_data,
        64,
        &features
    );
    assert(status == PREPROCESS_OK);
    
    // Verify extracted features
    assert(features.mean > 0.0f);
    assert(features.std_dev > 0.0f);
    assert(features.min_value <= features.max_value);
    assert(features.rms > 0.0f);
    assert(features.peak_to_peak > 0.0f);
    
    printf("✓ Feature extraction passed\n");
}

void test_voltage_event_detection(void) {
    printf("Testing voltage event detection...\n");
    
    float voltage_data[64];
    voltage_event_t events[10];
    uint32_t event_count = 0;
    
    // Generate test data with voltage events
    for (int i = 0; i < 64; i++) {
        voltage_data[i] = 230.0f;
        if (i == 20) voltage_data[i] = 280.0f; // Voltage spike
        if (i == 40) voltage_data[i] = 180.0f; // Voltage dip
    }
    
    preprocess_status_t status = preprocess_detect_voltage_events(
        voltage_data,
        64,
        events,
        10,
        &event_count
    );
    assert(status == PREPROCESS_OK);
    assert(event_count > 0);
    
    // Verify detected events
    bool found_spike = false;
    bool found_dip = false;
    
    for (uint32_t i = 0; i < event_count; i++) {
        if (events[i].type == VOLTAGE_EVENT_SPIKE) {
            found_spike = true;
        }
        if (events[i].type == VOLTAGE_EVENT_DIP) {
            found_dip = true;
        }
    }
    
    assert(found_spike || found_dip);
    
    printf("✓ Voltage event detection passed\n");
}

void test_data_window_management(void) {
    printf("Testing data window management...\n");
    
    preprocess_window_t window;
    preprocess_status_t status = preprocess_create_window(&window, 64);
    assert(status == PREPROCESS_OK);
    
    // Add data to window
    for (int i = 0; i < 32; i++) {
        status = preprocess_add_to_window(&window, (float)i);
        assert(status == PREPROCESS_OK);
    }
    
    assert(window.count == 32);
    assert(window.is_full == false);
    
    // Fill window completely
    for (int i = 32; i < 64; i++) {
        status = preprocess_add_to_window(&window, (float)i);
        assert(status == PREPROCESS_OK);
    }
    
    assert(window.count == 64);
    assert(window.is_full == true);
    
    // Test window overflow
    status = preprocess_add_to_window(&window, 100.0f);
    assert(status == PREPROCESS_OK);
    assert(window.count == 64); // Should maintain size
    
    preprocess_destroy_window(&window);
    
    printf("✓ Data window management passed\n");
}

void test_preprocess_cleanup(void) {
    printf("Testing preprocessing cleanup...\n");
    
    preprocess_status_t status = preprocess_cleanup();
    assert(status == PREPROCESS_OK);
    assert(!preprocess_is_initialized());
    
    printf("✓ Preprocessing cleanup passed\n");
}

int main(void) {
    printf("=== EdgePlug Preprocessing Test Suite ===\n\n");
    
    test_preprocess_init();
    test_data_normalization();
    test_signal_filtering();
    test_feature_extraction();
    test_voltage_event_detection();
    test_data_window_management();
    test_preprocess_cleanup();
    
    printf("\n=== All preprocessing tests passed! ===\n");
    return 0;
} 