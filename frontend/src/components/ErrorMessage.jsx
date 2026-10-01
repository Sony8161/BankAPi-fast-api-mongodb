// Shows what went wrong. `onRetry` is a FUNCTION passed down by the parent:
// clicking Retry calls it, which is how a CHILD talks back UP to its parent.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {/* only show the button if the parent gave us something to call */}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  )
}
