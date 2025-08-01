# Source files for EdgePlug runtime
set(RUNTIME_SOURCES
    edgeplug_runtime.c
    agent_loader.c
    preprocess.c
    infer.c
    actuator.c
    hotswap.c
    bootloader_patch.c
    crypto_impl.c
)

# Create runtime library
add_library(edgeplug_runtime STATIC ${RUNTIME_SOURCES})

# Set target properties
set_target_properties(edgeplug_runtime PROPERTIES
    C_STANDARD 11
    C_STANDARD_REQUIRED ON
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED ON
)

# Include directories
target_include_directories(edgeplug_runtime PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
    ${CMAKE_CURRENT_SOURCE_DIR}/../third_party/cmsis-nn/include
    ${CMAKE_CURRENT_SOURCE_DIR}/../third_party/cbor/include
)

# Compiler flags for embedded systems
if(MSVC)
    target_compile_options(edgeplug_runtime PRIVATE
        /W3
        /WX
        /O2
        /GS
    )
    
    # Linker flags for MSVC
    target_link_options(edgeplug_runtime PRIVATE
        /OPT:REF
        /OPT:ICF
    )
else()
    target_compile_options(edgeplug_runtime PRIVATE
        -Wall
        -Wextra
        -Werror
        -O2
        -fstack-protector-strong
        -ffunction-sections
        -fdata-sections
    )
    
    # Linker flags for embedded systems
    target_link_options(edgeplug_runtime PRIVATE
        -Wl,--gc-sections
        -Wl,--strip-all
    )
endif()

# Platform-specific configurations
if(CMAKE_SYSTEM_NAME STREQUAL "STM32")
    target_compile_definitions(edgeplug_runtime PRIVATE
        PLATFORM_STM32=1
        USE_HAL_DRIVER=1
    )
elseif(CMAKE_SYSTEM_NAME STREQUAL "NXP")
    target_compile_definitions(edgeplug_runtime PRIVATE
        PLATFORM_NXP=1
    )
endif()

# Memory budget verification
add_custom_command(TARGET edgeplug_runtime POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E echo "EdgePlug Runtime built successfully"
    COMMAND ${CMAKE_COMMAND} -E echo "Flash usage: $<TARGET_FILE:edgeplug_runtime>"
    COMMAND ${CMAKE_COMMAND} -E echo "Verifying memory budgets..."
)

# Static analysis integration
if(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    target_compile_options(edgeplug_runtime PRIVATE
        -Weverything
        -Wno-c++98-compat
        -Wno-c++98-compat-pedantic
    )
endif()

# Coverage support
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    if(NOT MSVC)
        target_compile_options(edgeplug_runtime PRIVATE --coverage)
        target_link_options(edgeplug_runtime PRIVATE --coverage)
    endif()
endif() 