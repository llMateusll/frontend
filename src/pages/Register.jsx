import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/Auth'
import { useToast } from '../contexts/ToastContext'
import { Wallet, Eye, EyeOff, ArrowRight, Check, X, User, Mail, Lock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Register() {
  const { register } = useContext(AuthContext)
  const { error: showError, success: showSuccess } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Password strength
  const passwordChecks = [
    { label: '6 caracteres', valid: password.length >= 6 },
    { label: 'Maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Minúscula', valid: /[a-z]/.test(password) },
    { label: 'Número', valid: /[0-9]/.test(password) },
    { label: 'Especial', valid: /[^A-Za-z0-9]/.test(password) },
  ]
  const strengthPct = password.length === 0 ? 0 : (passwordChecks.filter(c => c.valid).length / passwordChecks.length) * 100
  const strengthColor = strengthPct <= 40 ? 'from-expense-400 to-expense-500' : strengthPct <= 80 ? 'from-warning-400 to-warning-500' : 'from-income-400 to-income-500'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Nome é obrigatório.'); return }
    if (!email.trim()) { setError('E-mail é obrigatório.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('E-mail inválido.'); return }
    if (!password.trim()) { setError('Senha é obrigatória.'); return }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    if (!/[A-Z]/.test(password)) { setError('A senha deve conter uma letra maiúscula.'); return }
    if (!/[a-z]/.test(password)) { setError('A senha deve conter uma letra minúscula.'); return }
    if (!/[0-9]/.test(password)) { setError('A senha deve conter um número.'); return }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('A senha deve conter um caractere especial.'); return }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      await register(name.trim(), email, password)
      showSuccess('Conta criada com sucesso!')
      setTimeout(() => navigate('/dashboard'), 150)
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao criar conta. Tente novamente.'
      showError(msg)
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <main className="dark min-h-screen">
      <div className="min-h-screen flex bg-surface-950 transition-colors">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #1D4ED8, #06B6D4, #8B5CF6)',
            backgroundSize: '300% 300%',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-32 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-violet-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 text-white max-w-md animate-fade-in">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Comece agora.
            <br />
            <span className="text-violet-200">É gratuito.</span>
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed">
            Organize sua vida financeira em minutos. Dashboard inteligente, metas personalizadas e controle total dos seus gastos.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-surface-800 dark:text-surface-100">Finance</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-surface-800 dark:text-surface-100">Crie sua conta</h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-base">Preencha os dados abaixo para começar</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-expense-50 dark:bg-expense-500/10 border border-expense-200 dark:border-expense-500/20 text-expense-600 dark:text-expense-400 text-sm flex items-center gap-3 animate-slide-down">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Nome</label>
              <Input type="text" icon={User} value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo" autoComplete="name" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">E-mail</label>
              <Input type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" autoComplete="new-password" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${strengthColor} rounded-full transition-all duration-500`}
                      style={{ width: `${strengthPct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {passwordChecks.map((c, i) => (
                      <span key={i} className={`text-xs flex items-center gap-1 transition-colors ${c.valid ? 'text-income-500' : 'text-surface-400'}`}>
                        {c.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Confirmar Senha</label>
              <Input type={showPassword ? 'text' : 'password'} icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha" autoComplete="new-password" required />
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              className="w-full mt-2" 
              icon={!loading ? ArrowRight : null}
            >
              Criar minha conta
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
    </main>
  )
}
