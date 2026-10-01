import { useEffect, useState } from 'react'
import { getAllTransactions } from '../../services/auditService.js'
import { errorMessage } from '../../services/api.js'
import TransactionTable from '../../components/TransactionTable.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const TYPES = ['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER']

// The audit trail: every money movement, newest first. Answers who, what, when, which accounts.
export default function AuditPage() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('ALL')
  const [customer, setCustomer] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTransactions(await getAllTransactions())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const shown = transactions
    .filter((t) => type === 'ALL' || t.type === type)
    .filter((t) => customer === '' || t.customerId === Number(customer))

  return (
    <div className="page">
      <div className="page-title">
        <h1>Audit log</h1>
        {!loading && !error && <span className="count">{shown.length} of {transactions.length}</span>}
      </div>
      <div className="toolbar">
        <div className="chips">
          {TYPES.map((t) => (
            <button key={t} className={`chip-btn ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input className="toolbar-input" type="number" min="1" placeholder="Customer ID"
          value={customer} onChange={(e) => setCustomer(e.target.value)} />
      </div>
      {loading && <Spinner message="Loading audit log..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && (shown.length === 0
        ? <EmptyState message="No transactions match." />
        : <TransactionTable transactions={shown} showCustomer />)}
    </div>
  )
}
