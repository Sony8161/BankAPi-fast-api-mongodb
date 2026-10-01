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

  // TODO 1: state: results (null = "nothing searched yet"), loading (false), error (''),
  //         and label ('') to say what was searched, e.g. Name starts with "jo"

  // TODO 2: one helper that both forms use:
  // async function run(newLabel, request) {
  //   loading on, error cleared, setLabel(newLabel)
  //   try { setResults(await request()) }
  //   catch (err) { setError(errorMessage(err)) }
  //   finally { loading off }
  // }

  function handleNameSearch(event) {
    event.preventDefault()
    // TODO 3: if name.trim() is empty, stop (return). Otherwise:
    //   run(`Name starts with "${name.trim()}"`, () => searchCustomersByName(name.trim()))
  }

  function handlePremium(event) {
    event.preventDefault()
    // TODO 4: run(`Customers with an account of $${threshold} or more`,
    //             () => getPremiumCustomers(Number(threshold)))
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

      {/* TODO 5: draw exactly one of:
            loading                -> <Spinner message="Searching..." />
            error                  -> <ErrorMessage message={error} />
            results === null       -> nothing yet (no search has run)
            results.length === 0   -> <EmptyState message="No customers match." />
            else                   -> <h3>{label}</h3> and <CustomerTable customers={results} />
                                      (no onDelete prop = the rows have no delete button)  */}
      <p className="todo">TODO: show the results here.</p>
    </section>
  )
}
