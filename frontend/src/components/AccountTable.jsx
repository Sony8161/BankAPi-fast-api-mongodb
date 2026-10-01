import { accountName, accountNumber, money } from '../utils/format.js'

// A "display" component: data comes in through props, it makes no API calls.
export default function AccountTable({ accounts }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Account #</th>
          <th>Type</th>
          <th className="num">Balance</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td className="mono">{accountNumber(account.id)}</td>
            <td>{accountName(account.accountType)}</td>
            <td className="num">{money(account.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
