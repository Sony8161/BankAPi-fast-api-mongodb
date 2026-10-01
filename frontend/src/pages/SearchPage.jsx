import { useState } from 'react'
import { searchCustomersByName, getPremiumCustomers } from '../services/customerService.js'
import { errorMessage } from '../services/api.js'
import CustomerTable from '../components/CustomerTable.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'

// YOUR TODO: one search and one filter. Do the backend TODO routes first:
//   GET /api/customers/search?name=jo      and      GET /api/customers/premium?threshold=1000
// Unlike CustomersPage, nothing loads when the page opens; it loads when a form is submitted.
export default function SearchPage() {
  const [name, setName] = useState('')
  const [threshold, setThreshold] = useState('1000')

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')


async function run(newLabel, request) {
  setLoading(true)
  setError('')
  setLabel(newLabel)
  try {
    setResults(await request())
  } catch (err) {
    setError(errorMessage(err))
  } finally {
    setLoading(false)
  }
} 



  function handleNameSearch(event) {
    event.preventDefault()
    if (name.trim() === '') return
    run(`Name starts with "${name.trim()}"`, () => searchCustomersByName(name.trim()))
  }

  function handlePremium(event) {
    event.preventDefault()
    run(`Customers with an account of $${threshold} or more`,
        () => getPremiumCustomers(Number(threshold)))
  }

  return (
    <section>
      <h2>Search customers</h2>
      <div className="filters">
        <form className="form" onSubmit={handleNameSearch}>
          <h3>Find by name</h3>
          <input placeholder="e.g. jo" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <form className="form" onSubmit={handlePremium}>
          <h3>Premium customers</h3>
          <label>
            Min balance $
            <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </label>
          <button type="submit">Filter</button>
        </form>
      </div>

      {
        loading && <Spinner message="Searching..." />
      }
      {
        error && <ErrorMessage message={error} />
      }
      {
        results === null ? null : results.length === 0 ? (
          <EmptyState message="No customers match." />
        ) : (
          <>
            <h3>{label}</h3>
            <CustomerTable customers={results} />
          </>
        )
      }
    </section>
  )
}
