import { maskedAccount, money, shortDate, shortTime } from '../utils/format.js'

const TYPE_LABEL = { DEPOSIT: 'Deposit', WITHDRAW: 'Withdrawal', TRANSFER: 'Transfer' }

function describe(t) {
  if (t.type === 'DEPOSIT') return `Deposit to ${maskedAccount(t.toAccountId)}`
  if (t.type === 'WITHDRAW') return `Withdrawal from ${maskedAccount(t.fromAccountId)}`
  return `Transfer ${maskedAccount(t.fromAccountId)} → ${maskedAccount(t.toAccountId)}`
}

// +1 money came in, -1 money went out, 0 neutral (admin view, or between your own accounts)
function direction(t, myAccountIds) {
  if (!myAccountIds) return 0
  const out = t.fromAccountId != null && myAccountIds.has(t.fromAccountId)
  const into = t.toAccountId != null && myAccountIds.has(t.toAccountId)
  if (out && into) return 0
  return into ? 1 : -1
}

// Display component: props in, table out.
//   myAccountIds (optional Set): whose point of view, so amounts show as +$ or -$
//   showCustomer (optional): adds a Customer column for the admin screens
export default function TransactionTable({ transactions, myAccountIds, showCustomer = false }) {
  return (
    <table className="table txn-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Type</th>
          {showCustomer && <th>Customer</th>}
          <th className="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => {
          const dir = direction(t, myAccountIds)
          const sign = dir > 0 ? '+' : dir < 0 ? '−' : ''
          return (
            <tr key={t.id}>
              <td>
                <span className="txn-date">{shortDate(t.timestamp)}</span>
                <small className="muted">{shortTime(t.timestamp)}</small>
              </td>
              <td>{describe(t)}</td>
              <td><span className={`badge badge-${t.type.toLowerCase()}`}>{TYPE_LABEL[t.type]}</span></td>
              {showCustomer && <td>#{t.customerId}</td>}
              <td className={`num amount ${dir > 0 ? 'amt-in' : dir < 0 ? 'amt-out' : ''}`}>
                {sign}{money(t.amount)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
