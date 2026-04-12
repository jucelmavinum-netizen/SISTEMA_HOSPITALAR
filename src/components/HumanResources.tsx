import React from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  Search,
  Filter,
  MoreVertical,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const staffOnDuty = [
  { name: 'Dr. Manuel Neto', role: 'Médico Chefe', service: 'Banco de Urgência', status: 'present', since: '08:00' },
  { name: 'Enf. Maria João', role: 'Enfermeira Chefe', service: 'Triagem', status: 'present', since: '07:30' },
  { name: 'Dr. Simão Pedro', role: 'Médico Especialista', service: 'Cirurgia', status: 'present', since: '09:00' },
  { name: 'Enf. José Bento', role: 'Enfermeiro de Piquete', service: 'Maternidade', status: 'on-call', since: '-' },
];

export default function HumanResources() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recursos Humanos e Escalas</h1>
          <p className="text-slate-500 mt-1">Gestão de pessoal, escalas de piquete e presença.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Ver Escala Mensal
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all">
            Lançar Piquete
          </button>
        </div>
      </div>

      {/* Duty Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-navy" />
              Chefia de Serviço (Turno Atual)
            </h3>
            <span className="text-xs font-bold text-slate-400">Turno: 08:00 - 16:00</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffOnDuty.filter(s => s.role.includes('Chefe')).map((staff, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{staff.name}</h4>
                  <p className="text-xs text-emerald font-bold uppercase tracking-wider">{staff.role}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{staff.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Presença em Tempo Real</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-600">Presentes</span>
              </div>
              <span className="font-bold">42</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-slate-600">De Piquete (On-call)</span>
              </div>
              <span className="font-bold">08</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-slate-600">Ausentes/Faltas</span>
              </div>
              <span className="font-bold">03</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Pesquisar funcionário..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" />
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Funcionário</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Serviço/Ala</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Entrada</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffOnDuty.map((staff, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{staff.role}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{staff.service}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      staff.status === 'present' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {staff.status === 'present' ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {staff.status === 'present' ? 'Presente' : 'De Piquete'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{staff.since}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg text-slate-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
