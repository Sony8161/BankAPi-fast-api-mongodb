import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icon.jsx'
import Footer from '../components/Footer.jsx'
import { initials } from '../utils/format.js'

// The sidebar menu depends on WHO is signed in. Same layout, different data.
const MENUS = {
  CUSTOMER: [
    { to: '/app', label: 'Overview', icon: 'home', end: true },
    { to: '/app/transfer', label: 'Transfer', icon: 'swap' },
    { to: '/app/activity', label: 'Activity', icon: 'list' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
    { to: '/admin/customers', label: 'Customers', icon: 'users' },
    { to: '/admin/search', label: 'Search', icon: 'search' },
    { to: '/admin/audit', label: 'Audit log', icon: 'shield' },
  ],
}

// Layout for signed-in pages: sidebar on the left, the current page (<Outlet />) on the right.
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user.role === 'ADMIN'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo to={isAdmin ? '/admin' : '/app'} light />
          <span className="portal-tag">{isAdmin ? 'Staff portal' : 'Online banking'}</span>
        </div>
        <nav className="side-nav">
          {MENUS[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-user">
          <div className="avatar">{initials(user.username)}</div>
          <div className="side-user-text">
            <strong>{user.username}</strong>
            <small>{isAdmin ? 'Administrator' : 'Customer'}</small>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      <div className="shell-main">
        <main className="shell-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
