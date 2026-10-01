import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getCustomerAccounts } from '../../services/customerService.js'
import { transfer } from '../../services/accountService.js'
import { errorMessage } from '../../services/api.js'
import { accountName, accountNumber, maskedAccount, money } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Icon from '../../components/Icon.jsx'

export default function TransferPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [fromId, setFromId] = useState('')
  const [mode, setMode] = useState('own') // 'own' = between my accounts, 'other' = to someone else
  const [toOwnId, setToOwnId] = useState('')
  const [toNumber, setToNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [sending, setSending] = useState(false)

  async function load() {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getCustomerAccounts(user.customerId)
      setAccounts(data)
      if (data.length > 0 && fromId === '') setFromId(String(data[0].id))
    } catch (err) {
      setLoadError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const from = Number(fromId)
    const to = Number(mode === 'own' ? toOwnId : toNumber)
    const value = Number(amount)
    const source = accounts.find((a) => a.id === from)

    // Check in the browser first for quick feedback. The backend checks all of this again.
    if (!to) return setError('Choose where the money goes.')
    if (to === from) return setError('Pick two different accounts.')
    if (!(value > 0)) return setError('Enter an amount greater than $0.')
    if (source && value > source.balance) return setError(`Not enough money: ${maskedAccount(from)} has ${money(source.balance)}.`)

    setError('')
    setSending(true)
    try {
      const txn = await transfer(from, to, value) // POST /api/transfers
      setReceipt(txn)
      setAmount('')
      setAccounts(await getCustomerAccounts(user.customerId)) // fresh balances
    } catch (err) {
      setError(errorMessage(err)) // e.g. "Account not found", "Insufficient funds"
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Spinner message="Loading your accounts..." />
  if (loadError) return <ErrorMessage message={loadError} onRetry={load} />
  if (accounts.length === 0) return <EmptyState message="Open an account first, then you can move money." />

  const others = accounts.filter((a) => String(a.id) !== fromId)

  return (
    <div className="page">
      <div className="page-title"><h1>Transfer money</h1></div>
      <div className="split">
        <form className="panel transfer-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>From</span>
            <select value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountName(a.accountType)} {maskedAccount(a.id)} · {money(a.balance)}
                </option>
              ))}
            </select>
          </label>

          <div className="segmented" role="tablist">
            <button type="button" className={mode === 'own' ? 'active' : ''} onClick={() => setMode('own')}>My accounts</button>
            <button type="button" className={mode === 'other' ? 'active' : ''} onClick={() => setMode('other')}>Someone else</button>
          </div>

          {mode === 'own' ? (
            <label className="field">
              <span>To</span>
              <select value={toOwnId} onChange={(e) => setToOwnId(e.target.value)}>
                <option value="">Choose an account</option>
                {others.map((a) => (
                  <option key={a.id} value={a.id}>{accountName(a.accountType)} {maskedAccount(a.id)}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="field">
              <span>Recipient account number</span>
              <input inputMode="numeric" placeholder="e.g. 0003" value={toNumber} onChange={(e) => setToNumber(e.target.value)} />
            </label>
          )}

          <label className="field">
            <span>Amount</span>
            <div className="input-money">
              <span>$</span>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </label>

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send money'}
          </button>
        </form>

        <div className="panel">
          {receipt ? (
            <div className="receipt">
              <div className="receipt-icon"><Icon name="check" size={28} /></div>
              <h2>Transfer complete</h2>
              <strong className="receipt-amount">{money(receipt.amount)}</strong>
              <dl>
                <dt>From</dt><dd>{maskedAccount(receipt.fromAccountId)}</dd>
                <dt>To</dt><dd>{maskedAccount(receipt.toAccountId)}</dd>
                <dt>Reference</dt><dd>TX-{accountNumber(receipt.id)}</dd>
                <dt>When</dt><dd>{new Date(receipt.timestamp).toLocaleString()}</dd>
              </dl>
            </div>
          ) : (
            <div className="balances">
              <h3>Your balances</h3>
              {accounts.map((a) => (
                <div className="balance-row" key={a.id}>
                  <span>{accountName(a.accountType)} <small className="muted">{maskedAccount(a.id)}</small></span>
                  <strong>{money(a.balance)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
