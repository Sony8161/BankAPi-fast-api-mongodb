import { useEffect, useRef, useState } from 'react'
import { deposit, transfer, withdraw } from '../services/accountService.js'
import { errorMessage } from '../services/api.js'
import { accountName, maskedAccount, maybeMoney, money } from '../utils/format.js'
import { amountError } from '../utils/money.js'
import ButtonSpinner from './ButtonSpinner.jsx'

const MODES = [
  { value: 'deposit', label: 'Deposit', verb: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw', verb: 'Withdrawal' },
  { value: 'transfer', label: 'Transfer', verb: 'Transfer' },
]
export const CONFIRM_OVER = 1000 // big amounts need "CONFIRM" typed in, so a slip of the finger can't send $5,000

// Deposit / withdraw / transfer, in two steps: fill in -> REVIEW -> confirm.
// The same form is used by customers (on their home page) and by staff (the teller box in a
// customer's drawer), so everything it needs comes in as props:
//   accounts   the accounts money can come from / go to
//   request    { mode, amount, accountId, key }: the quick buttons and Ctrl+K "deposit 50" fill the form
//              by sending a new request (a new key = "start again with these values")
//   hidden     the eye button: show •••••• instead of balances
//   teller     staff mode: the button says who is doing it
//   onDone(text)  after a success, with a sentence for the toast
export default function MoveMoneyForm({ accounts, request, hidden = false, teller = false, onDone, onStepChange }) {
  const [mode, setMode] = useState('deposit')
  const [accountId, setAccountId] = useState(accounts[0]?.id)
  const [toChoice, setToChoice] = useState('') // an account id, or 'other' for "someone else"
  const [toNumber, setToNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('form') // 'form' -> 'review'
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const amountRef = useRef(null)

  // A quick button or the palette asked for a fresh form: copy its values in and focus the amount.
  useEffect(() => {
    if (!request) return
    setMode(request.mode ?? 'deposit')
    if (request.accountId) setAccountId(request.accountId)
    setAmount(request.amount ? String(request.amount) : '')
    setStep('form')
    setError('')
    setConfirmText('')
    setTimeout(() => amountRef.current?.focus(), 0)
  }, [request])

  // keep a valid selection when accounts are added or removed
  useEffect(() => {
    if (!accounts.some((a) => a.id === accountId)) setAccountId(accounts[0]?.id)
  }, [accounts, accountId])

  useEffect(() => onStepChange?.(step), [step, onStepChange])

  const source = accounts.find((a) => a.id === accountId)
  const others = accounts.filter((a) => a.id !== accountId)
  const choice = toChoice && (toChoice === 'other' || others.some((a) => String(a.id) === toChoice)) ? toChoice : others[0] ? String(others[0].id) : 'other'
  const toId = choice === 'other' ? Number(toNumber) : Number(choice)
  const modeInfo = MODES.find((m) => m.value === mode)
  const value = Number(amount)

  function pickMode(next) {
    setMode(next)
    setStep('form')
    setError('')
  }

  // Step 1 -> 2: check everything in the browser first (instant feedback). The backend checks it all again.
  function review(event) {
    event.preventDefault()
    if (!source) return setError('Open an account first.')
    const problem = amountError(amount.trim(), { max: mode === 'deposit' ? undefined : source.balance })
    if (problem) return setError(problem)
    if (mode === 'transfer') {
      if (!toId || !Number.isInteger(toId)) return setError('Enter the account number the money goes to.')
      if (toId === source.id) return setError('Pick two different accounts.')
    }
    setError('')
    setConfirmText('')
    setStep('review')
  }

  // Step 2: send it.
  async function confirm() {
    setBusy(true)
    setError('')
    try {
      if (mode === 'deposit') await deposit(source.id, value)
      if (mode === 'withdraw') await withdraw(source.id, value)
      if (mode === 'transfer') await transfer(source.id, toId, value)
      const sentence = {
        deposit: `Deposited ${money(value)} to ${maskedAccount(source.id)}`,
        withdraw: `Withdrew ${money(value)} from ${maskedAccount(source.id)}`,
        transfer: `Sent ${money(value)} from ${maskedAccount(source.id)} to ${maskedAccount(toId)}`,
      }[mode]
      setAmount('')
      setToNumber('')
      setStep('form')
      onDone?.(sentence)
    } catch (err) {
      setError(errorMessage(err)) // e.g. "Insufficient funds", "Account not found"
      setStep('form')
    } finally {
      setBusy(false)
    }
  }

  if (accounts.length === 0) {
    return <div className="empty-box">No accounts yet. Open one to start moving money.</div>
  }

  if (step === 'review') {
    const needsConfirm = value > CONFIRM_OVER
    const after = mode === 'deposit' ? source.balance + value : source.balance - value
    const toLabel = choice === 'other' ? maskedAccount(toId) : `${accountName(accounts.find((a) => a.id === toId)?.accountType)} ${maskedAccount(toId)}`
    const rows = [
      [mode === 'deposit' ? 'Into' : 'From', `${accountName(source.accountType)} ${maskedAccount(source.id)}`],
      ...(mode === 'transfer' ? [['To', toLabel]] : []),
      [`Balance after`, maybeMoney(after, hidden)],
      ['When', 'Right away'],
      ...(teller ? [['Done by', 'Staff (you), recorded in the audit log']] : []),
    ]
    return (
      <div className="mm-review">
        <div className="mm-review-amount">
          <span>{modeInfo.verb}</span>
          <strong>{money(value)}</strong>
        </div>
        <dl className="rows">
          {rows.map(([label, text]) => (
            <div key={label}><dt>{label}</dt><dd>{text}</dd></div>
          ))}
        </dl>
        {needsConfirm && (
          <label className="confirm-box">
            <span>This is over {money(CONFIRM_OVER)}. Type CONFIRM to send it.</span>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="CONFIRM"
              aria-label="Type CONFIRM" autoComplete="off" autoFocus />
          </label>
        )}
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="two-buttons">
          <button type="button" className="btn btn-outline" onClick={() => setStep('form')} disabled={busy}>Back</button>
          <button type="button" className="btn btn-primary" onClick={confirm}
            disabled={busy || (needsConfirm && confirmText.trim().toUpperCase() !== 'CONFIRM')}>
            {busy && <ButtonSpinner />}
            {busy ? 'Sending...' : `Confirm ${modeInfo.label.toLowerCase()}`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="mm-form" onSubmit={review} noValidate>
      <div className="segmented three" role="tablist" aria-label="Kind of money move">
        {MODES.map((m) => (
          <button key={m.value} type="button" role="tab" aria-selected={mode === m.value}
            className={mode === m.value ? 'active' : ''} onClick={() => pickMode(m.value)}>{m.label}</button>
        ))}
      </div>

      <fieldset className="chip-group">
        <legend>{mode === 'deposit' ? 'Into' : 'From'}</legend>
        <div className="acct-chips">
          {accounts.map((a) => (
            <button key={a.id} type="button" className={`acct-chip ${a.id === accountId ? 'selected' : ''}`}
              aria-pressed={a.id === accountId} onClick={() => setAccountId(a.id)}>
              <strong>{accountName(a.accountType)} {maskedAccount(a.id)}</strong>
              <span>{maybeMoney(a.balance, hidden)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'transfer' && (
        <fieldset className="chip-group">
          <legend>To</legend>
          <div className="acct-chips">
            {others.map((a) => (
              <button key={a.id} type="button" className={`acct-chip ${choice === String(a.id) ? 'selected' : ''}`}
                aria-pressed={choice === String(a.id)} onClick={() => setToChoice(String(a.id))}>
                <strong>{accountName(a.accountType)} {maskedAccount(a.id)}</strong>
                <span>{teller ? 'Same customer' : 'Your account'}</span>
              </button>
            ))}
            <button type="button" className={`acct-chip ${choice === 'other' ? 'selected' : ''}`}
              aria-pressed={choice === 'other'} onClick={() => setToChoice('other')}>
              <strong>{teller ? 'Another account' : 'Someone else'}</strong>
              <span>By account number</span>
            </button>
          </div>
          {choice === 'other' && (
            <label className="field">
              <span>Recipient account number</span>
              <input inputMode="numeric" placeholder="e.g. 0003" value={toNumber}
                onChange={(e) => setToNumber(e.target.value.replace(/\D/g, ''))} />
            </label>
          )}
        </fieldset>
      )}

      <div className="field">
        <label htmlFor={teller ? 'teller-amount' : 'mm-amount'}>Amount</label>
        <div className="input-money">
          <span>$</span>
          <input id={teller ? 'teller-amount' : 'mm-amount'} ref={amountRef} inputMode="decimal" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)} autoComplete="off" />
        </div>
        {source && mode !== 'deposit' && <small className="muted">Available: {maybeMoney(source.balance, hidden)}</small>}
        {value > CONFIRM_OVER && <small className="warn-text">Over {money(CONFIRM_OVER)}: you'll be asked to type CONFIRM.</small>}
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block">Review {modeInfo.label.toLowerCase()}</button>
    </form>
  )
}
