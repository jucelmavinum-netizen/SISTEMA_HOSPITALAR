import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  User,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import Modal from './ui/Modal';

const appointments: Appointment[] = [
  { id: '1', patientId: 'p1', patientName: 'Maria Domingos', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T09:00:00', status: 'waiting', type: 'Consulta' },
  { id: '2', patientId: 'p2', patientName: 'João Afonso', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T09:30:00', status: 'scheduled', type: 'Retorno' },
  { id: '3', patientId: 'p3', patientName: 'Teresa Bento', doctorId: 'd2', doctorName: 'Dra. Ana Silva', dateTime: '2024-04-12T10:00:00', status: 'scheduled', type: 'Consulta' },
  { id: '4', patientId: 'p4', patientName: 'Manuel Kiala', doctorId: 'd1', doctorName: 'Dr. Manuel Neto', dateTime: '2024-04-12T10:30:00', status: 'completed', type: 'Exame' },
];

export default function Scheduling() {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'Consulta',
    notes: ''
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: appData } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (full_name),
        profiles:doctor_id (full_name, role)
      `)
      .order('appointment_date');
    
    const { data: docData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor');

    const { data: patData } = await supabase
      .from('patients')
      .select('id, full_name')
      .order('full_name');

    if (appData) setAppointments(appData);
    if (docData) setDoctors(docData);
    if (patData) setPatients(patData);
    setIsLoading(false);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_date: dateTime,
          status: 'scheduled',
          type: formData.type,
          notes: formData.notes
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        type: 'Consulta',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erro ao marcar consulta. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agendamento e Consultas</h1>
          <p className="text-slate-500 mt-1">Gestão de marcações, horários e disponibilidade médica.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20"
        >
          <Plus className="w-5 h-5" />
          Marcar Consulta
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Marcar Nova Consulta"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
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
            <label className="text-xs font-bold text-slate-500 uppercase">Médico</label>
            <select
              required
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Médico</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name} ({d.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
              <input
                required
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Horário</label>
              <input
                required
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Atendimento</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="Consulta">Consulta</option>
              <option value="Retorno">Retorno</option>
              <option value="Exame">Exame</option>
              <option value="Urgência">Urgência</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Notas Adicionais</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-24 resize-none"
              placeholder="Motivo da consulta, observações..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald text-white rounded-2xl font-bold hover:bg-emerald/90 transition-all shadow-lg shadow-emerald/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarDays className="w-5 h-5" />}
            Confirmar Agendamento
          </button>
        </form>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
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
                {doctors.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {doc.full_name.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{doc.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.role}</p>
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
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Hoje</span>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar agenda..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" 
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Horário</th>
                      <th className="px-6 py-4">Paciente</th>
                      <th className="px-6 py-4">Médico</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Clock className="w-4 h-4 text-slate-300" />
                            {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald/10 text-emerald rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{app.patients?.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{app.profiles?.full_name}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            app.status === 'scheduled' ? "bg-blue-50 text-blue-600" :
                            app.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                            "bg-red-50 text-red-600"
                          )}>
                            {app.status === 'scheduled' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-white rounded-lg text-slate-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Nenhuma consulta agendada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
