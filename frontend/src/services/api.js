import axios from 'axios'

// One Axios "instance" for the whole app: every request starts with this base URL.
// Change it in a .env file (VITE_API_URL=...) without touching code.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  timeout: 10000, // give up after 10 seconds instead of spinning forever
})

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
