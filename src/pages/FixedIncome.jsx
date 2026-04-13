import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatCurrency } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import { Wallet, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react'

export default function FixedIncome() {
  const { success, error: showError } = useToast()
  const { confirm } = useConfirm()
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', amount: '', category: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/fixed-income')
      setIncomes(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar rendas fixas.')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', amount: '', category: 'Salário' })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name, amount: String(item.amount), category: item.category || 'Salário' })
    setFormError('')
    setShowModal(true)
  }

  const validate = () => {
    if (!form.name.trim()) return 'Nome é obrigatório.'
    if (!form.amount || parseFloat(form.amount) <= 0) return 'Valor deve ser maior que zero.'
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
      amount: parseFloat(form.amount),
      category: form.category.trim() || 'Salário'
    }
    try {
      if (editing) {
        await api.put(`/fixed-income/${editing.id}`, payload)
        success('Renda fixa atualizada!')
      } else {
        await api.post('/fixed-income', payload)
        success('Renda fixa cadastrada! Aparecerá todo mês no dashboard.')
      }
      setShowModal(false)
      setEditing(null)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar.'
      showError(msg)
      setFormError(msg)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!(await confirm('Deseja realmente excluir esta renda fixa? Esta ação não pode ser desfeita.', 'Excluir Renda Fixa'))) return
    try {
      await api.delete(`/fixed-income/${id}`)
      success('Renda fixa excluída!')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao excluir.'
      showError(msg)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Renda Fixa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cadastre seu salário e outras rendas recorrentes. O valor aparecerá em todos os meses no dashboard.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Nova Renda
        </button>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm">
        <p><strong>Como funciona:</strong> Rendas fixas são somadas automaticamente ao total de receitas de cada mês. Não precisa lançar todo mês manualmente.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : incomes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma renda fixa cadastrada.</p>
          <button onClick={openCreate} className="mt-3 text-primary hover:underline text-sm font-medium">
            Cadastrar sua primeira renda fixa
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-4 p-4 bg-income/10 dark:bg-income/5 rounded-xl">
            <TrendingUp className="w-6 h-6 text-income flex-shrink-0" />
            <div>
              <p className="text-sm text-income dark:text-income">Total de renda fixa mensal</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(incomes.reduce((acc, item) => acc + item.amount, 0))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {incomes.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-income/10 dark:bg-income/20 text-income flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xl font-bold text-income mt-4">
                  {formatCurrency(item.amount)} <span className="text-xs font-normal text-gray-400">/mês</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {editing ? 'Editar Renda Fixa' : 'Nova Renda Fixa'}
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
                    placeholder="Ex: Salário, Aluguel, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Mensal</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Salário"
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
                    {submitting ? 'Salvando...' : (editing ? 'Salvar' : 'Cadastrar')}
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
