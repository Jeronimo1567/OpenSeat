/**
 * Token validation for the NFC scan window.
 * For the hackathon demo we use a plain `scanned_at` unix timestamp.
 * For production swap this for HMAC verification.
 */

export const SCAN_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export function validateScanToken(scannedAt: string | null): {
  valid: boolean
  scannedAtMs: number
  error?: string
} {
  if (!scannedAt) {
    return { valid: false, scannedAtMs: 0, error: 'Missing scan token. Please tap the NFC tag again.' }
  }

  const scannedAtMs = Number(scannedAt)
  if (isNaN(scannedAtMs) || scannedAtMs <= 0) {
    return { valid: false, scannedAtMs: 0, error: 'Invalid scan token. Please tap the NFC tag again.' }
  }

  const age = Date.now() - scannedAtMs
  if (age > SCAN_WINDOW_MS) {
    return {
      valid: false,
      scannedAtMs,
      error: 'This reservation link has expired. Please tap the NFC tag again.',
    }
  }

  if (age < 0) {
    return { valid: false, scannedAtMs: 0, error: 'Invalid scan timestamp.' }
  }

  return { valid: true, scannedAtMs }
}
