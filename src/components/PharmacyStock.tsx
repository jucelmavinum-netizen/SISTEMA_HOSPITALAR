import React from 'react';
import { 
  Pill, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ShoppingCart,
  Search,
  Plus,
  ArrowDown
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

const stockData = [
  { name: 'Artesunato', stock: 450, min: 1000, status: 'critical' },
  { name: 'Paracetamol', stock: 2500, min: 2000, status: 'normal' },
  { name: 'Amoxicilina', stock: 120, min: 500, status: 'critical' },
  { name: 'Luvas Látex', stock: 8000, min: 5000, status: 'normal' },
  { name: 'Seringas 5ml', stock: 300, min: 1500, status: 'critical' },
];

const expiryData = [
  { month: 'Abr', count: 12 },
  { month: 'Mai', count: 45 },
  { month: 'Jun', count: 28 },
  { month: 'Jul', count: 110 },
  { month: 'Ago', count: 65 },
];

export default function PharmacyStock() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Farmácia e Stock</h1>
          <p className="text-slate-500 mt-1">Controle de medicamentos, consumíveis e validade.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <ShoppingCart className="w-4 h-4" />
            Requisição Digital
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all">
            <Plus className="w-4 h-4" />
            Entrada de Stock
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Ruptura de Stock (Crítico)
            </h3>
            <button className="text-sm font-bold text-emerald hover:underline">Ver todos</button>
          </div>
          
          <div className="space-y-4">
            {stockData.filter(i => i.status === 'critical').map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Pill className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">Stock atual: <span className="text-red-600 font-bold">{item.stock} un</span> / Mínimo: {item.min} un</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
                  Pedir Agora
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            Vencimento Próximo
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 50 ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">Medicamentos a vencer nos próximos 5 meses.</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Pesquisar no inventário..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" />
          </div>
          <div className="flex gap-4">
            <select className="bg-slate-50 border-none text-xs font-bold rounded-xl px-4 py-2 outline-none">
              <option>Todos os Tipos</option>
              <option>Medicamentos</option>
              <option>Consumíveis</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Stock Atual</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Última Entrada</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Paracetamol 500mg', cat: 'Medicamento', stock: 2500, status: 'ok', date: '12 Abr 2024' },
                { name: 'Soro Fisiológico', cat: 'Consumível', stock: 450, status: 'warning', date: '10 Abr 2024' },
                { name: 'Insulina', cat: 'Medicamento', stock: 85, status: 'critical', date: '08 Abr 2024' },
                { name: 'Máscaras Cirúrgicas', cat: 'Consumível', stock: 12000, status: 'ok', date: '11 Abr 2024' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.cat}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{item.stock}</span>
                      <ArrowDown className={cn("w-3 h-3", item.status === 'ok' ? "text-slate-300" : "text-red-500")} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === 'ok' ? "bg-emerald-500" : item.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                    )} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{item.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-navy hover:underline">Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
