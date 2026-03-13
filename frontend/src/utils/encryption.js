/**
 * encryption.js — TweetNaCl-based end-to-end encryption helpers.
 *
 * Key exchange: Curve25519 (box_keypair)
 * Encryption:  XSalsa20-Poly1305 (nacl.box)
 *
 * All keys / ciphertext are stored/transmitted as Base64 strings.
 */
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

/** Generate a new Curve25519 keypair and return Base64-encoded strings. */
export function generateKeyPair() {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

/**
 * Encrypt a plaintext message for a recipient.
 *
 * @param {string} plaintext        - The message to encrypt.
 * @param {string} recipientPubKey  - Base64 recipient public key.
 * @param {string} senderSecretKey  - Base64 sender secret key.
 * @returns {{ encryptedContent: string, nonce: string }}
 */
export function encryptMessage(plaintext, recipientPubKey, senderSecretKey) {
  const recipientPK = decodeBase64(recipientPubKey);
  const senderSK = decodeBase64(senderSecretKey);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = encodeUTF8(plaintext);
  const ciphertext = nacl.box(messageBytes, nonce, recipientPK, senderSK);
  return {
    encryptedContent: encodeBase64(ciphertext),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt a message from a sender.
 *
 * @param {string} encryptedContent - Base64 ciphertext.
 * @param {string} nonce            - Base64 nonce.
 * @param {string} senderPubKey     - Base64 sender public key.
 * @param {string} recipientSecKey  - Base64 recipient secret key.
 * @returns {string|null}            Plaintext or null on failure.
 */
export function decryptMessage(encryptedContent, nonce, senderPubKey, recipientSecKey) {
  try {
    const ciphertext = decodeBase64(encryptedContent);
    const nonceBytes = decodeBase64(nonce);
    const senderPK = decodeBase64(senderPubKey);
    const recipientSK = decodeBase64(recipientSecKey);
    const decrypted = nacl.box.open(ciphertext, nonceBytes, senderPK, recipientSK);
    if (!decrypted) return null;
    return decodeUTF8(decrypted);
  } catch {
    return null;
  }
}

/** Persist private key in localStorage (never sent to server). */
export function storePrivateKey(userId, secretKey) {
  localStorage.setItem(`sk_${userId}`, secretKey);
}

/** Retrieve private key from localStorage. */
export function getPrivateKey(userId) {
  return localStorage.getItem(`sk_${userId}`);
}
