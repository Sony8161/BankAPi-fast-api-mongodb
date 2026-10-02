import { maskedAccount } from './format.js'

// Turns one transaction into what a PERSON wants to read, from the point of view of
// whoever owns `ownIds` (a customer's account ids):
//   direction  +1 money came in, -1 money went out, 0 moved between their own accounts
//   text       "Sent to •••• 0003", "Deposit to •••• 0001", ...
//   icon       which arrow to draw
export function describe(txn, ownIds = new Set()) {
  const from = txn.fromAccountId
  const to = txn.toAccountId
  if (txn.type === 'DEPOSIT') return { direction: 1, icon: 'down', text: `Deposit to ${maskedAccount(to)}` }
  if (txn.type === 'WITHDRAW') return { direction: -1, icon: 'up', text: `Withdrawal from ${maskedAccount(from)}` }
  if (ownIds.has(from) && ownIds.has(to)) {
    return { direction: 0, icon: 'swap', text: `Between your accounts ${maskedAccount(from)} → ${maskedAccount(to)}` }
  }
  if (ownIds.has(from)) return { direction: -1, icon: 'swap', text: `Sent to ${maskedAccount(to)}` }
  if (ownIds.has(to)) return { direction: 1, icon: 'swap', text: `Received from ${maskedAccount(from)}` }
  return { direction: 0, icon: 'swap', text: `Transfer ${maskedAccount(from)} → ${maskedAccount(to)}` } // staff view
}

// Only you or the bank can move money OUT of (or deposit INTO) your accounts, so if someone else's
// name is on one of those, it was a teller. (Money SENT to you shows the sender's name instead.)
export function byStaff(t, ownIds, username) {
  if (!t.performedBy || t.performedBy === username) return false
  return t.type !== 'TRANSFER' || ownIds.has(t.fromAccountId)
}

export const TYPE_LABEL = { DEPOSIT: 'Deposit', WITHDRAW: 'Withdrawal', TRANSFER: 'Transfer' }

// The filter chips used above every activity list.
export const TYPE_CHIPS = [
  { value: 'ALL', label: 'All' },
  { value: 'DEPOSIT', label: 'Deposits' },
  { value: 'WITHDRAW', label: 'Withdrawals' },
  { value: 'TRANSFER', label: 'Transfers' },
]

// How much this transaction changed ONE account's balance (+ in, - out, 0 not involved).
export function effectOn(txn, accountId) {
  if (txn.toAccountId === accountId && txn.fromAccountId !== accountId) return txn.amount
  if (txn.fromAccountId === accountId && txn.toAccountId !== accountId) return -txn.amount
  return 0
}

// Rebuild an account's balance history from its transactions, for the little line chart.
// We only store the CURRENT balance, so walk backwards: before each move the balance was
// (balance after) - (what that move added). Returns oldest -> newest, ending at today's balance.
export function balanceHistory(account, txns, maxPoints = 12) {
  const mine = txns.filter((t) => effectOn(t, account.id) !== 0) // txns arrive newest first
  const points = [account.balance]
  let balance = account.balance
  for (const t of mine.slice(0, maxPoints - 1)) {
    balance -= effectOn(t, account.id)
    points.push(balance)
  }
  return points.reverse()
}

// Group a newest-first list by day: [{ label: 'Today', items: [...] }, ...]
export function groupByDay(txns, labelOf) {
  const groups = []
  for (const t of txns) {
    const label = labelOf(t.timestamp)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(t)
    else groups.push({ label, items: [t] })
  }
  return groups
}

// Labels + colours for the sign-in log
export const EVENT_INFO = {
  LOGIN_SUCCESS: { label: 'Signed in', tone: 'good' },
  LOGIN_FAILED: { label: 'Wrong password', tone: 'warn' },
  LOCKED_OUT: { label: 'Locked out', tone: 'bad' },
  LOGIN_BLOCKED: { label: 'Tried while locked', tone: 'bad' },
  REGISTERED: { label: 'Signed up', tone: 'info' },
  LOGIN_CREATED: { label: 'Login turned on', tone: 'info' },
  USERNAME_REMINDER: { label: 'Username reminder', tone: 'info' },
  PASSWORD_RESET_REQUESTED: { label: 'Reset link sent', tone: 'info' },
  PASSWORD_RESET: { label: 'Password reset', tone: 'good' },
  PASSWORD_CHANGED: { label: 'Password changed', tone: 'good' },
  SIGNED_OUT_EVERYWHERE: { label: 'Signed out everywhere', tone: 'info' },
  UNLOCKED: { label: 'Unlocked by staff', tone: 'good' },
  TEMP_PASSWORD_SET: { label: 'Temporary password', tone: 'warn' },
}

export const PROBLEM_EVENTS = new Set(['LOGIN_FAILED', 'LOCKED_OUT', 'LOGIN_BLOCKED'])

// Wrong passwords etc. since the sign-in BEFORE this one = things you haven't seen yet.
export function problemsSinceLastVisit(events) {
  const successes = events.map((e, i) => (e.type === 'LOGIN_SUCCESS' ? i : -1)).filter((i) => i >= 0)
  const end = successes.length > 1 ? successes[1] : events.length // events are newest first
  return events.slice(0, end).filter((e) => PROBLEM_EVENTS.has(e.type))
}
