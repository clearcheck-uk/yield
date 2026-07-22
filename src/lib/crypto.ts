import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const PREFIX = 'enc:v1:'
const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY is not set')
  const buf = Buffer.from(key, 'base64')
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be a base64-encoded 32-byte key')
  return buf
}

// Encrypts a value for storage at rest. Empty/falsy values pass through unchanged
// so "not yet set" fields (e.g. nino before HMRC setup) don't need special-casing.
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return PREFIX + [iv, authTag, ciphertext].map(b => b.toString('hex')).join(':')
}

// Decrypts a value read from storage. Values without the enc:v1: prefix are
// returned unchanged — covers empty values and any pre-encryption legacy rows,
// which get re-encrypted automatically the next time they're written.
export function decrypt(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value
  const [ivHex, authTagHex, ciphertextHex] = value.slice(PREFIX.length).split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
