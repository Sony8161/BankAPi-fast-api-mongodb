// Where the login is kept between page reloads: the browser's localStorage.
// Trade-off to know for interviews: any script running on the page can read localStorage,
// so an XSS bug could steal the token. Many real banks use httpOnly cookies instead.
// localStorage keeps this project simple and lets you SEE the token in DevTools > Application.
const TOKEN_KEY = 'sb_token'
const USER_KEY = 'sb_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// The saved user, or null if there is none or the token has already expired.
export function readUser() {
  const token = getToken()
  const raw = localStorage.getItem(USER_KEY)
  if (!token || !raw || isExpired(token)) {
    clearSession()
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    clearSession()
    return null
  }
}

// A JWT is header.payload.signature. The payload is base64 JSON that ANYONE can read
// (it's signed, not encrypted), so the browser can check the "exp" time without the secret.
// The server still checks the signature on every request; this is only a convenience.
export function isExpired(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(part))
    return payload.exp * 1000 < Date.now() // exp is in seconds, Date.now() in milliseconds
  } catch {
    return true
  }
}
