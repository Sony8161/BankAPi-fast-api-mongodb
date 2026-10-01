import api from './api.js'

// DATA SERVICE for logins.

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password })
  return res.data // { accessToken, tokenType, user: { id, username, role, customerId } }
}

export async function register({ name, email, username, password }) {
  const res = await api.post('/auth/register', { name, email, username, password })
  return res.data // same shape as login: sign-up logs you straight in
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data
}

// admin only
export async function listLogins() {
  const res = await api.get('/auth/users')
  return res.data
}

// admin only: turn on online banking for an existing customer
export async function createLogin(customerId, username, password) {
  const res = await api.post('/auth/users', { customerId, username, password })
  return res.data
}
