import { useEffect, useState } from 'react'
import Login from './components/login'
import { supabase } from './lib/supabase'
import Dashboard from './dashboard'
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';

function App() {
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    runUpdater();

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

  async function runUpdater() {
    const update = await check()
  
    if (update) {
      console.log(`🆕 Found update ${update.version}`)
  
      try {
        console.log("🛑 Stopping backend...")
        await invoke("stop_backend")
        await new Promise((res) => setTimeout(res, 1000)) // wait 1 sec for cleanup
      } catch (err) {
        console.warn("⚠️ Could not stop backend:", err)
      }
  
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            console.log(`⬇️ Download started (${event.data.contentLength} bytes)`)
            break
          case 'Progress':
            console.log(`📦 Downloaded ${event.data.chunkLength} bytes`)
            break
          case 'Finished':
            console.log('✅ Download finished')
            break
        }
      })
  
      console.log('🚀 Update installed — relaunching app')
      await relaunch()
    }
  }

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

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
