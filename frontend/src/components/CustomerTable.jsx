import CustomerRow from './CustomerRow.jsx'

// NESTING: CustomersPage -> CustomerTable -> CustomerRow (parent -> child -> grandchild).
// Data goes DOWN as props (customers); events come back UP through a function prop (onDelete).
// onDelete is optional: the search page shows the same table without delete buttons.
export default function CustomerTable({ customers, onDelete }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* map = one <CustomerRow> per customer. `key` lets React track each row */}
        {customers.map((customer) => (
          <CustomerRow key={customer.id} customer={customer} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  )
}
