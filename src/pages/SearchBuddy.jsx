// src/pages/SearchBuddy.jsx
import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { discoverProfiles } from '../api/server.js'
import { useNavigate } from 'react-router-dom'

// same constants as in Profile
const GOALS = [
  { key: 'dating',            label: 'Dating' },
  { key: 'sports',            label: 'Sports' },
  { key: 'language_practice', label: 'Language Learning' },
  { key: 'studies',           label: 'Studies' },
  { key: 'hangout',           label: 'Hangout' },
]

export default observer(function SearchBuddy(){
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)  
  const [list, setList] = useState([])           
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loc, setLoc] = useState(null) 


  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} 
    )
  }, [])

  // fetch people on goal change
  useEffect(() => {
    if (!selected) { setList([]); return }
    let alive = true
    ;(async () => {
      setLoading(true); setError('')
      try{
        const res = await discoverProfiles({
          goal: selected,
          lat: loc?.lat, lng: loc?.lng,
          radiusKm: 10,
        })
        if (!alive) return
        setList(Array.isArray(res) ? res : [])
      } catch(e){
        if (!alive) return
        setError(e?.message || 'Failed to search')
        setList([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [selected, loc?.lat, loc?.lng])

    // Handlers for actions
    const onPass = async (u) => {
    const prev = list
    setList(p => p.filter(x => x.id !== u.id))
    try {
        await decideOnUser({ targetId: u.id, decision: 'pass', goal: selected })
    } catch (e) {
        setList(prev) 
    }
    }

    const onMatch = async (u) => {
    const prev = list
    setList(p => p.filter(x => x.id !== u.id))
    try {
        const res = await decideOnUser({ targetId: u.id, decision: 'match', goal: selected })
    } catch (e) {
        setList(prev)
    }
    }

  const onViewProfile = (u) => {
    // const onViewProfile = (u) => nav(`/users/${u.id}`)
  }

  const title = useMemo(() => {
    if (!selected) return 'Pick a goal to discover people'
    const label = GOALS.find(g => g.key === selected)?.label || selected
    return `People near you for: ${label}`
  }, [selected])

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-0 space-y-6">
      {/* Goal filter bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center gap-2">
          {GOALS.map(g => {
            const active = selected === g.key
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setSelected(g.key)}
                className={`rounded-full border px-3 py-1 text-sm transition
                  ${active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}
                  focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              >
                {g.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results header */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="text-sm text-slate-500">
            {loc ? 'within ~10 km' : 'location off'}
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading && <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-black/5">Loading…</div>}
        {!loading && !error && selected && list.length === 0 && (
          <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-black/5">No people found.</div>
        )}
        {!loading && error && (
          <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-red-200 text-red-700">{error}</div>
        )}

        {list.map(u => (
          <article key={u.id} className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-slate-100">
              <img src={u.photoUrl} alt={u.fullName} className="h-full w-full object-cover" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-semibold">{u.fullName}</h3>
                {u.age != null && <span className="text-slate-600">· {u.age}</span>}
                {typeof u.distanceKm === 'number' && <span className="ml-auto text-sm text-slate-500">{u.distanceKm} km</span>}
              </div>
              {u.bio && <p className="text-slate-700 text-sm">{u.bio}</p>}

              <div className="flex flex-wrap gap-2">
                {(u.languages || []).map(l => (
                  <span key={l} className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700">{l.toUpperCase()}</span>
                ))}
                {(u.goals || []).map(g => (
                  <span key={g} className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-xs">{g}</span>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button onClick={() => onMatch(u)} className="flex-1 rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">Match</button>
                <button onClick={() => onPass(u)}  className="flex-1 rounded bg-slate-200 px-3 py-2 text-slate-800 hover:bg-slate-300">Pass</button>
                <button onClick={() => onViewProfile(u)} className="rounded border px-3 py-2 text-slate-700 hover:bg-slate-50">View profile</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
})
