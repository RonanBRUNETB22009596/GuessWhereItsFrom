import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { SelectNative } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [themes, setThemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    prompt: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'option_a',
    explanation: '',
    theme_id: '',
    difficulty: 'easy',
    image_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [questionsRes, themesRes] = await Promise.all([
        supabase.from('questions').select('*, themes(name)').order('created_at', { ascending: false }),
        supabase.from('themes').select('id, name').order('name')
      ])

      if (questionsRes.error) throw questionsRes.error
      if (themesRes.error) throw themesRes.error

      setQuestions(questionsRes.data || [])
      setThemes(themesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (question?: any) => {
    if (question) {
      setCurrentQuestion(question)
      setFormData({
        prompt: question.prompt || '',
        option_a: question.option_a || '',
        option_b: question.option_b || '',
        option_c: question.option_c || '',
        option_d: question.option_d || '',
        correct_answer: question.correct_answer || 'option_a',
        explanation: question.explanation || '',
        theme_id: question.theme_id || '',
        difficulty: question.difficulty || 'easy',
        image_url: question.image_url || ''
      })
    } else {
      setCurrentQuestion(null)
      setFormData({
        prompt: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'option_a',
        explanation: '',
        theme_id: themes.length > 0 ? themes[0].id : '',
        difficulty: 'easy',
        image_url: ''
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (currentQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(formData)
          .eq('id', currentQuestion.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([formData])
        if (error) throw error
      }
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  const handleDeleteClick = (question: any) => {
    setCurrentQuestion(question)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentQuestion) return
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', currentQuestion.id)
      if (error) throw error
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTheme = themeFilter ? q.theme_id === themeFilter : true
    const matchesDifficulty = difficultyFilter ? q.difficulty === difficultyFilter : true
    return matchesSearch && matchesTheme && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompt..."
                className="pl-8 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <SelectNative value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
                <option value="">All Themes</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </SelectNative>
              <SelectNative value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </SelectNative>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading questions...</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b border-border">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Prompt</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Theme</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Difficulty</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredQuestions.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No questions found.</td></tr>
                  ) : (
                    filteredQuestions.map((question) => (
                      <tr key={question.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-border">
                        <td className="p-4 align-middle max-w-xs truncate" title={question.prompt}>{question.prompt}</td>
                        <td className="p-4 align-middle">{question.themes?.name}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize
                            ${question.difficulty === 'easy' ? 'border-green-500 text-green-500' : 
                              question.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' : 
                              'border-red-500 text-red-500'}`}
                          >
                            {question.difficulty}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenDialog(question)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(question)}>
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
            <DialogTitle>{currentQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <SelectNative value={formData.theme_id} onChange={(e) => setFormData({...formData, theme_id: e.target.value})}>
                <option value="" disabled>Select Theme</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </SelectNative>
            </div>
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <SelectNative value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </SelectNative>
            </div>
            <div className="grid gap-2">
              <Label>Prompt</Label>
              <Textarea value={formData.prompt} onChange={(e) => setFormData({...formData, prompt: e.target.value})} placeholder="Question text..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Option A</Label>
                <Input value={formData.option_a} onChange={(e) => setFormData({...formData, option_a: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Option B</Label>
                <Input value={formData.option_b} onChange={(e) => setFormData({...formData, option_b: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Option C</Label>
                <Input value={formData.option_c} onChange={(e) => setFormData({...formData, option_c: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Option D</Label>
                <Input value={formData.option_d} onChange={(e) => setFormData({...formData, option_d: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Correct Answer</Label>
              <SelectNative value={formData.correct_answer} onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}>
                <option value="option_a">Option A</option>
                <option value="option_b">Option B</option>
                <option value="option_c">Option C</option>
                <option value="option_d">Option D</option>
              </SelectNative>
            </div>
            <div className="grid gap-2">
              <Label>Explanation (optional)</Label>
              <Textarea value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Image URL (optional)</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} type="url" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.prompt || !formData.theme_id || !formData.option_a || !formData.option_b}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-muted-foreground">
            Are you sure you want to delete this question? This action cannot be undone.
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
