/**
 * @file crypto_impl.h
 * @brief Cryptographic implementation header for EdgePlug
 * @version 1.0.0
 * @license MIT
 */

#ifndef CRYPTO_IMPL_H
#define CRYPTO_IMPL_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Calculate SHA-512 hash
 * 
 * @param data Input data to hash
 * @param data_size Size of input data
 * @param hash Output hash (64 bytes)
 */
void crypto_sha512(const uint8_t* data, size_t data_size, uint8_t* hash);

/**
 * @brief Verify Ed25519 signature
 * 
 * @param message Message that was signed
 * @param message_len Length of message
 * @param signature Ed25519 signature (64 bytes)
 * @param public_key Public key (32 bytes)
 * @return true if signature is valid, false otherwise
 */
bool crypto_verify_ed25519(const uint8_t* message, size_t message_len,
                          const uint8_t* signature, const uint8_t* public_key);

/**
 * @brief Generate cryptographically secure random bytes
 * 
 * @param buffer Output buffer for random bytes
 * @param size Number of random bytes to generate
 */
void crypto_random_bytes(uint8_t* buffer, size_t size);

/**
 * @brief Calculate HMAC-SHA512
 * 
 * @param key HMAC key
 * @param key_len Length of key
 * @param data Data to authenticate
 * @param data_len Length of data
 * @param mac Output MAC (64 bytes)
 */
void crypto_hmac_sha512(const uint8_t* key, size_t key_len,
                       const uint8_t* data, size_t data_len,
                       uint8_t* mac);

/**
 * @brief Verify HMAC-SHA512
 * 
 * @param key HMAC key
 * @param key_len Length of key
 * @param data Data that was authenticated
 * @param data_len Length of data
 * @param mac MAC to verify (64 bytes)
 * @return true if MAC is valid, false otherwise
 */
bool crypto_verify_hmac_sha512(const uint8_t* key, size_t key_len,
                              const uint8_t* data, size_t data_len,
                              const uint8_t* mac);

/**
 * @brief AES-256 encryption (for sensitive data)
 * 
 * @param key Encryption key (32 bytes)
 * @param plaintext Input plaintext
 * @param plaintext_len Length of plaintext
 * @param ciphertext Output ciphertext
 * @param iv Initialization vector (16 bytes)
 */
void crypto_aes256_encrypt(const uint8_t* key, const uint8_t* plaintext,
                          size_t plaintext_len, uint8_t* ciphertext,
                          const uint8_t* iv);

/**
 * @brief AES-256 decryption
 * 
 * @param key Decryption key (32 bytes)
 * @param ciphertext Input ciphertext
 * @param ciphertext_len Length of ciphertext
 * @param plaintext Output plaintext
 * @param iv Initialization vector (16 bytes)
 */
void crypto_aes256_decrypt(const uint8_t* key, const uint8_t* ciphertext,
                          size_t ciphertext_len, uint8_t* plaintext,
                          const uint8_t* iv);

/**
 * @brief Generate secure random initialization vector
 * 
 * @param iv Output IV (16 bytes)
 */
void crypto_generate_iv(uint8_t* iv);

/**
 * @brief Secure key derivation function (PBKDF2)
 * 
 * @param password Input password
 * @param password_len Length of password
 * @param salt Salt for key derivation
 * @param salt_len Length of salt
 * @param iterations Number of iterations
 * @param key Output derived key
 * @param key_len Length of derived key
 */
void crypto_pbkdf2_sha512(const uint8_t* password, size_t password_len,
                         const uint8_t* salt, size_t salt_len,
                         uint32_t iterations, uint8_t* key, size_t key_len);

#ifdef __cplusplus
}
#endif

#endif // CRYPTO_IMPL_H 