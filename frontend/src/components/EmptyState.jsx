// What to show when a list has 0 items, instead of an empty table.
// `children` = whatever the parent puts between <EmptyState> and </EmptyState>.
export default function EmptyState({ message, children }) {
  return (
    <div className="empty">
      <p>{message}</p>
      {children}
    </div>
  )
}
