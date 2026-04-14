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
  Plus,
  Loader2,
  Beaker
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Exam } from '../types';
import Modal from './ui/Modal';

const exams: Exam[] = [
  { id: '1', patientId: 'p1', patientName: 'Maria Domingos', type: 'Hemograma Completo', status: 'ready', date: '2024-04-12', requester: 'Dr. Manuel Neto', result: 'Normal' },
  { id: '2', patientId: 'p2', patientName: 'João Afonso', type: 'Teste de Malária (Gota Espessa)', status: 'processing', date: '2024-04-12', requester: 'Dr. Manuel Neto' },
  { id: '3', patientId: 'p3', patientName: 'Teresa Bento', type: 'Glicémia em Jejum', status: 'pending', date: '2024-04-12', requester: 'Dra. Ana Silva' },
  { id: '4', patientId: 'p4', patientName: 'Manuel Kiala', type: 'Raio-X Tórax', status: 'ready', date: '2024-04-11', requester: 'Dr. Simão Pedro', result: 'Ver Laudo' },
];

export default function Laboratory() {
  const [exams, setExams] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    patient_id: '',
    exam_type: '',
    requester_id: '',
    priority: 'normal',
    notes: ''
  });

  React.useEffect(() => {
    fetchExams();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: patData } = await supabase
      .from('patients')
      .select('id, full_name')
      .order('full_name');
    
    const { data: docData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'doctor');

    if (patData) setPatients(patData);
    if (docData) setDoctors(docData);
  };

  const fetchExams = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        patients (full_name),
        profiles:requester_id (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (!error) setExams(data || []);
    setIsLoading(false);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('exams')
        .insert([{
          patient_id: formData.patient_id,
          exam_type: formData.exam_type,
          requester_id: formData.requester_id,
          status: 'pending',
          notes: formData.notes
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        exam_type: '',
        requester_id: '',
        priority: 'normal',
        notes: ''
      });
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Erro ao solicitar exame. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exames e Laboratório</h1>
          <p className="text-slate-500 mt-1">Solicitação, processamento e visualização de resultados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20"
        >
          <Plus className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Solicitação de Exame"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Paciente</label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Paciente</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Exame</label>
            <input
              required
              type="text"
              placeholder="Ex: Hemograma, Malária, Raio-X..."
              value={formData.exam_type}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Médico Solicitante</label>
            <select
              required
              value={formData.requester_id}
              onChange={(e) => setFormData({ ...formData, requester_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Médico</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Observações Clínicas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-24 resize-none"
              placeholder="Sintomas, justificativa do exame..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald text-white rounded-2xl font-bold hover:bg-emerald/90 transition-all shadow-lg shadow-emerald/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Beaker className="w-5 h-5" />}
            Solicitar Exame
          </button>
        </form>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
          {/* Lab Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Exames Pendentes', value: exams.filter(e => e.status === 'pending').length.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Em Processamento', value: exams.filter(e => e.status === 'processing').length.toString(), icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Resultados Prontos', value: exams.filter(e => e.status === 'ready').length.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar exames..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" 
                />
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
                  {filteredExams.length > 0 ? filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{exam.patients?.full_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-300" />
                          <span className="text-sm text-slate-600">{exam.exam_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{exam.profiles?.full_name}</td>
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
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </td>
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
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhum exame encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
