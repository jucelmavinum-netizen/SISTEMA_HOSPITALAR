import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Finance() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500 mt-1">Controle de faturação, convênios e tesouraria.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Relatório de Caixa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all">
            Nova Fatura
          </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Receita Total (Mês)', value: '4.250.000 Kz', trend: '+8.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Faturas Pendentes', value: '850.000 Kz', trend: '+12%', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Glosa de Convênios', value: '125.000 Kz', trend: '-2.4%', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Billing Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Faturação Recente</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Pesquisar fatura..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Fatura</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Convênio</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'FAT-2024-001', patient: 'António Manuel', plan: 'ENSA', amount: '45.000 Kz', status: 'paid' },
                  { id: 'FAT-2024-002', patient: 'Maria Bento', plan: 'Particular', amount: '12.500 Kz', status: 'pending' },
                  { id: 'FAT-2024-003', patient: 'Simão Pedro', plan: 'Nossa Seguros', amount: '85.200 Kz', status: 'paid' },
                  { id: 'FAT-2024-004', patient: 'Teresa Afonso', plan: 'ENSA', amount: '32.000 Kz', status: 'overdue' },
                ].map((fat, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{fat.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{fat.patient}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{fat.plan}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{fat.amount}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        fat.status === 'paid' ? "bg-emerald-50 text-emerald-600" :
                        fat.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                      )}>
                        {fat.status === 'paid' ? 'Pago' : fat.status === 'pending' ? 'Pendente' : 'Vencido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance Plans */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Convênios Ativos
          </h3>
          <div className="space-y-4">
            {[
              { name: 'ENSA', share: 45, color: 'bg-blue-500' },
              { name: 'Nossa Seguros', share: 25, color: 'bg-emerald-500' },
              { name: 'Particular', share: 20, color: 'bg-amber-500' },
              { name: 'Outros', share: 10, color: 'bg-slate-400' },
            ].map((plan, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{plan.name}</span>
                  <span className="text-slate-400 font-bold">{plan.share}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", plan.color)}
                    style={{ width: `${plan.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-navy transition-colors" />
                <span className="text-sm font-bold text-slate-700">Tabela de Preços</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-navy transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
