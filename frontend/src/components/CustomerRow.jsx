import { Link } from 'react-router-dom'

// GRANDCHILD: draws one row. It does NOT delete anything itself.
// It calls onDelete(customer) and lets the page (which owns the data) decide what happens.
export default function CustomerRow({ customer, onDelete }) {
  return (
    <tr>
      <td>{customer.id}</td>
      <td>{customer.name}</td>
      <td>{customer.email}</td>
      <td>
        <div className="actions">
          <Link to={`/admin/customers/${customer.id}`}>View</Link>
          {onDelete && (
            <button className="danger" onClick={() => onDelete(customer)}>
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
