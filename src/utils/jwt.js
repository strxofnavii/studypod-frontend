// Decodes the payload of a JWT without verifying the signature.
// Verification always happens server-side — this is only used so the
// UI can read non-sensitive claims (like `role`) that are already
// embedded in the token by the backend (see JwtUtil.generateToken).
export function decodeToken(token) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    // JWTs use base64url, not standard base64: swap the two characters
    // that differ, then restore the padding base64url strips.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )

    return JSON.parse(json)
  } catch {
    return null
  }
}

// Convenience helpers for the common case of reading the currently
// stored session token.
export function getStoredRole() {
  const payload = decodeToken(localStorage.getItem('token'))
  return payload?.role || null
}

export function getStoredUserInternalId() {
  const payload = decodeToken(localStorage.getItem('token'))
  return payload?.sub || null
}
