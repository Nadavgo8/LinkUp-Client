import { Routes, Route, NavLink, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/SignUp.jsx'
import { ErrorBanner } from './components/ErrorBanner.jsx'
import { setErrorReporter } from './api/server.js'
import { ui } from './stores/uiStore.js'
setErrorReporter((msg) => ui.pushError(msg))

export default function App(){
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl h-14 px-4 flex items-center">
          <Link to="/" className="text-xl font-semibold text-indigo-600">LinkUp</Link>
          <nav className="ml-auto flex items-center gap-6 text-sm md:text-base">
            <NavLink to="/" className={({ isActive }) => 
              `whitespace-nowrap hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-700'}`}>
              Home
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) =>
              `whitespace-nowrap hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-700'}`
            }>
              Register
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="px-4 py-6">
        <ErrorBanner />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/signup" element={<Signup/>} />
        </Routes>
      </main>
    </div>
  )
}
