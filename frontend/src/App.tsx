import { useEffect, useState } from 'react'
import Login from './components/login'
import UserPanel from './components/user-panel'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState<string>('Loading...')
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    // Fetch the session from localStorage on page load
    const saved = localStorage.getItem('supabase_session')

    if (saved) {
      const { data: {session: userSession}} = JSON.parse(saved); 

      supabase.auth.setSession(userSession).then(({ data }) => {
        const user = data.session?.user
        if (user) {
          setUser(user)  // Set the user if session exists
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('http://localhost:5000/status')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Python backend not running 😢'))
  }, [user])

  const handleLogin = async (loggedInUser: any) => {
    setUser(loggedInUser)
    const session = await supabase.auth.getSession()

    localStorage.setItem('supabase_session', JSON.stringify(session))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_session') // Clear session from localStorage
    setUser(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <Login onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SkyNexus Connector</h1>
          <UserPanel user={user} onLogout={handleLogout} />
        </header>
        <section className="rounded-lg border p-4 bg-muted">
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{status}</span>
          </p>
        </section>
      </div>
    </div>
  )
}

export default App
