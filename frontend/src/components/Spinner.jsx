// Shown while waiting for the backend. `message` has a default value if the parent sends none.
export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  )
}
