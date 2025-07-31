# Test executable
add_executable(test_edgeplug_runtime test_runtime.c)

# Link with runtime library
target_link_libraries(test_edgeplug_runtime edgeplug_runtime)

# Include directories
target_include_directories(test_edgeplug_runtime PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)

# Compiler flags for tests
target_compile_options(test_edgeplug_runtime PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)

# Run tests
add_test(NAME EdgePlugRuntimeTest COMMAND test_edgeplug_runtime)

# Coverage support
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(test_edgeplug_runtime PRIVATE --coverage)
    target_link_options(test_edgeplug_runtime PRIVATE --coverage)
endif() 