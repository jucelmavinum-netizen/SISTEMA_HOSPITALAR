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
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    full_name: '',
    role: 'doctor',
    hospital_name: 'Hospital Geral de Luanda'
  });

  React.useEffect(() => {
    fetchStaff();
  }, []);

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
      // Note: This only adds to profiles, doesn't create a Supabase Auth user.
      // In a real app, this would be handled by an admin invite or similar.
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(), // Temporary ID since we aren't creating an auth user here
          full_name: formData.full_name,
          role: formData.role,
          hospital_name: formData.hospital_name
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
      alert('Erro ao adicionar funcionário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffOnDuty = staff.slice(0, 4); // Simulated duty for now

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
                      <p className="text-[10px] text-slate-400 mt-1">{s.hospital_name || 'Hospital Geral'}</p>
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
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Entrada</th>
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
                          "bg-emerald-50 text-emerald-600"
                        )}>
                          <UserCheck className="w-3 h-3" />
                          Presente
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">08:00</td>
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
        </>
      )}
    </div>
  );
}
