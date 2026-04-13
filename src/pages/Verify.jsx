import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { Wallet, CheckCircle, XCircle } from 'lucide-react'

export default function VerifyPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error | email-sent
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  // If token is provided in URL, verify automatically
  useEffect(() => {
    if (token) {
      api.post('/auth/verify', { token })
        .then((res) => {
          setStatus('success')
          setMessage(res.data.message)
          localStorage.setItem('token', res.data.token)
          setTimeout(() => navigate('/dashboard'), 2000)
        })
        .catch((err) => {
          setStatus('error')
          setMessage(err.response?.data?.error || 'Erro ao verificar e-mail.')
        })
    }
  }, [token, navigate])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSending(true)
    try {
      await api.post('/auth/resend-verification', { email })
      setStatus('email-sent')
      setMessage('E-mail de verificação reenviado!')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao reenviar e-mail.')
      setStatus('error')
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-700 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Finance App</h1>
          <p className="text-blue-100 text-lg">
            Verifique seu e-mail para ativar sua conta e começar a controlar suas finanças.
          </p>
        </div>
      </div>

      {/* Right panel - verification */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo - mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Finance App</span>
          </div>

          {status === 'loading' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verificando e-mail...</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aguarde um momento.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">E-mail verificado!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{message}</p>
              <p className="text-xs text-gray-400">Redirecionando para o dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Erro na verificação</h2>
              <p className="text-red-500 dark:text-red-400 text-sm mb-6">{message}</p>

              <form onSubmit={handleResend} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reenviar verificação
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Reenviar e-mail de verificação'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Voltar ao login
                </Link>
              </p>
            </div>
          )}

          {status === 'email-sent' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">E-mail enviado!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{message}</p>
              <p className="text-xs text-gray-400">Verifique sua caixa de entrada e clique no link recebido.</p>

              {" "}
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Voltar ao login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
