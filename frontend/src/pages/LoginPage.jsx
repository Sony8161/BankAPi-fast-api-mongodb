import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { homeFor, useAuth } from '../auth/AuthContext.jsx'
import { errorMessage } from '../services/api.js'
import Icon from '../components/Icon.jsx'

export default function LoginPage() {
  const { user, notice, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Where to go after signing in: the page they tried to open, or their home page.
  const from = location.state?.from

  // Already signed in? Don't show the form again.
  if (user) return <Navigate to={from ?? homeFor(user)} replace />

    async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    // 1. Check the form before calling the backend
    if (username.trim() === '' || password === '') {
      setError('Enter your username and password.')
      return
    }

    // 2. Clear old errors and show "Signing in..."
    setError('')
    setSubmitting(true)

    // 3. Call the backend
    try {
      const signedIn = await login(username.trim(), password) // POST /api/auth/login
      navigate(from ?? homeFor(signedIn), { replace: true })  // admin -> /admin, customer -> /app
    } catch (err) {
      setError(errorMessage(err)) // e.g. "Invalid username or password"
      setSubmitting(false)        // turn the button back on so they can try again
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-side">
          <h2>Welcome back</h2>
          <p>Sign in to see your accounts, move money and check your activity.</p>
          <ul className="check-list">
            <li><Icon name="check" size={16} /> Passwords stored as bcrypt hashes</li>
            <li><Icon name="check" size={16} /> Signed JWT on every request</li>
            <li><Icon name="check" size={16} /> Customers only see their own accounts</li>
          </ul>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          {notice && <div className="alert alert-info">{notice}</div>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="auth-switch">New to Simple Bank? <Link to="/register">Open an account</Link></p>
          <p className="demo-hint">Demo logins: <code>admin / admin123</code> · <code>john / john123</code></p>
        </form>
      </div>
    </div>
  )
}
