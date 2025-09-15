const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

let token = localStorage.getItem('token') || ''

export function setAuthToken(newToken) {
  token = newToken || ''
  if (newToken) localStorage.setItem('token', newToken)
  else localStorage.removeItem('token')
}

let errorReporter = (msg) => {}
export function setErrorReporter(fn) {
  if (typeof fn === 'function') errorReporter = fn
}
function report(msg) {
  try { errorReporter(msg) } catch {}
}

async function req(path, { method = 'GET', body, auth = true, headers } = {}) {
  const finalHeaders = { ...(headers || {}) }
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`

  let payload = body
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(BASE + path, { method, headers: finalHeaders, body: payload, credentials: 'include' })
  } catch (e) {
    const msg = e?.message || 'Network error'
    report(msg)  
    throw new Error(msg)
  }

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try { message = isJson ? (await res.json())?.message || message : (await res.text()) || message } catch {}
    report(message)
    throw new Error(message)
  }

  if (res.status === 204) return null
  return isJson ? res.json() : res.text()
}


export async function login(email, password) {
  const data = await req('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  if (data?.token) setAuthToken(data.token)
  return data
}

export async function signup({ name, email, password, age, bio }) {
  const data = await req('/auth/signup', { method: 'POST', body: { name, email, password, age, bio }, auth: false })
  if (data?.token) setAuthToken(data.token)
  return data
}

export function logout() {
  setAuthToken('')
}

// export async function me() {
//   return req('/auth/me') 
// }
