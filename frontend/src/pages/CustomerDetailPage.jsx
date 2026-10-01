import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCustomerById, getCustomerAccounts, getCustomerTransactions } from '../services/customerService.js'
import { createAccount } from '../services/accountService.js'
import { errorMessage } from '../services/api.js'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AccountTable from '../components/AccountTable.jsx'
import OpenAccountForm from '../components/OpenAccountForm.jsx'
import OnlineBankingPanel from '../components/OnlineBankingPanel.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { initials } from '../utils/format.js'



export default function CustomerDetailPage() {
  const { id } = useParams() // the :id part of the URL /customers/:id, e.g. "3"


  const [customer, setCustomer] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')  
  const [transactions, setTransactions] = useState([])
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

  // Staff open an account for this customer (added for the admin portal)
  async function handleOpen(type) {
    try {
      const account = await createAccount(Number(id), type)
      setAccounts((current) => [...current, account])
      setNotice({ type: 'success', text: `Opened account ${account.id}.` })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) })
    }
  }


  return (
    <section className="page">
      <Link className="back-link" to="/admin/customers">← Back to customers</Link>
      {loading && <Spinner message="Loading customer..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && customer && (
        <>
          <div className="profile">
            <div className="avatar avatar-lg">{initials(customer.name)}</div>
            <div>
              <h2>{customer.name}</h2>
              <p className="muted">ID: {customer.id} · Email: {customer.email}</p>
            </div>
          </div>
          <OnlineBankingPanel customerId={customer.id} />
          <div className="section-head">
            <h3>Accounts</h3>
            <OpenAccountForm onOpen={handleOpen} />
          </div>
          {notice && <div className={`alert alert-${notice.type}`}>{notice.text}</div>}
          {accounts.length === 0 ? (
            <EmptyState message="This customer has no accounts yet." />
          ) : (
            <AccountTable accounts={accounts} />
          )}
          <h3 className="section">Transactions</h3>
          {transactions.length === 0 ? (
            <EmptyState message="No transactions yet." />
          ) : (
            <TransactionTable transactions={transactions} myAccountIds={new Set(accounts.map((a) => a.id))} />
          )}
        </>
      )}
    </section>
  )
}
