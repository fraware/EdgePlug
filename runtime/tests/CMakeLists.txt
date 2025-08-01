# Test executables
add_executable(test_edgeplug_runtime test_runtime.c)
add_executable(test_crypto test_crypto.c)
add_executable(test_agent_loader test_agent_loader.c)
add_executable(test_hotswap test_hotswap.c)
add_executable(test_preprocess test_preprocess.c)
add_executable(test_infer test_infer.c)
add_executable(test_actuator test_actuator.c)

# Link with runtime library
target_link_libraries(test_edgeplug_runtime edgeplug_runtime)
target_link_libraries(test_crypto edgeplug_runtime)
target_link_libraries(test_agent_loader edgeplug_runtime)
target_link_libraries(test_hotswap edgeplug_runtime)
target_link_libraries(test_preprocess edgeplug_runtime)
target_link_libraries(test_infer edgeplug_runtime)
target_link_libraries(test_actuator edgeplug_runtime)

# Include directories
target_include_directories(test_edgeplug_runtime PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_crypto PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_agent_loader PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_hotswap PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_preprocess PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_infer PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)
target_include_directories(test_actuator PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)

# Compiler flags for tests
target_compile_options(test_edgeplug_runtime PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_crypto PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_agent_loader PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_hotswap PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_preprocess PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_infer PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)
target_compile_options(test_actuator PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
)

# Run tests
add_test(NAME EdgePlugRuntimeTest COMMAND test_edgeplug_runtime)
add_test(NAME EdgePlugCryptoTest COMMAND test_crypto)
add_test(NAME EdgePlugAgentLoaderTest COMMAND test_agent_loader)
add_test(NAME EdgePlugHotswapTest COMMAND test_hotswap)
add_test(NAME EdgePlugPreprocessTest COMMAND test_preprocess)
add_test(NAME EdgePlugInferTest COMMAND test_infer)
add_test(NAME EdgePlugActuatorTest COMMAND test_actuator)

# Coverage support
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(test_edgeplug_runtime PRIVATE --coverage)
    target_link_options(test_edgeplug_runtime PRIVATE --coverage)
    target_compile_options(test_crypto PRIVATE --coverage)
    target_link_options(test_crypto PRIVATE --coverage)
    target_compile_options(test_agent_loader PRIVATE --coverage)
    target_link_options(test_agent_loader PRIVATE --coverage)
    target_compile_options(test_hotswap PRIVATE --coverage)
    target_link_options(test_hotswap PRIVATE --coverage)
    target_compile_options(test_preprocess PRIVATE --coverage)
    target_link_options(test_preprocess PRIVATE --coverage)
    target_compile_options(test_infer PRIVATE --coverage)
    target_link_options(test_infer PRIVATE --coverage)
    target_compile_options(test_actuator PRIVATE --coverage)
    target_link_options(test_actuator PRIVATE --coverage)
endif()

# Coverage target
add_custom_target(coverage
    COMMAND ${CMAKE_COMMAND} -E echo "Running coverage analysis..."
    COMMAND lcov --capture --directory . --output-file coverage.info
    COMMAND lcov --remove coverage.info '/usr/*' --output-file coverage.info
    COMMAND lcov --list coverage.info
    COMMAND genhtml coverage.info --output-directory coverage_report
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
    DEPENDS test_edgeplug_runtime test_crypto test_agent_loader test_hotswap test_preprocess test_infer test_actuator
    COMMENT "Generating coverage report"
) 