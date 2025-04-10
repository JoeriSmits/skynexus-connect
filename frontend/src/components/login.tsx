import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else if (data.session) {
      onLogin(data.user)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm shadow-lg rounded-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-primary">
            Login to SkyNexus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-input border-input focus:ring-primary focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-input border-input focus:ring-primary focus:ring-2"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button 
            className="w-full py-2 mt-4 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
