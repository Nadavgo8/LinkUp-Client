import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'

export default function Home(){
  return (
    <div className="mx-auto max-w-7xl p-4">
      <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold md:text-5xl">Find people with the same purpose.</h1>
          <p className="mt-4 text-gray-600">
            LinkUp helps you meet new friends based on shared interests and goals. Swipe, match, and connect.
          </p>
          {/* <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-lg bg-black px-4 py-2 text-white">Create free account</Link>
            <Link to="#login" className="rounded-lg border px-4 py-2">Log in</Link>
          </div> */}
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-700 md:grid-cols-3">
            <li>✓ Smart matching</li>
            <li>✓ Free to start</li>
          </ul>
        </div>
        <div id="login" className="md:justify-self-end">
          <LoginForm />
        </div>
      </section>
    </div>
  )
}
