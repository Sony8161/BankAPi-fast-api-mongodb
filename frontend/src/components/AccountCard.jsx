import { Link } from 'react-router-dom'
import { accountName, maskedAccount, money } from '../utils/format.js'

// One account tile on the customer's overview. Clicking it opens the account page.
export default function AccountCard({ account }) {
  return (
    <Link to={`/app/accounts/${account.id}`} className={`account-card account-${account.accountType.toLowerCase()}`}>
      <div className="account-card-top">
        <span className="account-type">{accountName(account.accountType)}</span>
        <span className="account-no">{maskedAccount(account.id)}</span>
      </div>
      <span className="account-label">Available balance</span>
      <strong className="account-balance">{money(account.balance)}</strong>
    </Link>
  )
}
