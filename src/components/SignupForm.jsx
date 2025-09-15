import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { auth } from '../stores/authStore.js'

export default observer(function SignupForm(){
  const nav = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')            
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [message, setMessage] = useState('')

   function handlePhoto(e){
    const f = e.target.files?.[0] || null
    setPhotoFile(f)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    if (f) setPhotoPreview(URL.createObjectURL(f))
    else setPhotoPreview('')
  }
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // create FormData object
      const form = new FormData()
      form.append('name', fullName)
      form.append('email', email)
      form.append('password', password)

      
      // form.append('dob', new Date(dob).toISOString())
      form.append('dob', dob) 
      if (photoFile) form.append('avatar', photoFile) 

      const res = await auth.signup(form) 
      if (res?.error) setMessage(res.error)
      else { setMessage(''); nav('/') }
    } catch (err) {
      setMessage(err?.message || 'Signup failed')
    }
  }

   const canSubmit = fullName && email && password && dob && !auth.loading

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-center text-xl font-bold">Create your LinkUp account</h2>

      <input
        className="rounded border p-2"
        placeholder="Full name"
        value={fullName}
        onChange={(e)=>setFullName(e.target.value)}
        required
      />

      <input
        className="rounded border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
      />

      <input
        className="rounded border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
      />

       <input
        className="rounded border p-2"
        type="date"
        placeholder="Date of Birth"
        value={dob}
        onChange={(e)=>setDob(e.target.value)}
        required
      />

      <input
        className="rounded border p-2"
        type="file"
        accept="image/*"
        onChange={handlePhoto}
      />


      {photoPreview && (
        <img
          src={photoPreview}
          alt="preview"
          className="mx-auto h-16 w-16 rounded-full object-cover ring-1 ring-gray-200"
        />
      )}

      <button
        type="submit"
         className="rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
      >
        Sign Up
        {/* {auth.loading ? 'Signing up…' : 'Sign Up'} */}
      </button>

      <Link to="/login" className="text-center text-sm text-blue-600 underline">
        Already have an account? Log in
      </Link>

      {message && <p className="text-center text-red-500">{message}</p>}
    </form>
  )
})
