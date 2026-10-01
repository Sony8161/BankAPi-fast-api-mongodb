import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deposit, getAccount, getAccountTransactions, withdraw } from '../../services/accountService.js'
import { errorMessage } from '../../services/api.js'
import { accountName, accountNumber, money } from '../../utils/format.js'
import MoneyForm from '../../components/MoneyForm.jsx'
import TransactionTable from '../../components/TransactionTable.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'

// One account: balance, deposit/withdraw, and its history.
// Try changing the id in the URL to someone else's account: the backend answers 403.
export default function AccountPage() {
  const { id } = useParams()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [a, t] = await Promise.all([getAccount(id), getAccountTransactions(id)])
      setAccount(a)
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

  async function handleMoney(kind, amount) {
    try {
      const updated = kind === 'deposit' ? await deposit(id, amount) : await withdraw(id, amount)
      setAccount(updated)
      setTransactions(await getAccountTransactions(id))
      setNotice({ type: 'success', text: `${kind === 'deposit' ? 'Deposited' : 'Withdrew'} ${money(amount)}.` })
      return true
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) }) // e.g. "Insufficient funds"
      return false
    }
  }

  return (
    <div className="page">
      <Link className="back-link" to="/app">← Back to overview</Link>
      {loading && <Spinner message="Loading account..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && account && (
        <>
          <div className="account-hero">
            <div>
              <span className="account-type">{accountName(account.accountType)} account</span>
              <span className="mono muted"> · No. {accountNumber(account.id)}</span>
              <strong>{money(account.balance)}</strong>
              <small>Available balance</small>
            </div>
            <MoneyForm onSubmit={handleMoney} />
          </div>
          {notice && <div className={`alert alert-${notice.type}`}>{notice.text}</div>}
          <section className="section">
            <div className="section-head"><h2>Transactions</h2></div>
            {transactions.length === 0 ? (
              <EmptyState message="No transactions on this account yet." />
            ) : (
              <TransactionTable transactions={transactions} myAccountIds={new Set([account.id])} />
            )}
          </section>
        </>
      )}
    </div>
  )
}
