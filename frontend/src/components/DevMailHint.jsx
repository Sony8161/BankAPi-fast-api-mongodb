import Icon from './Icon.jsx'

// This project has no real email server: backend/mailer.py PRINTS each email in the terminal
// that runs uvicorn. A real bank would plug in an email service (SendGrid, Amazon SES...) there.
export default function DevMailHint() {
  return (
    <p className="dev-hint">
      <Icon name="mail" size={16} />
      <span><strong>Demo:</strong> no email is really sent. Look in the <strong>backend terminal</strong> (where uvicorn runs) for a box marked EMAIL.</span>
    </p>
  )
}
