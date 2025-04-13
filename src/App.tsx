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
    const update = await check();

    if (update) {
      console.log(`found update ${update.version} from ${update.date}`);

      // 🛑 Gracefully stop the backend first
      try {
        await invoke("stop_backend");
        console.log("✅ Backend stopped before update.");
      } catch (e) {
        console.warn("⚠️ Failed to stop backend", e);
      }

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            console.log(`started downloading ${event.data.contentLength} bytes`);
            break;
          case 'Progress':
            console.log(`downloaded ${event.data.chunkLength}`);
            break;
          case 'Finished':
            console.log('download finished');
            break;
        }
      });

      console.log('update installed');
      await relaunch();
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
