import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [currentTheme, setCurrentTheme] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6C63FF',
    is_active: true
  })

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      setLoading(true)
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false })

      if (themesError) throw themesError

      // Fetch questions count
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('theme_id')

      if (questionsError) throw questionsError

      const themesWithCounts = themesData.map(theme => {
        const count = questions.filter(q => q.theme_id === theme.id).length
        return { ...theme, questionCount: count }
      })

      setThemes(themesWithCounts)
    } catch (error) {
      console.error('Error fetching themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (theme?: any) => {
    if (theme) {
      setCurrentTheme(theme)
      setFormData({
        name: theme.name || '',
        description: theme.description || '',
        icon: theme.icon || '',
        color: theme.color || '#6C63FF',
        is_active: theme.is_active ?? true
      })
    } else {
      setCurrentTheme(null)
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#6C63FF',
        is_active: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (currentTheme) {
        const { error } = await supabase
          .from('themes')
          .update(formData)
          .eq('id', currentTheme.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('themes')
          .insert([formData])
        if (error) throw error
      }
      setIsDialogOpen(false)
      fetchThemes()
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  }

  const handleDeleteClick = (theme: any) => {
    setCurrentTheme(theme)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentTheme) return
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', currentTheme.id)
      if (error) throw error
      setIsDeleteDialogOpen(false)
      fetchThemes()
    } catch (error) {
      console.error('Error deleting theme:', error)
    }
  }

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Theme
        </Button>
      </div>
      
      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                className="pl-8 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading themes...</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b border-border">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Icon</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Questions</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredThemes.length === 0 ? (
                    <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No themes found.</td></tr>
                  ) : (
                    filteredThemes.map((theme) => (
                      <tr key={theme.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-border">
                        <td className="p-4 align-middle text-2xl">{theme.icon}</td>
                        <td className="p-4 align-middle font-medium">{theme.name}</td>
                        <td className="p-4 align-middle max-w-[200px] truncate" title={theme.description}>{theme.description}</td>
                        <td className="p-4 align-middle">
                          <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: theme.color }}></div>
                        </td>
                        <td className="p-4 align-middle">{theme.questionCount}</td>
                        <td className="p-4 align-middle">
                          {theme.is_active ? (
                            <span className="inline-flex items-center rounded-full border border-green-500 px-2.5 py-0.5 text-xs font-semibold text-green-500">Active</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-muted-foreground px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Inactive</span>
                          )}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenDialog(theme)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(theme)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTheme ? 'Edit Theme' : 'Add Theme'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Theme name..." />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Icon (Emoji)</Label>
                <Input value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} placeholder="🌍" />
              </div>
              <div className="grid gap-2">
                <Label>Color Hex</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-12 p-1 h-10" />
                  <Input value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={formData.is_active} 
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-muted-foreground">
            Are you sure you want to delete this theme? It will also delete all associated questions!
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
