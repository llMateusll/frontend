import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatDate } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle, Filter } from 'lucide-react'

const typeIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  danger: AlertCircle
}

const typeColors = {
  success: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20',
  warning: 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20',
  info: 'text-blue-500 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  danger: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
}

export default function Alerts() {
  const { success, info: showInfo } = useToast()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/alerts')
      setAlerts(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar alertas.')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const markAsRead = async (id) => {
    try {
      await api.post(`/alerts/read/${id}`)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
      window.dispatchEvent(new CustomEvent('alertsUpdated'))
    } catch {
      // silent
    }
  }

  const markAllAsRead = async () => {
    const unread = alerts.filter(a => !a.is_read)
    if (unread.length === 0) return
    try {
      await Promise.all(unread.map(a => api.post(`/alerts/read/${a.id}`)))
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      success('Todos os alertas marcados como lidos!')
      window.dispatchEvent(new CustomEvent('alertsUpdated'))
    } catch {
      showInfo('Não foi possível marcar todos como lidos.')
    }
  }

  const unreadAlerts = alerts.filter(a => !a.is_read)
  const filtered = filterType ? unreadAlerts.filter(a => a.type === filterType) : unreadAlerts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notificações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {alerts.filter(a => !a.is_read).length} não lido(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos</option>
              <option value="success">Sucesso</option>
              <option value="warning">Aviso</option>
              <option value="info">Info</option>
              <option value="danger">Danger</option>
            </select>
          </div>
          {alerts.some(a => !a.is_read) && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Marcar todos como lidos
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Alerts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{filterType ? 'Nenhum alerta desse tipo.' : 'Nenhum alerta.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const Icon = typeIcons[alert.type] || Info
            const colorClass = typeColors[alert.type] || typeColors.info
            return (
              <div
                key={alert.id}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  alert.is_read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-70'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-4 border-l-primary shadow-sm'
                } hover:shadow-md`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0" onClick={() => !alert.is_read && markAsRead(alert.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{alert.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(alert.created_at)}</p>
                    </div>
                    {!alert.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(alert.id) }}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                        title="Marcar como lido"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
