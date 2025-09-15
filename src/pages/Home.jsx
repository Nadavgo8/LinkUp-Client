import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'

export default function Home(){
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <section className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6 md:col-start-3 text-center md:-translate-y-8">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Find people with the same purpose.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              LinkUp helps you meet new friends based on shared interests and goals.
              Swipe, match, and connect.
            </p>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-700">
              <li>✓ Smart matching</li>
              <li>✓ Free to start</li>
            </ul>
          </div>

          <aside id="login" className="md:col-span-4 md:col-start-9">
            <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
              <LoginForm />
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
