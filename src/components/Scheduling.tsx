import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Appointment } from '../types';

const appointments: Appointment[] = [
  { id: '1', patientId: 'p1', patientName: 'Maria Domingos', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T09:00:00', status: 'waiting', type: 'Consulta' },
  { id: '2', patientId: 'p2', patientName: 'João Afonso', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T09:30:00', status: 'scheduled', type: 'Retorno' },
  { id: '3', patientId: 'p3', patientName: 'Teresa Bento', doctorId: 'd2', doctorName: 'Dra. Ana Silva', dateTime: '2024-04-12T10:00:00', status: 'scheduled', type: 'Consulta' },
  { id: '4', patientId: 'p4', patientName: 'Manuel Kiala', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T10:30:00', status: 'completed', type: 'Exame' },
];

export default function Scheduling() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agendamento e Consultas</h1>
          <p className="text-slate-500 mt-1">Gestão de marcações, horários e disponibilidade médica.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20">
          <Plus className="w-5 h-5" />
          Marcar Consulta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Abril 2024</h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 30 }).map((_, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                    i + 1 === 12 ? "bg-navy text-white font-bold" : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Médicos Disponíveis</h3>
            <div className="space-y-3">
              {[
                { name: 'Dr. Manuel Neto', specialty: 'Clínica Geral', available: true },
                { name: 'Dra. Ana Silva', specialty: 'Pediatria', available: true },
                { name: 'Dr. Simão Pedro', specialty: 'Cirurgia', available: false },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {doc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                      doc.available ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-900">Agenda do Dia</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">12 de Abril</span>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Pesquisar agenda..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Horário</th>
                    <th className="px-6 py-4">Paciente</th>
                    <th className="px-6 py-4">Médico</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                          <Clock className="w-4 h-4 text-slate-300" />
                          {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald/10 text-emerald rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{app.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{app.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">{app.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          app.status === 'waiting' ? "bg-amber-50 text-amber-600" :
                          app.status === 'scheduled' ? "bg-blue-50 text-blue-600" :
                          app.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {app.status === 'waiting' ? 'Na Espera' : app.status === 'scheduled' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </span>
                      </td>
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
      </div>
    </div>
  );
}
