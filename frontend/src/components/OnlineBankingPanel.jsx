import { useEffect, useState } from 'react'
import { createLogin, listLogins } from '../services/authService.js'
import { errorMessage } from '../services/api.js'
import Icon from './Icon.jsx'

// Admin tool on the customer page: shows whether this customer can sign in,
// and lets staff turn on online banking (create their username + temporary password).
export default function OnlineBankingPanel({ customerId }) {
  const [login, setLogin] = useState(undefined) // undefined = still loading, null = none
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    listLogins()
      .then((logins) => setLogin(logins.find((l) => l.customerId === customerId) ?? null))
      .catch((err) => setError(errorMessage(err)))
  }, [customerId])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      setLogin(await createLogin(customerId, username.trim(), password))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3><Icon name="lock" /> Online banking</h3>
        {login && <span className="badge badge-on">On</span>}
        {login === null && <span className="badge badge-off">Off</span>}
      </div>
      {login && <p className="muted">Signs in as <strong>{login.username}</strong>.</p>}
      {login === null && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Temporary password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary" type="submit">Turn on</button>
        </form>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
