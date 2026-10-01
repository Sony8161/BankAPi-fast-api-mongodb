import { useState } from 'react'

import PropTypes from 'prop-types'

export default function CustomerForm({ onCreate }) {
  CustomerForm.propTypes = {
    onCreate: PropTypes.func.isRequired,
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (name.trim() === '' || email.trim() === '') {
      setFormError('Name and email are required.')
      return
    }
    setFormError('')
    const saved = await onCreate({ name: name.trim(), email: email.trim() })
    if (saved) {
      setName('')
      setEmail('')
    }
    setFormError('')

    return saved
    
  }

  return (
    <form className="form form-inline" onSubmit={handleSubmit}>
      <h3>Add a customer</h3>
      {/* TODO 6: connect each input to its state so React controls it:
            value={name} onChange={(e) => setName(e.target.value)}            */}
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Add customer</button>
      
      {formError && <span className="field-error">{formError}</span>}
    </form>
  )
}
