import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { auth } from '../stores/authStore.js'

export default observer(function SignupForm(){
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
      const res = await auth.signup({ name, email, password, age: Number(age)||undefined, bio })
      if (res?.error) setMessage(res.error)
      else { setMessage(''); nav('/discover') }
    } catch(err){ setMessage(err.message) }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-center text-xl font-bold">Create your LinkUp account</h2>
      <input className="rounded border p-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} required />
      <input className="rounded border p-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      <input className="rounded border p-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
      <input className="rounded border p-2" type="number" min="13" max="120" placeholder="Age (optional)" value={age} onChange={(e)=>setAge(e.target.value)} />
      <textarea className="min-h-[80px] rounded border p-2" placeholder="Why are you here?" value={bio} onChange={(e)=>setBio(e.target.value)} />
      <button disabled={auth.loading} className="rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-60">
        {auth.loading ? 'Signing up…' : 'Sign Up'}
      </button>
      <Link to="/login" className="text-center text-sm text-blue-600 underline">Already have an account? Log in</Link>
      {message && <p className="text-center text-red-500">{message}</p>}
    </form>
  )
})
