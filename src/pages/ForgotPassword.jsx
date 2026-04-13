import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { Wallet, Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export default function ForgotPassword() {
  const { error: showError, success: showSuccess } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { showError('Informe seu e-mail.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { showError('E-mail inválido.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
      showSuccess('E-mail enviado! Verifique sua caixa de entrada.')
    } catch (err) {
      showError(err.message || 'Erro ao enviar e-mail.')
    }
    setLoading(false)
  }

  return (
    <div className="dark min-h-screen flex bg-surface-950 text-white transition-colors">
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
            Recupere o<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">
              seu acesso.
            </span>
          </h1>
          <p className="text-surface-300 text-lg leading-relaxed font-medium">
            Sem estresse. Enviamos um link seguro para você criar uma nova senha em segundos.
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

          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
                  Esqueceu a senha?
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm font-medium">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">
                    E-mail cadastrado
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

                <Button type="submit" loading={loading} className="w-full mt-2" icon={!loading ? ArrowRight : null}>
                  Enviar link de recuperação
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-income-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📬</span>
              </div>
              <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-3">
                E-mail enviado!
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed mb-6">
                Se <strong className="text-surface-700 dark:text-surface-200">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha. Verifique também a pasta de spam.
              </p>
              <p className="text-surface-400 dark:text-surface-500 text-xs">
                O link expira em <strong>1 hora</strong>.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
