import { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, Wallet, Bell, LogOut, Moon, Sun, X, Menu, Settings } from 'lucide-react'
import api from '../utils/api'
import { AuthContext } from '../contexts/Auth'

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = () => {
      api.get('/alerts')
        .then(res => {
          const alerts = res.data || []
          const count = alerts.filter(a => !a.is_read && a.title.includes('Saldo negativo')).length
          setUnreadCount(count)
        })
        .catch(() => {})
    }

    fetchUnread()

    window.addEventListener('alertsUpdated', fetchUnread)
    
    // Polling a cada 10 segundos para dar efeito em "tempo real"
    const interval = setInterval(fetchUnread, 10000)

    return () => {
      window.removeEventListener('alertsUpdated', fetchUnread)
      clearInterval(interval)
    }
  }, [])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  if (darkMode && !document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark')
  } else if (!darkMode && document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
    { to: '/fixed-income', icon: Wallet, label: 'Renda Fixa' },
    { to: '/goals', icon: Target, label: 'Minhas Metas' },
    { to: '/alerts', icon: Bell, label: 'Notificações' }
  ]

  const AlertIcon = ({ className }) => {
    if (unreadCount === 0) return <Bell className={className} />
    return (
      <span className="relative inline-flex items-center flex-shrink-0">
        <Bell className={className} />
        {/* Ponto vermelho com o número */}
        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-expense-500 text-[9px] leading-4 font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-surface-900 border-none z-10">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
        {/* Efeito de alerta de "ping/pulso" chamando atenção em tempo real */}
        <span className="absolute -top-1 -right-1.5 w-[16px] h-[16px] rounded-full bg-expense-500 animate-ping opacity-75"></span>
      </span>
    )
  }

  const renderIcon = (Icon, isActive) => {
    const defaultClasses = `w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-primary-600 dark:text-primary-400 scale-110 drop-shadow-md' : 'text-surface-500 dark:text-surface-400 group-hover:text-surface-700 dark:group-hover:text-surface-300'}`
    
    if (Icon === Bell) return <AlertIcon className={defaultClasses} />
    return <Icon className={defaultClasses} />
  }

  const DarkModeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all duration-200 group"
    >
      <div className="relative w-10 h-5 rounded-full bg-surface-200 dark:bg-surface-600 transition-colors duration-300 flex-shrink-0 shadow-inner">
        <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${darkMode ? 'left-5 bg-gradient-to-br from-primary-400 to-primary-600' : 'left-0.5 bg-white'}`}>
          {darkMode
            ? <Moon className="w-2.5 h-2.5 text-white" />
            : <Sun className="w-2.5 h-2.5 text-warning-500" />
          }
        </div>
      </div>
      <span>{darkMode ? 'Tema Escuro' : 'Tema Claro'}</span>
    </button>
  )

  const UserCard = () => user && (
    <NavLink to="/settings" className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex flex-shrink-0 items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
        <span className="text-white text-sm font-bold">
          {user.name?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 pr-2">
        <p className="text-sm font-bold text-surface-800 dark:text-surface-200 truncate">{user.name}</p>
        <p className="text-[11px] font-medium text-surface-400 truncate">{user.email}</p>
      </div>
      <Settings className="w-4 h-4 text-surface-400 opacity-60 group-hover:opacity-100 group-hover:text-primary-500 transition-all ml-auto" />
    </NavLink>
  )

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
      isActive
        ? 'text-primary-700 dark:text-primary-300 shadow-sm'
        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-700/50'
    }`

  const activeIndicator = (isActive) =>
    isActive ? (
      <>
        <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/5 transition-opacity" />
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-primary-500" />
      </>
    ) : null

  /* ===== Mobile Views ===== */
  const MobileBottomBar = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200/50 dark:border-surface-700/50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:hidden h-[72px] pb-[env(safe-area-inset-bottom)] px-2">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative group pt-1">
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-primary-500" />}
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}>
                 {renderIcon(Icon, isActive)}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const MobileSidebar = () => (
    <>
      <div
        className={`fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`fixed z-50 top-0 left-0 bottom-0 h-full w-[280px] bg-white dark:bg-surface-900 shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-surface-900 dark:text-white">Finance</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 bg-surface-50 dark:bg-surface-800 dark:hover:text-surface-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end onClick={() => setSidebarOpen(false)} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  {activeIndicator(isActive)}
                  {renderIcon(Icon, isActive)}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-100 dark:border-surface-800 space-y-3 bg-surface-50/50 dark:bg-surface-800/30">
          <DarkModeToggle />
          <UserCard />
          <button onClick={() => { logout(); setSidebarOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-expense-500 hover:bg-expense-50 dark:hover:bg-expense-500/10 transition-colors group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  )

  const MobileTopBar = () => (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-[60px] bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="text-surface-600 dark:text-surface-300 p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-sm">
             <Wallet className="w-4 h-4 text-white" />
           </div>
           <span className="font-bold text-lg text-surface-900 dark:text-white">Finance</span>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs ring-2 ring-offset-1 ring-offset-white ring-primary-200">
         {user?.name?.charAt(0).toUpperCase()}
      </div>
    </div>
  )

  /* ===== Desktop Sidebar ===== */
  const DesktopSidebar = () => (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-surface-900 border-r border-surface-200/60 dark:border-surface-800 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
           <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black tracking-tight text-surface-900 dark:text-white">Finance</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end className={navLinkClass}>
            {({ isActive }) => (
              <>
                {activeIndicator(isActive)}
                {renderIcon(Icon, isActive)}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-surface-100 dark:border-surface-800 space-y-2 relative">
         <DarkModeToggle />
         <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-surface-500 hover:text-expense-500 hover:bg-expense-50 dark:border-surface-700 dark:hover:bg-expense-500/10 transition-colors group">
           <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
           <span>Sair da conta</span>
         </button>
         <hr className="border-surface-100 dark:border-surface-800 my-2" />
         <UserCard />
      </div>
    </aside>
  )

  return (
    <>
      <MobileTopBar />
      <MobileBottomBar />
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}
