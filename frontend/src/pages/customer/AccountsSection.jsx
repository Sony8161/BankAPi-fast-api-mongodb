import { useState } from 'react'
import ButtonSpinner from '../../components/ButtonSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import Sparkline from '../../components/Sparkline.jsx'
import { accountName, maskedAccount, maybeMoney } from '../../utils/format.js'
import { balanceHistory } from '../../utils/transactions.js'

// "Your accounts": one card per account with a balance line chart, a copy-number button,
// and a shortcut into the Move money form. "Open account" adds a checking or savings account.
export default function AccountsSection({ accounts, txns, hidden, onCopy, onMove, onOpen }) {
  const [choosing, setChoosing] = useState(false)
  const [opening, setOpening] = useState('')

  async function open(type) {
    setOpening(type)
    await onOpen(type)
    setOpening('')
    setChoosing(false)
  }

  return (
    <section id="accounts" className="section-block" aria-labelledby="acc-title">
      <div className="section-row">
        <h2 id="acc-title">Your accounts</h2>
        {choosing ? (
          <div className="inline-choice" role="group" aria-label="Kind of account to open">
            <span className="muted">Open a</span>
            <button type="button" className="btn btn-soft" onClick={() => open('CHECKING')} disabled={!!opening}>
              {opening === 'CHECKING' && <ButtonSpinner />}Checking
            </button>
            <button type="button" className="btn btn-soft" onClick={() => open('SAVINGS')} disabled={!!opening}>
              {opening === 'SAVINGS' && <ButtonSpinner />}Savings
            </button>
            <button type="button" className="icon-btn" onClick={() => setChoosing(false)} aria-label="Cancel"><Icon name="x" /></button>
          </div>
        ) : (
          <button type="button" className="btn btn-outline" onClick={() => setChoosing(true)}><Icon name="plus" size={16} />Open account</button>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="empty-box">You don't have an account yet. Open a checking or savings account to get started.</div>
      ) : (
        <div className="account-grid">
          {accounts.map((a) => {
            const points = balanceHistory(a, txns)
            const moves = points.length - 1
            return (
              <article key={a.id} className={`acct-card ${a.accountType === 'SAVINGS' ? 'savings' : 'checking'}`}>
                <div className="acct-head">
                  <span className="dot" aria-hidden="true" />
                  <strong>{accountName(a.accountType)}</strong>
                  <span className="mono muted">{maskedAccount(a.id)}</span>
                  <button type="button" className="icon-btn small" onClick={() => onCopy(a)}
                    aria-label={`Copy account number ${maskedAccount(a.id)}`} title="Copy account number">
                    <Icon name="copy" size={16} />
                  </button>
                </div>
                <div>
                  <div className="muted small">Available balance</div>
                  <div className="acct-balance">{maybeMoney(a.balance, hidden)}</div>
                </div>
                {hidden ? <div className="spark-hidden" aria-hidden="true" /> : (
                  <Sparkline points={points} label={`${accountName(a.accountType)} balance over the last ${moves} moves`} />
                )}
                <div className="acct-foot">
                  <span className="muted small">{moves === 0 ? 'No activity yet' : `Last ${moves} move${moves === 1 ? '' : 's'}`}</span>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => onMove(a)}>Move money</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
