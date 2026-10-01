import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getCustomerAccounts, getCustomerById, getCustomerTransactions } from '../../services/customerService.js'
import { createAccount } from '../../services/accountService.js'
import { errorMessage } from '../../services/api.js'
import { accountName, greeting, money } from '../../utils/format.js'
import AccountCard from '../../components/AccountCard.jsx'
import OpenAccountForm from '../../components/OpenAccountForm.jsx'
import TransactionTable from '../../components/TransactionTable.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Icon from '../../components/Icon.jsx'

// The customer's home page. Who "me" is comes from the login token (user.customerId),
// so there is no id in the URL for someone to change.
export default function DashboardPage() {
  const { user } = useAuth()
  const id = user.customerId
  const [customer, setCustomer] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [c, a, t] = await Promise.all([getCustomerById(id), getCustomerAccounts(id), getCustomerTransactions(id)])
      setCustomer(c)
      setAccounts(a)
      setTransactions(t)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleOpen(type) {
    try {
      const account = await createAccount(id, type)
      setAccounts((current) => [...current, account])
      setNotice({ type: 'success', text: `Opened ${accountName(type)} account ${account.id}.` })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) })
    }
  }

  if (loading) return <Spinner message="Loading your accounts..." />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  const total = accounts.reduce((sum, a) => sum + a.balance, 0)
  const myAccountIds = new Set(accounts.map((a) => a.id))

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <p className="muted">{greeting()},</p>
          <h1>{customer.name}</h1>
        </div>
        <Link className="btn btn-primary" to="/app/transfer"><Icon name="swap" /> Transfer money</Link>
      </div>

      <div className="balance-hero">
        <span>Total balance</span>
        <strong>{money(total)}</strong>
        <small>across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</small>
      </div>

      {notice && <div className={`alert alert-${notice.type}`}>{notice.text}</div>}

      <section className="section">
        <div className="section-head">
          <h2>Your accounts</h2>
          <OpenAccountForm onOpen={handleOpen} />
        </div>
        {accounts.length === 0 ? (
          <EmptyState message="You don't have any accounts yet. Open one to get started." />
        ) : (
          <div className="account-grid">
            {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Recent activity</h2>
          <Link to="/app/activity">View all</Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyState message="No transactions yet." />
        ) : (
          <TransactionTable transactions={transactions.slice(0, 5)} myAccountIds={myAccountIds} />
        )}
      </section>
    </div>
  )
}
