// A "display" component: data comes in through props, it makes no API calls.
// Intl.NumberFormat turns 1500 into "$1,500.00".
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function AccountTable({ accounts }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Account ID</th>
          <th>Type</th>
          <th className="num">Balance</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>{account.id}</td>
            <td>{account.accountType}</td>
            <td className="num">{money.format(account.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
