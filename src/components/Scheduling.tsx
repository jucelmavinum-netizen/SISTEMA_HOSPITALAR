import React from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  User,
  Loader2,
  CalendarDays,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  X,
  History
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
  const [isConsultationModalOpen, setIsConsultationModalOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null);
  const [viewTab, setViewTab] = React.useState<'active' | 'history'>('active');

  const [formData, setFormData] = React.useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'Consulta',
    notes: ''
  });

  const [consultationData, setConsultationData] = React.useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  const [triageData, setTriageData] = React.useState<any>(null);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: appData, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (full_name),
          profiles:doctor_id (full_name, role)
        `)
        .order('appointment_date', { ascending: true });
      
      if (fetchError) throw fetchError;

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
    } catch (err) {
      console.error('Error fetching scheduling data:', err);
    } finally {
      setIsLoading(false);
    }
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

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setIsSubmitting(true);

    try {
      // 1. Create Consultation Record
      const { error: consError } = await supabase
        .from('consultations')
        .insert([{
          appointment_id: selectedAppointment.id,
          patient_id: selectedAppointment.patient_id,
          doctor_id: selectedAppointment.doctor_id,
          triage_id: triageData?.id || null,
          symptoms: consultationData.symptoms,
          diagnosis: consultationData.diagnosis,
          prescription: consultationData.prescription,
          notes: consultationData.notes
        }]);

      if (consError) {
        console.error('Consultation Insert Error:', consError);
        throw new Error('Erro ao salvar os dados da consulta.');
      }

      // 2. Update Appointment Status
      const { error: appError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', selectedAppointment.id);

      if (appError) {
        console.error('Appointment Update Error:', appError);
        throw new Error('Erro ao atualizar o status do agendamento.');
      }

      alert('Atendimento finalizado com sucesso!');
      setIsConsultationModalOpen(false);
      setSelectedAppointment(null);
      setConsultationData({
        symptoms: '',
        diagnosis: '',
        prescription: '',
        notes: ''
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error completing consultation:', error);
      alert(error.message || 'Erro ao finalizar consulta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = (
      (app.patients?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (viewTab === 'active') {
      return app.status === 'scheduled' && matchesSearch;
    } else {
      return (app.status === 'completed' || app.status === 'cancelled') && matchesSearch;
    }
  });

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
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        title="Realizar Consulta Médica"
      >
        {selectedAppointment && (
          <form onSubmit={handleCompleteConsultation} className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{selectedAppointment.patients?.full_name}</h4>
                <p className="text-xs text-slate-500">Consulta de {selectedAppointment.type}</p>
              </div>
            </div>

            {triageData && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Dados da Triagem
                  </h5>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    triageData.classification === 'red' ? "bg-red-500 text-white" :
                    triageData.classification === 'orange' ? "bg-orange-500 text-white" :
                    triageData.classification === 'yellow' ? "bg-yellow-500 text-white" :
                    triageData.classification === 'green' ? "bg-green-500 text-white" :
                    "bg-blue-500 text-white"
                  )}>
                    {triageData.classification}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">PA</p>
                    <p className="text-sm font-bold text-slate-900">{triageData.blood_pressure}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Temp</p>
                    <p className="text-sm font-bold text-slate-900">{triageData.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Peso</p>
                    <p className="text-sm font-bold text-slate-900">{triageData.weight}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">FC</p>
                    <p className="text-sm font-bold text-slate-900">{triageData.heart_rate} bpm</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Sintomas / Queixas</label>
                <textarea
                  required
                  value={consultationData.symptoms}
                  onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-20 resize-none"
                  placeholder="Descreva os sintomas relatados..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Diagnóstico Clínico</label>
                <textarea
                  required
                  value={consultationData.diagnosis}
                  onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-20 resize-none"
                  placeholder="Diagnóstico final ou hipótese..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Prescrição Médica</label>
                <textarea
                  required
                  value={consultationData.prescription}
                  onChange={(e) => setConsultationData({ ...consultationData, prescription: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-24 resize-none"
                  placeholder="Medicamentos, dosagem e duração..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Notas Adicionais</label>
                <textarea
                  value={consultationData.notes}
                  onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-20 resize-none"
                  placeholder="Observações internas..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Finalizar Atendimento e Salvar
            </button>
          </form>
        )}
      </Modal>

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
              <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {viewTab === 'active' ? 'Agenda do Dia' : 'Histórico de Atendimentos'}
                  </h3>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setViewTab('active')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        viewTab === 'active' ? "bg-white text-emerald shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Agendados
                    </button>
                    <button 
                      onClick={() => setViewTab('history')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        viewTab === 'history' ? "bg-white text-emerald shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Histórico
                    </button>
                  </div>
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
                      <th className="px-6 py-4">Data/Hora</th>
                      <th className="px-6 py-4">Paciente</th>
                      <th className="px-6 py-4">Médico</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <Calendar className="w-4 h-4 text-slate-300" />
                              {new Date(app.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Clock className="w-4 h-4 text-slate-300" />
                              {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
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
                          <div className="flex items-center justify-end gap-2">
                            {app.status === 'scheduled' && (
                              <button 
                                onClick={async () => {
                                  setSelectedAppointment(app);
                                  // Fetch triage data for this patient
                                  const { data: triage } = await supabase
                                    .from('triage_records')
                                    .select('*')
                                    .eq('patient_id', app.patient_id)
                                    .order('created_at', { ascending: false })
                                    .limit(1)
                                    .single();
                                  
                                  if (triage) {
                                    setTriageData(triage);
                                    setConsultationData(prev => ({
                                      ...prev,
                                      symptoms: triage.symptoms || ''
                                    }));
                                  } else {
                                    setTriageData(null);
                                  }
                                  setIsConsultationModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-emerald text-white rounded-lg text-xs font-bold hover:bg-emerald/90 transition-all flex items-center gap-1"
                              >
                                <Stethoscope className="w-3 h-3" />
                                Atender
                              </button>
                            )}
                            {app.status === 'scheduled' && (
                              <button 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (!window.confirm('Tem certeza que deseja cancelar definitivamente este agendamento?')) return;
                                  
                                  const { error } = await supabase
                                    .from('appointments')
                                    .update({ status: 'cancelled' })
                                    .eq('id', app.id);
                                    
                                  if (error) {
                                    console.error('Error cancelling appointment:', error);
                                    alert('Erro ao cancelar agendamento: ' + error.message);
                                  } else {
                                    alert('Agendamento cancelado com sucesso.');
                                    await fetchData();
                                  }
                                }}
                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" 
                                title="Cancelar Agendamento"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      {viewTab === 'active' ? <Calendar className="w-8 h-8 text-slate-300" /> : <History className="w-8 h-8 text-slate-300" />}
                    </div>
                    <p className="text-slate-400 font-medium">
                      {viewTab === 'active' 
                        ? 'Nenhuma consulta agendada para hoje.' 
                        : 'O histórico de atendimentos está vazio.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
