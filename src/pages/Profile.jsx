// src/pages/Profile.jsx
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { auth } from '../stores/authStore.js'
import { getMyProfile, updateMyProfile } from '../api/server.js'

// Fixed list of goals (keys saved in DB as 'goals')
const GOALS = [
  { key: 'dating',            label: 'Dating' },
  { key: 'sports',            label: 'Sports' },
  { key: 'language_practice', label: 'Language Learning' },
  { key: 'studies',           label: 'Studies' },
  { key: 'hangout',           label: 'Hangout' },
]

export default observer(function Profile(){
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')


  const [fullName, setFullName] = useState(auth.user?.fullName || auth.user?.full_name || '')
  const [email, setEmail]       = useState(auth.user?.email || '')
  const [photoUrl, setPhotoUrl] = useState(auth.user?.photoUrl || '')
  const [bio, setBio]           = useState(auth.user?.bio || '')
  // Start editing bio if empty
  const [editingBio, setEditingBio] = useState(!(auth.user?.bio?.trim()))
  const [goals, setGoals]       = useState(Array.isArray(auth.user?.goals) ? auth.user.goals : [])


  const [isSaving, setIsSaving]     = useState(false) 
  const [savingBio, setSavingBio]   = useState(false) 

  // Load profile 
  useEffect(() => {
    let alive = true
    ;(async () => {
      try{
        const data = await getMyProfile()
        if (!alive) return
        setFullName(data.fullName || data.full_name || '')
        setEmail(data.email || '')
        setPhotoUrl(data.photoUrl || '')
        setBio(data.bio || '')
        setEditingBio(!(data.bio && data.bio.trim()))
        setGoals(Array.isArray(data.goals) ? data.goals : [])
        auth.setUser(data)
      } catch(e){
        setError(e?.message || 'Failed to load profile')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

    // Save bio (inline, when empty)
  async function saveBioInline(){
    if (savingBio || !bio.trim()) return
    setSavingBio(true); setError('')
    try{
    // PUT /user/profile { bio }
      const updated = await updateMyProfile({ bio })
      setBio(updated.bio || '')
      auth.setUser(updated)
      setEditingBio(false) 
    } catch(e){
      setError(e?.message || 'Failed to save bio')
    } finally {
      setSavingBio(false)
    }
  }

  // Toggle a goal and SAVE 
  async function toggleGoal(key){
    if (isSaving) return            
    setIsSaving(true); setError('')
    const prev = goals
    const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    setGoals(next)                
    // PUT /user/profile { goals }
    try{
      const updated = await updateMyProfile({ goals: next })
      setGoals(Array.isArray(updated?.goals) ? updated.goals : next)
      auth.setUser(updated)
    } catch(e){
        // rollback on error
      setGoals(prev)                
      setError(e?.message || 'Failed to update goals')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="py-10 text-center">Loading profile…</div>

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-0 space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <img
            src={photoUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover ring-1 ring-black/10"
          />
          <div>
            <h1 className="text-4xl font-extrabold">{fullName}</h1>
            <p className="text-slate-600">{email}</p>
          </div>
        </div>
      </div>

      {/* Bio section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-lg font-semibold">Bio</h2>

        {(!editingBio && bio?.trim())
            ? <p className="whitespace-pre-wrap text-slate-700">{bio}</p>
            : (
            <div className="space-y-3">
                <p className="text-slate-600">No bio yet. Tell others about yourself:</p>
                <textarea
                className="w-full min-h-28 rounded border p-2"
                value={bio}
                onChange={e=>setBio(e.target.value)}
                placeholder="Write something about yourself…"
                />
                <button
                onClick={saveBioInline}
                disabled={savingBio || !bio.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                {savingBio ? 'Saving…' : 'Save bio'}
                </button>
            </div>
            )
        }
      </div>

        {/* Goals */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-3 text-lg font-semibold">Your goals</h2>
            <div className="flex flex-wrap gap-2">
                {GOALS.map(g => {
                const active = goals.includes(g.key)
                return (
                    <button
                    key={g.key}
                    type="button"
                    onClick={() => toggleGoal(g.key)}
                    className={`rounded-full border px-3 py-1 text-sm transition
                        ${active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}
                        focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                    title={g.key}
                    >
                    {g.label}
                    </button>
                )
                })}
            </div>

            {isSaving && <div className="mt-3 text-sm text-slate-500">Saving your goals…</div>}
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

    </div>
  )
})
