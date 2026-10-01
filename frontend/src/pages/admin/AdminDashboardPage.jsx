import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCustomers } from '../../services/customerService.js'
import { getAllAccounts } from '../../services/accountService.js'
import { getAllTransactions } from '../../services/auditService.js'
import { errorMessage } from '../../services/api.js'
import { money } from '../../utils/format.js'
import StatCard from '../../components/StatCard.jsx'
import TransactionTable from '../../components/TransactionTable.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const PREMIUM = 1000 // same rule as the backend's premium filter: balance >= $1,000

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      // three requests at the same time, wait for all of them
      const [customers, accounts, transactions] = await Promise.all([
        getAllCustomers(), getAllAccounts(), getAllTransactions(),
      ])
      setData({ customers, accounts, transactions })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <Spinner message="Loading dashboard..." />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  const { customers, accounts, transactions } = data
  const held = accounts.reduce((sum, a) => sum + a.balance, 0)
  const savings = accounts.filter((a) => a.accountType === 'SAVINGS').length
  const premium = accounts.filter((a) => a.balance >= PREMIUM).length
  const today = new Date().toDateString()
  const todayCount = transactions.filter((t) => new Date(t.timestamp).toDateString() === today).length

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <p className="muted">Staff portal</p>
          <h1>Dashboard</h1>
        </div>
        <Link className="btn btn-primary" to="/admin/customers">Manage customers</Link>
      </div>

      <div className="stats">
        <StatCard label="Customers" value={customers.length} hint="people on file" />
        <StatCard label="Accounts" value={accounts.length} hint={`${savings} savings · ${accounts.length - savings} checking`} tone="teal" />
        <StatCard label="Deposits held" value={money(held)} hint={`${premium} premium (≥ ${money(PREMIUM)})`} tone="green" />
        <StatCard label="Transactions" value={transactions.length} hint={`${todayCount} today`} tone="amber" />
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Latest transactions</h2>
          <Link to="/admin/audit">Open audit log</Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyState message="No transactions yet." />
        ) : (
          <TransactionTable transactions={transactions.slice(0, 8)} showCustomer />
        )}
      </section>
    </div>
  )
}
