import axios from 'axios'
import { getToken } from '../auth/session.js'

// One Axios "instance" for the whole app: every request starts with this base URL.
// Change it in a .env file (VITE_API_URL=...) without touching code.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  timeout: 10000, // give up after 10 seconds instead of spinning forever
})

// REQUEST INTERCEPTOR: runs before EVERY request. Adds the login token if we have one,
// so no service function has to remember to do it.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// RESPONSE INTERCEPTOR: runs on every failed response. A 401 means the token is missing,
// expired or fake, so tell AuthContext to log out (it listens for this event).
// Login/register are skipped: a 401 there just means "wrong password".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error) // the page's catch block still runs
  },
)

// Turns any failed request into ONE readable sentence for the screen.
export function errorMessage(error) {
  if (error.response) {
    // The backend answered, but with an error status (404, 400, 422, 500...)
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail // our HTTPException messages, e.g. "Customer not found"
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join('; ') // Pydantic 422 validation list
    return `Request failed with status ${error.response.status}`
  }
  if (error.request) {
    // The request went out but nothing came back: server down, wrong URL, or blocked by CORS
    return 'Cannot reach the server. Is the backend running on port 8000?'
  }
  return error.message
}

export default api
