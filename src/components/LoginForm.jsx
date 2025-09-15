import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { auth } from '../stores/authStore.js'

export default observer(function LoginForm(){
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
      const res = await auth.login(email, password)
      if (res?.error) setMessage(res.error)
      else { setMessage(''); nav('/') } 
    } catch(err){ setMessage(err.message) }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-center text-xl font-bold">Log in to LinkUp</h2>
      <input className="rounded border p-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      <input className="rounded border p-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
      <button disabled={auth.loading} className="rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
        {auth.loading ? 'Logging in…' : 'Login'}
      </button>
      <Link to="/signup" className="text-center text-sm text-blue-600 underline">Don’t have an account? Register Here</Link>
      {message && <p className="text-center text-red-500">{message}</p>}
    </form>
  )
})
