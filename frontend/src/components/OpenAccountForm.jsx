import { useState } from 'react'

// Child form: the parent decides what "open" means (whose account, what to reload) via onOpen.
export default function OpenAccountForm({ onOpen }) {
  const [type, setType] = useState('CHECKING')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    await onOpen(type)
    setBusy(false)
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Account type">
        <option value="CHECKING">Checking</option>
        <option value="SAVINGS">Savings</option>
      </select>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Opening...' : 'Open account'}
      </button>
    </form>
  )
}
