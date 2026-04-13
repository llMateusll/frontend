import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import { Plus, Edit2, Trash2, Repeat, Search, X } from 'lucide-react'

export default function Transactions() {
  const { success, error: showError } = useToast()
  const { confirm } = useConfirm()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ month: '', year: new Date().getFullYear(), type: '', category_id: '' })
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(createEmptyForm())
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function createEmptyForm() {
    return {
      type: 'expense', amount: '', description: '', category_id: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false, recurrence_type: 'monthly'
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year
      if (filters.type) params.type = filters.type
      if (filters.category_id) params.category_id = filters.category_id
      const res = await api.get('/transactions', { params })
      setTransactions(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar transações.')
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch {
      // categories optional
    }
  }

  useEffect(() => { fetchData() }, [filters])
  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(createEmptyForm())
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (tx) => {
    setEditing(tx)
    setForm({
      type: tx.type, amount: String(tx.amount), description: tx.description,
      category_id: tx.category?.id || '', date: tx.date?.split('T')[0] || '',
      is_recurring: tx.is_recurring, recurrence_type: tx.recurrence_type || 'monthly'
    })
    setFormError('')
    setShowModal(true)
  }

  const validate = () => {
    if (!form.description.trim()) return 'Descrição é obrigatória.'
    if (!form.amount || parseFloat(form.amount) <= 0) return 'Valor deve ser maior que zero.'
    if (!form.category_id) return 'Selecione uma categoria.'
    if (!form.date) return 'Data é obrigatória.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setFormError(err); return }

    setSubmitting(true)
    setFormError('')
    const payload = {
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description.trim(),
      category_id: form.category_id,
      date: form.date,
      is_recurring: form.is_recurring,
      recurrence_type: form.is_recurring ? form.recurrence_type : null
    }
    try {
      if (editing) {
        await api.put(`/transactions/${editing.id}`, payload)
        success('Transação atualizada com sucesso!')
      } else {
        await api.post('/transactions', payload)
        success('Transação criada com sucesso!')
      }
      setShowModal(false)
      setEditing(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar transação.'
      showError(msg)
      setFormError(msg)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!(await confirm('Deseja excluir permanentemente esta transação? O seu saldo será afetado.', 'Excluir Transação'))) return
    try {
      await api.delete(`/transactions/${id}`)
      success('Transação excluída com sucesso!')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao excluir transação.'
      showError(msg)
    }
  }

  const recurrenceLabels = { daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transações</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nova Transação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mês</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters(f => ({ ...f, month: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ano</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters(f => ({ ...f, year: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos</option>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos</option>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Transactions list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                    {tx.type === 'income' ? <Plus className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{tx.description}</p>
                      {tx.is_recurring && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary flex-shrink-0">
                          <Repeat className="w-3 h-3" />
                          {tx.recurrence_type && recurrenceLabels[tx.recurrence_type]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {tx.category?.name || 'Sem categoria'} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                {editing ? 'Editar Transação' : 'Nova Transação'}
              </h2>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: 'income' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-income/10 text-income' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-expense/10 text-expense' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Despesa
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Exemplo: Supermercado"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Selecione</option>
                    {categories
                      .filter(c => c.type === form.type)
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_recurring}
                      onChange={(e) => setForm(f => ({ ...f, is_recurring: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Recorrente</span>
                  </label>
                  {form.is_recurring && (
                    <select
                      value={form.recurrence_type}
                      onChange={(e) => setForm(f => ({ ...f, recurrence_type: e.target.value }))}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  )}
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
