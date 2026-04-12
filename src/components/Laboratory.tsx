import React from 'react';
import { 
  FlaskConical, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Exam } from '../types';

const exams: Exam[] = [
  { id: '1', patientId: 'p1', patientName: 'Maria Domingos', type: 'Hemograma Completo', status: 'ready', date: '2024-04-12', requester: 'Dr. Manuel Neto', result: 'Normal' },
  { id: '2', patientId: 'p2', patientName: 'João Afonso', type: 'Teste de Malária (Gota Espessa)', status: 'processing', date: '2024-04-12', requester: 'Dr. Manuel Neto' },
  { id: '3', patientId: 'p3', patientName: 'Teresa Bento', type: 'Glicémia em Jejum', status: 'pending', date: '2024-04-12', requester: 'Dra. Ana Silva' },
  { id: '4', patientId: 'p4', patientName: 'Manuel Kiala', type: 'Raio-X Tórax', status: 'ready', date: '2024-04-11', requester: 'Dr. Simão Pedro', result: 'Ver Laudo' },
];

export default function Laboratory() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exames e Laboratório</h1>
          <p className="text-slate-500 mt-1">Solicitação, processamento e visualização de resultados.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20">
          <Plus className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      {/* Lab Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Exames Pendentes', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Em Processamento', value: '08', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resultados Prontos', value: '45', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Lista de Exames</h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Pesquisar exames..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Tipo de Exame</th>
                <th className="px-6 py-4">Solicitante</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{exam.patientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-300" />
                      <span className="text-sm text-slate-600">{exam.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{exam.requester}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit",
                      exam.status === 'ready' ? "bg-emerald-50 text-emerald-600" :
                      exam.status === 'processing' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {exam.status === 'ready' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {exam.status === 'ready' ? 'Pronto' : exam.status === 'processing' ? 'Em Análise' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{exam.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {exam.status === 'ready' ? (
                        <>
                          <button className="p-2 hover:bg-white rounded-lg text-emerald hover:shadow-sm transition-all" title="Ver Resultado">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white rounded-lg text-slate-400" title="Baixar PDF">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button className="p-2 hover:bg-white rounded-lg text-slate-300 cursor-not-allowed">
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
