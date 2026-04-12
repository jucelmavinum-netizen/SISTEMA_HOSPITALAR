import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const waitTimeData = [
  { sector: 'Triagem', time: 15, capacity: 45 },
  { sector: 'Banco de Urgência', time: 120, capacity: 95 },
  { sector: 'Pediatria', time: 45, capacity: 60 },
  { sector: 'Ortopedia', time: 30, capacity: 30 },
  { sector: 'Ginecologia', time: 60, capacity: 50 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Enchentes</h1>
          <p className="text-slate-500 mt-1">Monitoramento em tempo real da unidade hospitalar.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          Última atualização: 09:45:12
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pacientes em Espera', value: '124', icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tempo Médio de Espera', value: '45 min', icon: Clock, trend: '-5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ocupação Geral', value: '82%', icon: TrendingUp, trend: '+3%', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Alertas Ativos', value: '03', icon: AlertTriangle, trend: 'Estável', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className={cn(
                "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                stat.trend.startsWith('+') ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wait Time Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Tempo Médio de Espera por Setor (min)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="sector" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="time" radius={[6, 6, 0, 0]} barSize={40}>
                  {waitTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.time > 60 ? '#ef4444' : '#1e3a8a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Alerts */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Alertas de Capacidade</h3>
          <div className="space-y-4">
            {waitTimeData.sort((a, b) => b.capacity - a.capacity).map((sector) => (
              <div key={sector.sector} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{sector.sector}</span>
                  <span className={cn(
                    "font-bold",
                    sector.capacity > 90 ? "text-red-600" : sector.capacity > 70 ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {sector.capacity}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.capacity}%` }}
                    className={cn(
                      "h-full rounded-full",
                      sector.capacity > 90 ? "bg-red-500" : sector.capacity > 70 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
                {sector.capacity > 90 && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Capacidade Crítica - Redirecionar Fluxo
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
