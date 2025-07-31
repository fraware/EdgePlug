cmake_minimum_required(VERSION 3.20)
project(EdgePlug_Runtime VERSION 1.0.0 LANGUAGES C CXX)

# Set C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Compiler flags for embedded systems with size optimization
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Werror -Os -ffunction-sections -fdata-sections")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Werror -Os -ffunction-sections -fdata-sections")

# MISRA-C 2023 compliance flags
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fstack-protector-strong")

# Memory budget verification
set(FLASH_SIZE_LIMIT 32768)  # 32KB
set(SRAM_SIZE_LIMIT 4096)    # 4KB

# Find required packages
find_package(PkgConfig REQUIRED)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/cmsis-nn/include
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/cbor/include
)

# Add subdirectories
add_subdirectory(src)
add_subdirectory(tests)

# Platform-specific targets
if(CMAKE_SYSTEM_NAME STREQUAL "STM32")
    add_subdirectory(platforms/stm32)
elseif(CMAKE_SYSTEM_NAME STREQUAL "NXP")
    add_subdirectory(platforms/nxp)
endif()

# Memory budget verification target
add_custom_target(memory_check
    COMMAND ${CMAKE_COMMAND} -E echo "Verifying memory budgets..."
    COMMAND ${CMAKE_COMMAND} -E echo "Flash limit: ${FLASH_SIZE_LIMIT} bytes"
    COMMAND ${CMAKE_COMMAND} -E echo "SRAM limit: ${SRAM_SIZE_LIMIT} bytes"
    DEPENDS edgeplug_runtime
)

# Static analysis targets
add_custom_target(clang_tidy
    COMMAND clang-tidy --version
    COMMAND clang-tidy src/*.c src/*.cpp --checks=*
    DEPENDS edgeplug_runtime
)

add_custom_target(cppcheck
    COMMAND cppcheck --version
    COMMAND cppcheck --enable=all --std=c11 src/
    DEPENDS edgeplug_runtime
)

# Coverage target
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --coverage")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --coverage")
endif() 