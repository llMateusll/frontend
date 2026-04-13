import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import { Target, Plus, Edit2, Trash2, Calendar, X, TrendingUp } from 'lucide-react'

export default function Goals() {
  const { success, error: showError } = useToast()
  const { confirm } = useConfirm()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/goals')
      setGoals(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar metas.')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', target_amount: '', current_amount: '', deadline: '' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (goal) => {
    setEditing(goal)
    setForm({
      name: goal.name,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      deadline: goal.deadline?.split('T')[0] || ''
    })
    setFormError('')
    setShowModal(true)
  }

  const validate = () => {
    if (!form.name.trim()) return 'Nome é obrigatório.'
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) return 'Valor alvo deve ser maior que zero.'
    if (form.current_amount && parseFloat(form.current_amount) < 0) return 'Valor atual não pode ser negativo.'
    if (form.current_amount && parseFloat(form.current_amount) > parseFloat(form.target_amount || 0)) return 'Valor atual não pode ser maior que o valor alvo.'
    if (!form.deadline) return 'Prazo é obrigatório.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setFormError(err); return }

    setSubmitting(true)
    setFormError('')
    const payload = {
      name: form.name.trim(),
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || 0),
      deadline: form.deadline
    }
    try {
      if (editing) {
        await api.put(`/goals/${editing.id}`, payload)
        success('Meta atualizada com sucesso!')
      } else {
        await api.post('/goals', payload)
        success('Meta criada com sucesso!')
      }
      setShowModal(false)
      setEditing(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar meta.'
      showError(msg)
      setFormError(msg)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!(await confirm('Tem certeza que deseja excluir esta meta? Todo o progresso será perdido.', 'Excluir Meta'))) return
    try {
      await api.delete(`/goals/${id}`)
      success('Meta excluída com sucesso!')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao excluir meta.'
      showError(msg)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Metas</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Goals */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma meta criada ainda.</p>
          <button onClick={openCreate} className="mt-3 text-primary hover:underline text-sm font-medium">
            Criar sua primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
            const remaining = goal.target_amount - goal.current_amount
            const isComplete = pct >= 100
            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isComplete ? 'bg-income/10 text-income' : 'bg-primary/10 text-primary'}`}>
                      {isComplete ? <TrendingUp className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{goal.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{formatCurrency(goal.current_amount)}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${isComplete ? 'bg-income' : 'bg-primary'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Meta: {formatCurrency(goal.target_amount)}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(goal.deadline)}
                  </span>
                </div>

                {!isComplete && remaining > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    Faltam {formatCurrency(remaining)}
                  </p>
                )}
                {isComplete && (
                  <p className="mt-2 text-xs font-medium text-income">
                    Meta atingida!
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {editing ? 'Editar Meta' : 'Nova Meta'}
              </h2>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Viagem de férias"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Alvo</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.target_amount}
                    onChange={(e) => setForm(f => ({ ...f, target_amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Atual</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.current_amount}
                    onChange={(e) => setForm(f => ({ ...f, current_amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Salvando...' : (editing ? 'Salvar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
