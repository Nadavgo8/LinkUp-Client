import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/SignUp.jsx'
import { ErrorBanner } from './components/ErrorBanner.jsx'

import { setErrorReporter } from './api/server.js'
import { ui } from './stores/uiStore.js'
setErrorReporter((msg) => ui.pushError(msg))

export default function App(){
  return (
    <div className="mx-auto max-w-7xl p-4">
      <ErrorBanner />
      <header className="flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">LinkUp</Link>
        <nav className="hidden gap-4 md:flex">
          <Link className="hover:underline" to="/">Home</Link>
          <Link className="hover:underline" to="/signup">Sign up</Link>
        </nav>
      </header>
      <main className="mt-6">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Navigate to="/#login" replace />} />
        </Routes>
      </main>
    </div>
  )
}
