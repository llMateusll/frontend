import { useState, useContext, useEffect } from 'react'
import { User, Lock, Eye, EyeOff, Save, ArrowLeft, LogOut, Shield, ShieldCheck } from 'lucide-react'
import { AuthContext } from '../contexts/Auth'
import { useToast } from '../contexts/ToastContext'
import api from '../utils/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'

export default function Settings() {
  const { user, setUser, logout } = useContext(AuthContext)
  const { success, error: showError } = useToast()
  
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [loading, setLoading] = useState(false)

  // Calibrating password strength identical to Registration
  const passwordChecks = [
    { label: '6+ carac.', met: newPassword.length >= 6 },
    { label: 'A-Z', met: /[A-Z]/.test(newPassword) },
    { label: 'a-z', met: /[a-z]/.test(newPassword) },
    { label: '0-9', met: /[0-9]/.test(newPassword) },
    { label: '!@#$', met: /[^A-Za-z0-9]/.test(newPassword) }
  ]

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return showError('O nome não pode estar vazio.')
    
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', { name })
      if (setUser) setUser(prev => ({ ...prev, name: res.data.user.name }))
      success('Nome atualizado com sucesso!')
    } catch (err) {
      showError(err.response?.data?.error || 'Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!currentPassword) return showError('Você precisa informar sua senha atual.')
    if (newPassword !== confirmPassword) return showError('As senhas não conferem.')
    if (newPassword.length < 6) return showError('A nova senha deve ter pelo menos 6 caracteres.')

    const allMet = passwordChecks.every(c => c.met)
    if (!allMet) return showError('A nova senha não atende a todos os critérios de segurança.')

    setLoading(true)
    try {
      await api.put('/auth/profile', { currentPassword, newPassword })
      success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showError(err.response?.data?.error || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-surface-500 dark:text-surface-400 font-medium">Gerencie suas informações de conta e segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar (Mobile Friendly) */}
        <aside className="md:col-span-1 space-y-4">
          <Card className="p-2 overflow-hidden">
            <div className="flex flex-col gap-1">
               <div className="px-4 py-3 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm flex items-center gap-3">
                 <User className="w-4 h-4" />
                 Perfil & Segurança
               </div>
               {/* Placeholders for future sections if needed */}
               <div className="px-4 py-3 text-surface-400 dark:text-surface-500 rounded-xl font-semibold text-sm flex items-center gap-3 cursor-not-allowed">
                 <Shield className="w-4 h-4" />
                 Privacidade
                 <Badge variant="secondary" className="ml-auto text-[10px]">Breve</Badge>
               </div>
            </div>
          </Card>

          <Card className="p-4 bg-expense-50/50 dark:bg-expense-500/5 border-expense-200 dark:border-expense-500/20">
             <h3 className="text-sm font-bold text-expense-600 mb-2">Zona de Perigo</h3>
             <p className="text-xs text-expense-500 mb-4 leading-relaxed">Sair da conta encerrará sua sessão atual em todos os dispositivos.</p>
             <Button variant="ghost" className="w-full justify-start text-expense-500 hover:bg-expense-50 dark:hover:bg-expense-500/10 gap-3" onClick={logout}>
               <LogOut className="w-4 h-4" />
               Encerrar Sessão
             </Button>
          </Card>
        </aside>

        {/* Forms Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Dados Pessoais</h2>
                <p className="text-xs text-surface-400">Como você aparece no Finance App.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Nome completo</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  icon={User}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">E-mail</label>
                <Input 
                  value={user?.email || ''}
                  disabled
                  className="bg-surface-50 dark:bg-surface-700/30 opacity-70 cursor-not-allowed"
                />
                <p className="text-[10px] text-surface-400 mt-1.5 ml-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-income-500" />
                  E-mail verificado e protegido.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={loading} icon={Save}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">Alterar Senha</h2>
                <p className="text-xs text-surface-400">Garanta a segurança da sua conta.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Senha Atual</label>
                <Input 
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 p-1 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Nova Senha</label>
                  <Input 
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={Lock}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 p-1 transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-1.5 ml-1">Confirmar Nova</label>
                  <Input 
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={Lock}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 p-1 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Indicators (Synced with Register style) */}
              {newPassword.length > 0 && (
                <div className="py-2 px-1">
                  <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-2">Segurança da Senha</p>
                  <div className="flex flex-wrap gap-2">
                    {passwordChecks.map((check, i) => (
                      <div 
                        key={i} 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                          check.met 
                            ? 'bg-income-50 dark:bg-income-500/10 text-income-600 border-income-200 dark:border-income-500/30' 
                            : 'bg-surface-50 dark:bg-surface-700/50 text-surface-400 border-surface-200 dark:border-surface-700'
                        }`}
                      >
                        {check.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  loading={loading} 
                  variant="secondary"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
                >
                  Alterar Senha
                </Button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  )
}
