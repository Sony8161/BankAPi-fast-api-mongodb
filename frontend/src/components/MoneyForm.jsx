import { useState } from 'react'

// Deposit / withdraw form. The parent does the API call in onSubmit(kind, amount)
// and returns true when it worked, so the form knows to clear itself.
export default function MoneyForm({ onSubmit }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(kind) {
    const value = Number(amount)
    if (!(value > 0)) {
      setError('Enter an amount greater than $0.')
      return
    }
    setError('')
    setBusy(true)
    const ok = await onSubmit(kind, value)
    setBusy(false)
    if (ok) setAmount('')
  }

  return (
    <form className="money-form" onSubmit={(e) => { e.preventDefault(); submit('deposit') }}>
      <label className="field">
        <span>Amount</span>
        <div className="input-money">
          <span>$</span>
          <input type="number" min="0" step="0.01" placeholder="0.00" value={amount}
            onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
        </div>
      </label>
      <div className="money-actions">
        <button className="btn btn-primary" type="button" disabled={busy} onClick={() => submit('deposit')}>Deposit</button>
        <button className="btn btn-outline" type="button" disabled={busy} onClick={() => submit('withdraw')}>Withdraw</button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </form>
  )
}
