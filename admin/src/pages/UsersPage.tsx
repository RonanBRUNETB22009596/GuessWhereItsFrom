import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, score')

      const usersWithStats = profiles.map(profile => {
        const userSessions = sessions?.filter(s => s.user_id === profile.id) || []
        const gamesPlayed = userSessions.length
        const totalScore = userSessions.reduce((sum, s) => sum + s.score, 0)
        return { ...profile, gamesPlayed, totalScore }
      })

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>
      
      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                className="pl-8 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading users...</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b border-border">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Games Played</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Score</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Admin</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Join Date</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No users found.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-border">
                        <td className="p-4 align-middle font-medium">{user.username}</td>
                        <td className="p-4 align-middle">{user.gamesPlayed}</td>
                        <td className="p-4 align-middle">{user.totalScore}</td>
                        <td className="p-4 align-middle">
                          {user.is_admin ? (
                            <span className="inline-flex items-center rounded-full border border-primary px-2.5 py-0.5 text-xs font-semibold text-primary">Admin</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">User</span>
                          )}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
