import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatCurrency, formatDate } from '../utils/format'
import { TrendingUp, TrendingDown, Wallet, Percent, CalendarDays, MoreHorizontal, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erro ao carregar o dashboard.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) return (
    <div className="p-4 rounded-xl bg-expense-50 dark:bg-expense-500/10 border border-expense-200 dark:border-expense-500/20 text-expense-600 dark:text-expense-400 font-medium flex items-center gap-2 animate-fade-in">
      <AlertCircle className="w-5 h-5" />
      {error}
    </div>
  )

  const d = data
  const income = d.monthly_incoming || 0
  const spent = d.monthly_outgoing || 0
  const spentPct = income > 0 ? Math.round((spent / income) * 100) : 0
  
  const prevMonthData = d.annual_summary && d.annual_summary.length > 1 ? d.annual_summary[d.annual_summary.length - 2] : null

  const calculateTrend = (current, prev) => {
    if (prev === null || prev === 0) return null
    const diff = current - prev
    const pct = Math.round((diff / Math.abs(prev)) * 100)
    return pct > 0 ? `+${pct}%` : `${pct}%`
  }

  const balanceTrend = prevMonthData ? calculateTrend(d.balance || 0, prevMonthData.balance) : null
  const incomeTrend = prevMonthData ? calculateTrend(d.monthly_incoming || 0, prevMonthData.income) : null
  const expenseTrend = prevMonthData ? calculateTrend(d.monthly_outgoing || 0, Math.abs(prevMonthData.expense)) : null

  // Transform data for line chart - pegando todos os meses iguais à tabela do ano
  const lineChartData = (d.annual_summary || []).map(row => ({
    name: row.month,
    Receitas: row.income,
    Despesas: Math.abs(row.expense),
    Ideal: row.income * 0.7
  }))

  // Mock pie chart data since backend doesn't provide categories grouped here yet
  const pieChartData = [
    { name: 'Moradia', value: 35 },
    { name: 'Alimentação', value: 25 },
    { name: 'Transporte', value: 15 },
    { name: 'Lazer', value: 15 },
    { name: 'Saúde', value: 10 },
  ]
  const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Dashboard</h1>
      </div>

      {/* Summary cards premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCardPremium 
          title="Saldo Atual" 
          value={formatCurrency(d.balance || 0)} 
          type="balance"
          trend={balanceTrend}
          isNegative={d.balance < 0}
        />
        <StatCardPremium 
          title="Entradas no Mês" 
          value={formatCurrency(d.monthly_incoming || 0)} 
          type="income"
          trend={incomeTrend}
        />
        <StatCardPremium 
          title="Saídas no Mês" 
          value={formatCurrency(d.monthly_outgoing || 0)} 
          type="expense"
          trend={expenseTrend}
        />
        <StatCardProgress 
          title="Consumo da Renda" 
          pct={spentPct} 
        />
      </div>

      {/* Main Charts Area */}
      <Card className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x border-surface-200 dark:border-surface-700/80 divide-surface-200 dark:divide-surface-700/80">
        
        {/* Evolution Chart */}
        <div className="lg:col-span-2 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Evolução Financeira (Anual)</h2>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineChartData.length ? lineChartData : [{name:'Jan', Receitas: 1000, Despesas: 500}]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Area type="monotone" dataKey="Receitas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Despesas" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                <Area type="monotone" dataKey="Ideal" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Pie */}
        <div className="p-6 flex flex-col">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Despesas por Categoria</h2>
          <p className="text-xs text-surface-400 mb-6">Mês atual</p>
          <div className="flex-1 min-h-[250px] relative w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Label */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-surface-800 dark:text-white mt-1">{formatCurrency(d.monthly_outgoing || 0)}</span>
                <span className="text-xs text-surface-400">Total</span>
             </div>
          </div>
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
             {pieChartData.slice(0,4).map((c, i) => (
               <div key={i} className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                 <span className="truncate">{c.name}</span>
               </div>
             ))}
          </div>
        </div>
      </Card>

      {/* Bottom Section: Unified Goals, Transactions and Annual Table */}
      <Card className="overflow-hidden border-surface-200 dark:border-surface-700/80 divide-y divide-surface-200 dark:divide-surface-700/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-200 dark:divide-surface-700/80">
          {/* Metas / Tracker Horizontal */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Objetivos Ativos</h2>
            {d.goals && d.goals.length > 0 ? (
              <div className="space-y-6">
                {d.goals.map((goal) => {
                  const pctOrg = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                  const pct = Math.min(pctOrg, 100)
                  let statusInfo = { icon: CheckCircle2, color: 'text-income-500', bg: 'bg-income-500' }
                  if (pct < 30) statusInfo = { icon: AlertCircle, color: 'text-warning-500', bg: 'bg-warning-500' }
                  else if (pct < 70) statusInfo = { icon: Clock, color: 'text-primary-500', bg: 'bg-primary-500' }

                  return (
                    <div key={goal.id} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                           <span className="font-bold text-sm text-surface-800 dark:text-surface-200">{goal.name}</span>
                           <div className="flex items-center gap-1.5 mt-1">
                              <statusInfo.icon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                              <span className="text-xs font-semibold text-surface-500">{Math.round(pct)}% concluído</span>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-surface-800 dark:text-surface-200">{formatCurrency(goal.current_amount)}</span>
                          <span className="text-xs font-medium text-surface-400 block">de {formatCurrency(goal.target_amount)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-100 dark:bg-surface-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${statusInfo.bg}`}
                          style={{ width: `${pct}%` }}
                        >
                           <div className="w-full h-full bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
               <p className="text-surface-400 text-sm py-4">Nenhuma meta configurada.</p>
            )}
          </div>

          {/* Transactions List Refined */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-surface-900 dark:text-white">Movimentações Recentes</h2>
               <button className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                  Ver todas
               </button>
            </div>
            
            {d.recent_transactions && d.recent_transactions.length > 0 ? (
              <div className="space-y-4">
                {d.recent_transactions.slice(0, 6).map((tx) => {
                   const isIncome = tx.type === 'income'
                   return (
                    <div key={tx.id} className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-income-50 dark:bg-income-500/10 text-income-500' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>
                          {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{tx.description}</p>
                          <p className="text-[11px] font-medium text-surface-400">{tx.category?.name || 'Geral'} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                         <span className={`text-sm font-bold ${isIncome ? 'text-income-600 dark:text-income-400' : 'text-surface-800 dark:text-surface-200'}`}>
                           {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                         </span>
                         <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-surface-400 hover:text-surface-600">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                   )
                })}
              </div>
            ) : (
              <p className="text-surface-400 text-sm text-center py-8">Nenhuma transação encontrada.</p>
            )}
          </div>
        </div>

        {/* Annual Summary Table Refined - Now integrated into the main card */}
        {d.annual_summary && d.annual_summary.length > 0 && (
          <div className="p-0 overflow-hidden">
            <div className="p-4 px-6 border-b border-surface-200 dark:border-surface-700/50 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/30">
              <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-500" />
                Balanço Anual {new Date().getFullYear()}
              </h2>
              <Badge variant="info">Ano Fiscal</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-50/80 dark:bg-surface-800 text-surface-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Período</th>
                    <th className="px-6 py-4 text-right">Entradas</th>
                    <th className="px-6 py-4 text-right">Saídas</th>
                    <th className="px-6 py-4 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50 tabular-nums">
                  {d.annual_summary.map((row, idx) => {
                    const isCurrentMonth = idx === new Date().getMonth()
                    const isPositive = row.balance >= 0
                    return (
                      <tr
                        key={row.monthNum}
                        className={`hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors ${isCurrentMonth ? 'bg-primary-50/30 dark:bg-primary-500/5' : 'bg-white dark:bg-surface-800'}`}
                      >
                        <td className="px-6 py-4 font-semibold text-surface-800 dark:text-surface-200 flex items-center gap-2">
                          {row.month}
                          {isCurrentMonth && <Badge variant="primary" className="text-[10px]">Atual</Badge>}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-surface-600 dark:text-surface-300">
                          {formatCurrency(row.income)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-surface-600 dark:text-surface-300">
                          {formatCurrency(row.expense)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${isPositive ? 'bg-income-50 dark:bg-income-500/10 text-income-600 dark:text-income-400' : 'bg-expense-50 dark:bg-expense-500/10 text-expense-600 dark:text-expense-400'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(row.balance)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

    </div>
  )
}

function StatCardPremium({ title, value, type, trend, isNegative }) {
  let icon, colorClass, bgClass
  if (type === 'balance') {
    icon = <Wallet className={`w-5 h-5 ${isNegative ? 'text-expense-500' : 'text-primary-500'}`} />
    colorClass = isNegative ? 'text-expense-600 dark:text-expense-400' : 'text-surface-900 dark:text-white'
    bgClass = isNegative ? 'bg-expense-50 dark:bg-expense-500/10' : 'bg-primary-50 dark:bg-primary-500/10'
  } else if (type === 'income') {
    icon = <ArrowUpRight className="w-5 h-5 text-income-500" />
    colorClass = 'text-income-600 dark:text-income-400'
    bgClass = 'bg-income-50 dark:bg-income-500/10 text-income-600'
  } else {
    icon = <ArrowDownRight className="w-5 h-5 text-expense-500" />
    colorClass = 'text-expense-600 dark:text-expense-400'
    bgClass = 'bg-expense-50 dark:bg-expense-500/10 text-expense-600'
  }

  const isPositiveTrend = trend ? trend.startsWith('+') : false

  return (
    <Card hover className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositiveTrend ? 'text-income-600 bg-income-50 dark:bg-income-500/10' : 'text-expense-600 bg-expense-50 dark:bg-expense-500/10'}`}>
            {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className={`text-2xl font-black tabular-nums ${colorClass}`}>{value}</h3>
      </div>
    </Card>
  )
}

function StatCardProgress({ title, pct }) {
  let color = 'bg-income-500'
  let label = 'Saudável'
  let variant = 'success'
  
  if (pct > 70 && pct <= 95) {
    color = 'bg-warning-500'
    label = 'Atenção'
    variant = 'warning'
  }
  if (pct > 95) {
    color = 'bg-expense-500'
    label = pct > 100 ? 'Estourado' : 'Crítico'
    variant = 'error'
  }

  return (
    <Card hover className="p-5 flex flex-col justify-between">
       <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300">
          <Percent className="w-5 h-5" />
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <div>
        <h3 className={`text-lg font-black leading-none ${pct > 70 ? 'text-expense-600 dark:text-expense-400' : 'text-income-600 dark:text-income-400'}`}>
          {pct}% de custo
        </h3>
        <p className="text-[11px] font-medium text-surface-500 dark:text-surface-400 mt-1 mb-2.5">O ideal é manter até 70% da renda</p>
        
        <div className="relative w-full bg-surface-200 dark:bg-surface-700/50 rounded-full h-2.5 overflow-hidden flex">
          {/* Marcador na posição 70% para facilitar compreensão visual */}
          <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-surface-400 dark:bg-surface-500 z-10" />
          
          {/* Base da barra: Verde se <= 70%, Amarelo se > 70% */}
          <div 
            className={`h-full transition-all duration-1000 ${pct > 70 ? 'bg-warning-500' : 'bg-income-500'}`} 
            style={{ width: `${Math.min(pct, 70)}%` }} 
          />
          
          {/* 'Estouro' da barra: Tudo que ultrapassar os 70% fica Vermelho */}
          {pct > 70 && (
            <div 
              className="h-full bg-expense-500 transition-all duration-1000" 
              style={{ width: `${Math.min(pct, 100) - 70}%` }} 
            />
          )}
        </div>
      </div>
    </Card>
  )
}
