import { useEffect, useState } from 'react'
import { getAllCustomers, createCustomer, deleteCustomer } from '../services/customerService.js'
import { errorMessage } from '../services/api.js'
import CustomerForm from '../components/CustomerForm.jsx'
import CustomerTable from '../components/CustomerTable.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'

// THE EXAMPLE PAGE: copy this pattern for every page that loads data.
//   1. state for the data, for "loading", and for an error message
//   2. a load function: loading on -> call the service -> save data OR save error -> loading off
//   3. useEffect runs the load once when the page opens
//   4. draw exactly one of: spinner / error / empty message / the data
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]) // the list from the API
  const [loading, setLoading] = useState(true) // true while waiting for the backend
  const [error, setError] = useState('') // '' means no error
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text } after add/delete

  async function loadCustomers() {
    setLoading(true)
    setError('')
    try {
      const data = await getAllCustomers() // GET /api/customers
      setCustomers(data)
    } catch (err) {
      setError(errorMessage(err)) // e.g. "Cannot reach the server..."
    } finally {
      setLoading(false) // runs whether it worked or failed
    }
  }

  // [] at the end = run once, when the page first appears (not on every redraw)
  useEffect(() => {
    loadCustomers()
  }, [])

  // CHILD -> PARENT: CustomerForm calls this with { name, email }.
  // Returns true/false so the form knows whether to clear its inputs.
  async function handleCreate(newCustomer) {
    try {
      const created = await createCustomer(newCustomer) // POST /api/customers
      setCustomers((current) => [...current, created]) // add it without reloading the list
      setNotice({ type: 'success', text: `Added ${created.name} (ID ${created.id}).` })
      return true
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) })
      return false
    }
  }

  // CHILD -> PARENT: CustomerRow calls this when its Delete button is clicked.
  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name} and all their accounts?`)) return
    try {
      await deleteCustomer(customer.id) // DELETE /api/customers/{id}
      setCustomers((current) => current.filter((c) => c.id !== customer.id))
      setNotice({ type: 'success', text: `Deleted ${customer.name}.` })
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) })
    }
  }

  // Exactly one of these four goes on screen.
  let body
  if (loading) {
    body = <Spinner message="Loading customers..." />
  } else if (error) {
    body = <ErrorMessage message={error} onRetry={loadCustomers} />
  } else if (customers.length === 0) {
    body = <EmptyState message="No customers yet. Add the first one above." />
  } else {
    body = <CustomerTable customers={customers} onDelete={handleDelete} />
  }

  return (
    <section>
      <div className="page-head">
        <h2>Customers</h2>
        {!loading && !error && <span className="count">{customers.length} total</span>}
      </div>

      {/* passing a FUNCTION down as a prop: the child will call it */}
      <CustomerForm onCreate={handleCreate} />

      {notice && <div className={`alert alert-${notice.type}`}>{notice.text}</div>}

      {body}
    </section>
  )
}
