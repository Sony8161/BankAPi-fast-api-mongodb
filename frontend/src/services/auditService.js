import api from './api.js'

// DATA SERVICE for the audit trail (admin only).

export async function getAllTransactions() {
  const res = await api.get('/audit/transactions')
  return res.data // newest first
}
