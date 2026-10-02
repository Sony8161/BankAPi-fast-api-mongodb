import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { dayLabel, maybeMoney, shortTime } from '../../utils/format.js'
import { byStaff, describe, groupByDay, TYPE_CHIPS, TYPE_LABEL } from '../../utils/transactions.js'

const PAGE = 8 // rows shown at first; "Show more" adds 8 more

// Activity: search box + type chips, grouped by day. Clicking a row opens its receipt.
export default function ActivityCard({ txns, ownIds, username, hidden, search, onSearch, onOpen, onStatement }) {
  const [type, setType] = useState('ALL')
  const [shown, setShown] = useState(PAGE)

  const query = search.trim().toLowerCase()
  const filtered = txns.filter((t) => {
    if (type !== 'ALL' && t.type !== type) return false
    if (!query) return true
    const text = `${describe(t, ownIds).text} ${TYPE_LABEL[t.type]} ${t.amount} ${t.id}`.toLowerCase()
    return text.includes(query)
  })
  const groups = groupByDay(filtered.slice(0, shown), dayLabel)

  return (
    <section id="activity" className="card" aria-labelledby="act-title">
      <div className="section-row">
        <h2 id="act-title">Activity</h2>
        <button type="button" className="btn btn-outline btn-sm" onClick={onStatement} disabled={txns.length === 0}>
          <Icon name="download" size={16} />Statement (CSV)
        </button>
      </div>
      <div className="filter-row">
        <input type="search" placeholder="Search activity" aria-label="Search activity" value={search}
          onChange={(e) => { onSearch(e.target.value); setShown(PAGE) }} />
        <div className="chips" role="group" aria-label="Filter by type">
          {TYPE_CHIPS.map((c) => (
            <button key={c.value} type="button" className={`chip-btn ${type === c.value ? 'active' : ''}`}
              aria-pressed={type === c.value} onClick={() => { setType(c.value); setShown(PAGE) }}>{c.label}</button>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.label} className="day-group">
          <div className="day-label">{g.label}</div>
          {g.items.map((t) => {
            const d = describe(t, ownIds)
            const sign = d.direction > 0 ? '+' : d.direction < 0 ? '−' : ''
            return (
              <button key={t.id} type="button" className="txn-row" onClick={() => onOpen(t)}>
                <span className={`txn-icon ${d.direction > 0 ? 'in' : d.direction < 0 ? 'out' : 'move'}`}><Icon name={d.icon} size={18} strokeWidth={2.2} /></span>
                <span className="txn-text">
                  <strong>{d.text}</strong>
                  <small>{TYPE_LABEL[t.type]} · {shortTime(t.timestamp)}{byStaff(t, ownIds, username) ? ' · by bank staff' : ''}</small>
                </span>
                <span className={`txn-amount ${d.direction > 0 ? 'in' : ''}`}>{sign}{maybeMoney(t.amount, hidden)}</span>
              </button>
            )
          })}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="empty-box">{txns.length === 0 ? 'No transactions yet. Your deposits, withdrawals and transfers will show up here.' : 'No transactions match.'}</div>
      )}
      {filtered.length > shown && (
        <button type="button" className="btn btn-outline btn-block" onClick={() => setShown(shown + PAGE)}>
          Show more ({filtered.length - shown} left)
        </button>
      )}
    </section>
  )
}
