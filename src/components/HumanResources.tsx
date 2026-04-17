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
  Shield,
  Loader2,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

const staffOnDuty = [
  { name: 'Dr. Manuel Neto', role: 'Médico Chefe', service: 'Banco de Urgência', status: 'present', since: '08:00' },
  { name: 'Enf. Maria João', role: 'Enfermeira Chefe', service: 'Triagem', status: 'present', since: '07:30' },
  { name: 'Dr. Simão Pedro', role: 'Médico Especialista', service: 'Cirurgia', status: 'present', since: '09:00' },
  { name: 'Enf. José Bento', role: 'Enfermeiro de Piquete', service: 'Maternidade', status: 'on-call', since: '-' },
];

export default function HumanResources() {
  const [staff, setStaff] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = React.useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = React.useState<any>({});

  const [formData, setFormData] = React.useState({
    full_name: '',
    role: 'doctor',
    hospital_name: 'Hospital Geral de Luanda',
    shift: '08:00 - 16:00 (Manhã)',
    specialty: '',
    license_number: '',
    contract_type: 'contracted',
    status: 'present',
    attendance_type: 'absence',
    attendance_reason: '',
    attendance_date: new Date().toISOString().split('T')[0]
  });

  const shifts = [
    '08:00 - 16:00 (Manhã)',
    '16:00 - 00:00 (Tarde)',
    '00:00 - 08:00 (Noite)',
    'Piquete (On-call)'
  ];

  React.useEffect(() => {
    fetchStaff();
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance_records')
      .select('*');
    if (data) {
      setAttendanceRecords(data);
      
      // Process stats
      const stats: any = {};
      data.forEach(rec => {
        if (!stats[rec.staff_id]) stats[rec.staff_id] = { week: 0, month: 0 };
        const recDate = new Date(rec.date);
        const now = new Date();
        
        // This Month
        if (recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear()) {
          stats[rec.staff_id].month++;
        }
        
        // This Week (simple check)
        const diff = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
        if (diff <= 7) {
          stats[rec.staff_id].week++;
        }
      });
      setAttendanceStats(stats);
    }
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (!error) setStaff(data || []);
    setIsLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          full_name: formData.full_name,
          role: formData.role,
          hospital_name: formData.hospital_name,
          shift: formData.shift,
          specialty: formData.specialty,
          license_number: formData.license_number,
          contract_type: formData.contract_type,
          status: formData.status,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({
        full_name: '',
        role: 'doctor',
        hospital_name: 'Hospital Geral de Luanda'
      });
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Erro ao adicionar funcionário. Verifique se o banco de dados está configurado corretamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Utilizador não autenticado');

      const { error } = await supabase
        .from('attendance_records')
        .insert([{
          staff_id: selectedStaff.id,
          type: formData.attendance_type,
          reason: formData.attendance_reason,
          date: formData.attendance_date,
          recorded_by: user?.id
        }]);

      if (error) throw error;

      alert('Sucesso! Registro de ' + (formData.attendance_type === 'absence' ? 'falta' : 'atraso') + ' guardado para ' + selectedStaff.full_name);
      
      // Reset form fields but keep modal open for a second to show success? No, close it.
      setFormData(prev => ({ ...prev, attendance_reason: '' }));
      setIsAttendanceModalOpen(false);
      
      // Force refresh
      await fetchAttendance();
    } catch (error: any) {
      console.error('Error adding attendance:', error);
      alert('Erro ao registrar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const staffOnDuty = staff.filter(s => s.status === 'present').slice(0, 4);

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          hospital_name: formData.hospital_name,
          shift: formData.shift,
          specialty: formData.specialty,
          license_number: formData.license_number,
          contract_type: formData.contract_type,
          status: formData.status
        })
        .eq('id', selectedStaff.id);

      if (error) throw error;

      alert('Funcionário atualizado com sucesso!');
      setIsDetailsModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Erro ao atualizar funcionário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (s: any) => {
    setSelectedStaff(s);
    setFormData({
      full_name: s.full_name,
      role: s.role,
      hospital_name: s.hospital_name || 'Hospital Geral de Luanda',
      shift: s.shift || '08:00 - 16:00 (Manhã)',
      specialty: s.specialty || '',
      license_number: s.license_number || '',
      contract_type: s.contract_type || 'contracted',
      status: s.status || 'present'
    } as any);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja remover ${name} do quadro de pessoal?`)) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      alert('Funcionário removido com sucesso.');
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Erro ao remover funcionário.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recursos Humanos e Escalas</h1>
          <p className="text-slate-500 mt-1">Gestão de pessoal, escalas de piquete e presença.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Funcionário
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Novo Funcionário"
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
            <input
              required
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              placeholder="Ex: Dr. António Manuel"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Função</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="doctor">Médico(a)</option>
              <option value="nurse">Enfermeiro(a)</option>
              <option value="admin">Administrativo</option>
              <option value="lab_tech">Técnico de Laboratório</option>
              <option value="pharmacist">Farmacêutico(a)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Hospital / Unidade</label>
            <input
              required
              type="text"
              value={formData.hospital_name}
              onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Especialidade</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: Pediatria"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nº Reg. Profissional</label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: 12345/AGO"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Vínculo Contratual</label>
            <div className="flex gap-4">
              {['contracted', 'on-call'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, contract_type: type })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs uppercase",
                    formData.contract_type === type 
                      ? "border-navy bg-navy/5 text-navy"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {type === 'contracted' ? 'Contratado' : 'Plantonista'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Turno / Escala</label>
            <select
              required
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              {shifts.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Confirmar Cadastro
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes e Gestão do Funcionário"
      >
        <form onSubmit={handleUpdateStaff} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input
                required
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Função</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              >
                <option value="doctor">Médico(a)</option>
                <option value="nurse">Enfermeiro(a)</option>
                <option value="admin">Administrativo</option>
                <option value="lab_tech">Técnico de Laboratório</option>
                <option value="pharmacist">Farmacêutico(a)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Especialidade</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: Pediatria"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nº Reg. Profissional</label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: 12345/AGO"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Vínculo Contratual</label>
            <div className="flex gap-4">
              {['contracted', 'on-call'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, contract_type: type })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold border-2 transition-all text-xs uppercase",
                    formData.contract_type === type 
                      ? "border-navy bg-navy/5 text-navy"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {type === 'contracted' ? 'Contratado' : 'Plantonista'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Turno / Escala de Serviço</label>
            <div className="grid grid-cols-2 gap-3">
              {shifts.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, shift: s })}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 text-xs font-bold uppercase transition-all",
                    formData.shift === s 
                      ? "border-navy bg-navy text-white shadow-lg" 
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Status de Presença</label>
            <div className="flex gap-3">
              {[
                { id: 'present', label: 'Presente', color: 'bg-emerald-500' },
                { id: 'on-call', label: 'De Piquete', color: 'bg-amber-500' },
                { id: 'absent', label: 'Ausente', color: 'bg-red-500' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: st.id })}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all",
                    formData.status === st.id 
                      ? "border-slate-800 bg-white" 
                      : "border-slate-100 text-slate-400"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", st.color)} />
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={() => {
                if (selectedStaff) handleDeleteStaff(selectedStaff.id, selectedStaff.full_name);
                setIsDetailsModalOpen(false);
              }}
              className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <UserX className="w-5 h-5" />
              Remover
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              Guardar Alterações
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Registar Falta ou Atraso"
      >
        <form onSubmit={handleAddAttendance} className="space-y-4">
          {selectedStaff && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-4 text-center">
              <p className="text-[10px] font-bold text-red-600 uppercase">Funcionário</p>
              <p className="text-lg font-bold text-slate-900">{selectedStaff.full_name}</p>
              <div className="mt-2 flex justify-center gap-4 text-xs font-bold text-red-800 opacity-60">
                <span>Total Mês: {attendanceStats[selectedStaff.id]?.month || 0}</span>
                <span>Total Semana: {attendanceStats[selectedStaff.id]?.week || 0}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
              <select
                value={formData.attendance_type}
                onChange={(e) => setFormData({ ...formData, attendance_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-red-500 rounded-xl outline-none text-sm transition-all"
              >
                <option value="absence">Falta Integral</option>
                <option value="late">Atraso</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
              <input
                type="date"
                value={formData.attendance_date}
                onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-red-500 rounded-xl outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Motivo / Justificativa</label>
            <textarea
              required
              value={formData.attendance_reason}
              onChange={(e) => setFormData({ ...formData, attendance_reason: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-red-500 rounded-xl outline-none text-sm transition-all h-24 resize-none"
              placeholder="Ex: Motivos de saúde, atraso no transporte, etc..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <UserX className="w-5 h-5" />
                Confirmar Registro de Falta
              </>
            )}
          </button>
        </form>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
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
          {staffOnDuty.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                {s.full_name.split(' ').map((n: any) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{s.full_name}</h4>
                <p className="text-xs text-emerald font-bold uppercase tracking-wider">{s.role}</p>
                <p className="text-[10px] text-slate-400 mt-1">{s.shift || '08:00 - 16:00'}</p>
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
                  <span className="font-bold">{staff.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-slate-600">De Piquete (On-call)</span>
                  </div>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-slate-600">Ausentes/Faltas</span>
                  </div>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar funcionário..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" 
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-navy transition-all"
                >
                  <option value="all">Todas Funções</option>
                  <option value="doctor">Médicos</option>
                  <option value="nurse">Enfermeiros</option>
                  <option value="admin">Administrativos</option>
                  <option value="lab_tech">Laboratório</option>
                  <option value="pharmacist">Farmácia</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-navy transition-all"
                >
                  <option value="all">Todos Status</option>
                  <option value="present">Presentes</option>
                  <option value="on-call">De Piquete</option>
                  <option value="absent">Ausentes</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Funcionário</th>
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Turno</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {s.full_name.split(' ').map((n: any) => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{s.role}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{s.hospital_name || 'Hospital Geral'}</td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          s.status === 'present' ? "bg-emerald-50 text-emerald-600" :
                          s.status === 'on-call' ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {s.status === 'present' ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {s.status === 'present' ? 'Presente' : s.status === 'on-call' ? 'De Piquete' : 'Ausente'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{s.shift || '08:00 - 16:00'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-red-500">Mês: {attendanceStats[s.id]?.month || 0}</span>
                          <span className="text-[10px] font-bold text-amber-500">Semana: {attendanceStats[s.id]?.week || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setSelectedStaff(s);
                              setIsAttendanceModalOpen(true);
                            }}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                            title="Registar Falta/Atraso"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleActionClick(s)}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-navy transition-colors"
                            title="Ver Detalhes / Mudar Turno"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(s.id, s.full_name)}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Remover"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
