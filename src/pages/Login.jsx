import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/Auth'
import { useToast } from '../contexts/ToastContext'
import { Wallet, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Login() {
  const { login } = useContext(AuthContext)
  const { error: showError, success: showSuccess } = useToast()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Custom toast logic if error happens, handle elegantly without big red box
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) { showError('E-mail é obrigatório.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { showError('E-mail inválido.'); return }
    if (!password.trim()) { showError('Senha é obrigatória.'); return }

    setLoading(true)
    try {
      await login(email, password)
      showSuccess('Login realizado com sucesso!')
      setTimeout(() => navigate('/dashboard'), 150)
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao fazer login. Verifique suas credenciais.'
      showError(msg)
    }
    setLoading(false)
  }

  return (
    <main className="dark min-h-screen">
      <div className="dark min-h-screen flex bg-surface-950 text-white transition-colors">
      {/* Left panel - branding with sophisticated animated gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-surface-900">
        {/* Animated gradient background modern blue/cyan */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 50%, #064E3B 100%)',
          }}
        />
        
        {/* Dynamic Abstract Shapes with Blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] mix-blend-screen animate-float" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[120px] mix-blend-screen animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] mix-blend-screen animate-pulse-glow" />

        {/* Content */}
        <div className="relative z-10 text-white max-w-lg mt-[-10%]">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <Wallet className="w-8 h-8 text-primary-300" />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Seu próximo nível <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300 animate-gradient-shift">
              financeiro.
            </span>
          </h1>
          <p className="text-surface-300 text-lg leading-relaxed font-medium mb-12">
            Controle absoluto, metas inteligentes e análises profundas. 
            Transforme dados em decisões assertivas.
          </p>
          
          <div className="flex gap-4">
            <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-income-500/20 flex items-center justify-center">
                <span className="text-income-400 font-bold text-lg">↑</span>
              </div>
              <div>
                <p className="text-sm text-surface-300 font-medium">+142%</p>
                <p className="text-xs text-surface-400">Rendimento</p>
              </div>
            </div>
            <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-surface-300 font-medium">Bancário</p>
                <p className="text-xs text-surface-400">Segurança App</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-surface-800 dark:text-surface-100">Finance</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Acesse sua conta
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm font-medium">
              Insira seus dados para continuar operando.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">
                E-mail
              </label>
              <Input
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Senha
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <Button 
              type="submit" 
              loading={loading} 
              className="w-full mt-2" 
              icon={!loading ? ArrowRight : null}
            >
              Entrar na plataforma
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700"></div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Ou continue com</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700"></div>
          </div>

          <div className="mt-6">
            <Button variant="secondary" className="w-full group" type="button">
              <svg className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.72 18.24 13.46 18.66 12 18.66C9.17 18.66 6.78 16.75 5.88 14.18H2.21V17.03C4.01 20.61 7.74 23 12 23Z" fill="#34A853"/>
                <path d="M5.88 14.18C5.64 13.48 5.51 12.75 5.51 12C5.51 11.25 5.64 10.52 5.88 9.82V6.97H2.21C1.47 8.44 1.05 10.16 1.05 12C1.05 13.84 1.47 15.56 2.21 17.03L5.88 14.18Z" fill="#FBBC04"/>
                <path d="M12 5.34C13.62 5.34 15.07 5.9 16.21 7.02L19.38 3.85C17.45 2.05 14.97 1 12 1C7.74 1 4.01 3.39 2.21 6.97L5.88 9.82C6.78 7.25 9.17 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-surface-500 dark:text-surface-400">
            Ainda não é cliente?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold transition-colors">
              Abra sua conta
            </Link>
          </p>
        </div>
      </div>
    </div>
    </main>
  )
}

function Shield(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    </svg>
  )
}
