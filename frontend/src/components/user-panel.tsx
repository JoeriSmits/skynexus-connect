type Props = {
  user: any
  onLogout: () => void
}

export default function UserPanel({ user, onLogout }: Props) {
    return (
      <div className="space-y-4 bg-card p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-primary">Welcome back, {user?.user_metadata?.full_name || 'User'}!</h2>
        
        <div className="space-y-2">
          <p className="text-lg">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-lg">
            <strong>Joined:</strong> {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 transition-all"
          >
            Log out
          </button>
        </div>
      </div>
    )
}
