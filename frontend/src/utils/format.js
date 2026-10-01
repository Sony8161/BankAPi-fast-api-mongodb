// Small display helpers used by many components.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export function money(amount) {
  return usd.format(amount ?? 0) // 1500 -> "$1,500.00"
}

// Account ids are small numbers; show them like a bank does: 3 -> "0003"
export function accountNumber(id) {
  return String(id).padStart(4, '0')
}
export function maskedAccount(id) {
  return `•••• ${accountNumber(id)}`
}

export function accountName(type) {
  return type === 'SAVINGS' ? 'Savings' : 'Checking'
}

export function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
export function shortTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// "Good morning" / "Good afternoon" / "Good evening"
export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function initials(text) {
  return (text ?? '?')
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
