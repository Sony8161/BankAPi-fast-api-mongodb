import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCustomerById, getCustomerAccounts } from '../services/customerService.js'
import { errorMessage } from '../services/api.js'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AccountTable from '../components/AccountTable.jsx'



export default function CustomerDetailPage() {
  const { id } = useParams() // the :id part of the URL /customers/:id, e.g. "3"


  const [customer, setCustomer] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')  

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [c, a] = await Promise.all([getCustomerById(id), getCustomerAccounts(id)])
      setCustomer(c)
      setAccounts(a)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])


  return (
    <section>
      <Link to="/customers">← Back to customers</Link>
      {loading && <Spinner message="Loading customer..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && customer && (
        <>
          <h2>{customer.name}</h2>
          <p>ID: {customer.id}</p>
          <p>Email: {customer.email}</p>
          <h3>Accounts</h3>
          {accounts.length === 0 ? (
            <EmptyState message="This customer has no accounts yet." />
          ) : (
            <AccountTable accounts={accounts} />
          )}
        </>
      )}
    </section>
  )
}
