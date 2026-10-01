import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getCustomerAccounts, getCustomerTransactions } from '../../services/customerService.js'
import { errorMessage } from '../../services/api.js'
import TransactionTable from '../../components/TransactionTable.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'DEPOSIT', label: 'Deposits' },
  { value: 'WITHDRAW', label: 'Withdrawals' },
  { value: 'TRANSFER', label: 'Transfers' },
]

export default function ActivityPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [accountIds, setAccountIds] = useState(new Set())
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [accounts, txns] = await Promise.all([
        getCustomerAccounts(user.customerId),
        getCustomerTransactions(user.customerId),
      ])
      setAccountIds(new Set(accounts.map((a) => a.id)))
      setTransactions(txns)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Filtering happens in the browser: no new request, just a different view of the same list.
  const shown = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <div className="page">
      <div className="page-title"><h1>Activity</h1></div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f.value} className={`chip-btn ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>
      {loading && <Spinner message="Loading activity..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && (shown.length === 0
        ? <EmptyState message="Nothing to show yet." />
        : <TransactionTable transactions={shown} myAccountIds={accountIds} />)}
    </div>
  )
}
