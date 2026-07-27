import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { supabase } from '../lib/supabase'
import { Users, Activity, Gamepad2, Trophy } from 'lucide-react'
import { Database } from '../types/database'

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlayers: 0,
    totalGames: 0,
    avgScore: 0
  })
  const [themesData, setThemesData] = useState<any[]>([])
  const [gamesOverTime, setGamesOverTime] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Active players (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: activePlayers } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', sevenDaysAgo)

      // Total games
      const { count: totalGames } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })

      // Average score (calculate from sessions)
      const { data: allSessions } = await supabase
        .from('game_sessions')
        .select('score, total_questions')
      
      let avgScore = 0
      if (allSessions && allSessions.length > 0) {
        const totalPercentage = allSessions.reduce((acc, curr) => {
          if (curr.total_questions === 0) return acc
          return acc + (curr.score / curr.total_questions) * 100
        }, 0)
        avgScore = Math.round(totalPercentage / allSessions.length)
      }

      setStats({
        totalUsers: totalUsers || 0,
        activePlayers: activePlayers || 0,
        totalGames: totalGames || 0,
        avgScore
      })

      // Most played themes
      const { data: sessionsWithThemes } = await supabase
        .from('game_sessions')
        .select('theme_id, themes(name)')
      
      const themeCounts: Record<string, number> = {}
      sessionsWithThemes?.forEach(session => {
        const themeName = (session.themes as any)?.name || 'Unknown'
        themeCounts[themeName] = (themeCounts[themeName] || 0) + 1
      })
      
      setThemesData(Object.entries(themeCounts).map(([name, count]) => ({ name, count })))

      // Games over time (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const { data: recentGames } = await supabase
        .from('game_sessions')
        .select('started_at')
        .gte('started_at', thirtyDaysAgo.toISOString())
      
      const gamesByDate: Record<string, number> = {}
      for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        gamesByDate[d.toISOString().split('T')[0]] = 0
      }
      
      recentGames?.forEach(game => {
        const date = game.started_at.split('T')[0]
        if (gamesByDate[date] !== undefined) {
          gamesByDate[date]++
        }
      })
      
      setGamesOverTime(Object.entries(gamesByDate).reverse().map(([date, count]) => ({
        date: date.substring(5), // MM-DD
        count
      })))

      // Recent sessions
      const { data: latestSessions } = await supabase
        .from('game_sessions')
        .select(`
          id,
          score,
          total_questions,
          started_at,
          profiles(username),
          themes(name)
        `)
        .order('started_at', { ascending: false })
        .limit(10)

      setRecentSessions(latestSessions || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Players (7d)</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlayers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Gamepad2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Played Themes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={themesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Games Played (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gamesOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b border-border">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Theme</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Score</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {recentSessions.map((session) => (
                  <tr key={session.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-border">
                    <td className="p-4 align-middle">{session.profiles?.username || 'Unknown User'}</td>
                    <td className="p-4 align-middle">{session.themes?.name || 'Unknown Theme'}</td>
                    <td className="p-4 align-middle">{session.score} / {session.total_questions}</td>
                    <td className="p-4 align-middle">{new Date(session.started_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
