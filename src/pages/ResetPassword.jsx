import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { Wallet, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) { showError('Informe a nova senha.'); return }
    if (password.length < 6) { showError('A senha deve ter ao menos 6 caracteres.'); return }
    if (password !== confirm) { showError('As senhas não conferem.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
      showSuccess('Senha redefinida com sucesso!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      showError(err.message || 'Erro ao redefinir senha.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-surface-900">
        <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 50%, #064E3B 100%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] mix-blend-screen animate-float" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[120px] mix-blend-screen animate-float-slow" />
        <div className="relative z-10 text-white max-w-lg mt-[-10%]">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <Wallet className="w-8 h-8 text-primary-300" />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Crie uma<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">
              nova senha.
            </span>
          </h1>
          <p className="text-surface-300 text-lg leading-relaxed font-medium">
            Escolha uma senha forte para manter sua conta segura.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-surface-800 dark:text-surface-100">Finance</span>
          </div>

          {!done ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                  Redefinir senha
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm font-medium">
                  Crie uma nova senha de pelo menos 6 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      icon={Lock}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      icon={Lock}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Strength hint */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? password.length >= 12 ? 'bg-income-500' 
                                : password.length >= 8 ? 'bg-yellow-400'
                                : 'bg-expense-500'
                              : 'bg-surface-200 dark:bg-surface-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-surface-400">
                      {password.length < 6 ? 'Muito curta' : password.length < 8 ? 'Fraca' : password.length < 12 ? 'Média' : 'Forte'}
                    </p>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full mt-2" icon={!loading ? ArrowRight : null}>
                  Redefinir senha
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-income-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-3">
                Senha redefinida!
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed mb-6">
                Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes...
              </p>
            </div>
          )}

          {!done && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
