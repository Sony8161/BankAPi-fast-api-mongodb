// One number on a dashboard. `tone` picks an accent colour.
export default function StatCard({ label, value, hint, tone = 'blue' }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}
