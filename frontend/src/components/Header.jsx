import { NavLink } from 'react-router-dom'

// CHILD of App. It receives `title` as a PROP (data passed down from the parent).
// The { title } in the brackets "destructures" props: it is the same as props.title.
export default function Header({ title }) {
  return (
    <header className="header">
      <h1 className="logo">{title}</h1>
      <nav className="nav">
        {/* NavLink = a link that also knows when its page is open (adds class "active") */}
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/search">Search</NavLink>
      </nav>
    </header>
  )
}
