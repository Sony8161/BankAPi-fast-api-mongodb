import { useState } from 'react'

// YOUR TODO: CHILD -> PARENT with props.
// This form owns what the user is typing. On submit it hands the new customer UP to the
// parent by calling onCreate(...), the function the parent (CustomersPage) passed down.
// onCreate returns true if the customer was saved, false if the backend refused it.
export default function CustomerForm({ onCreate }) {
  // TODO 1: one piece of state per input:
  //   const [name, setName] = useState('')
  //   const [email, setEmail] = useState('')
  // TODO 2: const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    // TODO 3: if name.trim() or email.trim() is empty -> setFormError('Name and email are required.') and return
    // TODO 4: setFormError('') then
    //   const saved = await onCreate({ name: name.trim(), email: email.trim() })
    // TODO 5: if (saved) clear both inputs: setName('') and setEmail('')
  }

  return (
    <form className="form form-inline" onSubmit={handleSubmit}>
      <h3>Add a customer</h3>
      {/* TODO 6: connect each input to its state so React controls it:
            value={name} onChange={(e) => setName(e.target.value)}            */}
      <input placeholder="Name" />
      <input placeholder="Email" type="email" />
      <button type="submit">Add customer</button>
      {/* TODO 7: show the message when there is one:
            {formError && <span className="field-error">{formError}</span>}   */}
    </form>
  )
}
