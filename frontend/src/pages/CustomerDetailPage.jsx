import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCustomerById, getCustomerAccounts } from '../services/customerService.js'
import { errorMessage } from '../services/api.js'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AccountTable from '../components/AccountTable.jsx'

// YOUR TODO: GetCustomerById + that customer's accounts (Customer <-> Accounts).
// Follow CustomersPage step by step. New here: useParams, and loading TWO things at once.
export default function CustomerDetailPage() {
  const { id } = useParams() // the :id part of the URL /customers/:id, e.g. "3"

  // TODO 1: four pieces of state: customer (null), accounts ([]), loading (true), error ('')

  // TODO 2: async function load() {
  //   loading on, error cleared
  //   try: ask for both at the same time and wait for both:
  //     const [c, a] = await Promise.all([getCustomerById(id), getCustomerAccounts(id)])
  //     then save both into state
  //   catch (err): setError(errorMessage(err))     <- a wrong id shows "Customer not found"
  //   finally: loading off
  // }

  // TODO 3: useEffect(() => { load() }, [id])     <- [id]: load again if the id in the URL changes

  // TODO 4: return, inside the <section> below, exactly one of:
  //   loading -> <Spinner message="Loading customer..." />
  //   error   -> <ErrorMessage message={error} onRetry={load} />
  //   else    -> <h2>{customer.name}</h2>, then ID and email,
  //              then <h3>Accounts</h3> and
  //              accounts.length === 0 ? <EmptyState message="This customer has no accounts yet." />
  //                                    : <AccountTable accounts={accounts} />
  return (
    <section>
      <Link to="/customers">← Back to customers</Link>
      <h2>Customer {id}</h2>
      <p className="todo">TODO: load and show this customer and their accounts.</p>
    </section>
  )
}
