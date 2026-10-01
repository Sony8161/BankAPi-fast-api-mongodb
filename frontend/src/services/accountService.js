import api from './api.js'

// DATA SERVICE for accounts. Ready for the account screens.

export async function getAccount(id) {
  const res = await api.get(`/accounts/${id}`)
  return res.data
}

export async function createAccount(customerId, accountType) {
  const res = await api.post('/accounts', { customerId, accountType })
  return res.data
}

export async function deposit(id, amount) {
  const res = await api.post(`/accounts/${id}/deposit`, { amount })
  return res.data
}

export async function withdraw(id, amount) {
  const res = await api.post(`/accounts/${id}/withdraw`, { amount })
  return res.data
}

export async function getPremiumAccounts(threshold) {
  const res = await api.get('/accounts/premium', { params: { threshold } })
  return res.data
}

export async function getAccountTransactions(id) {
  const res = await api.get(`/accounts/${id}/transactions`)
  return res.data
}
