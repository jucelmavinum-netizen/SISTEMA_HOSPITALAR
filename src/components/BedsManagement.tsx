import React from 'react';
import { 
  Bed, 
  Users, 
  ArrowRightLeft, 
  LogOut, 
  Filter,
  MoreVertical,
  AlertCircle,
  Loader2,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

const wards = [
  { id: 'pediatria', name: 'Pediatria', total: 20, occupied: 18, critical: 2 },
  { id: 'maternidade', name: 'Maternidade', total: 30, occupied: 12, critical: 0 },
  { id: 'cirurgia', name: 'Cirurgia', total: 15, occupied: 14, critical: 5 },
  { id: 'urgencia', name: 'Banco de Urgência', total: 40, occupied: 38, critical: 10 },
];

const bedsData = [
  { id: 'P01', ward: 'Pediatria', patient: 'Joãozinho Manuel', status: 'occupied', since: '2 dias' },
  { id: 'P02', ward: 'Pediatria', patient: 'Maria Bento', status: 'occupied', since: '5 dias' },
  { id: 'P03', ward: 'Pediatria', patient: null, status: 'available', since: '1 hora' },
  { id: 'M01', ward: 'Maternidade', patient: 'Teresa Afonso', status: 'occupied', since: '12 horas' },
  { id: 'M02', ward: 'Maternidade', patient: null, status: 'cleaning', since: '30 min' },
  { id: 'C01', ward: 'Cirurgia', patient: 'Simão Pedro', status: 'occupied', since: '1 dia' },
];

export default function BedsManagement() {
  const [beds, setBeds] = React.useState<any[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedWard, setSelectedWard] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [selectedBed, setSelectedBed] = React.useState<any>(null);

  const [formData, setFormData] = React.useState({
    patient_id: '',
    bed_id: '',
    notes: '',
    new_bed_id: ''
  });

  React.useEffect(() => {
    fetchBeds();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, full_name, process_number')
      .order('full_name');
    if (data) setPatients(data);
  };

  const fetchBeds = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('beds')
      .select(`
        *,
        patients (full_name, process_number)
      `)
      .order('id');
    
    if (!error && data && data.length > 0) {
      setBeds(data);
    } else {
      // Seed some demo beds if table is empty
      const initialBeds = [
        { id: 'PED-01', ward: 'Pediatria', status: 'available', last_updated: new Date().toISOString() },
        { id: 'PED-02', ward: 'Pediatria', status: 'available', last_updated: new Date().toISOString() },
        { id: 'MAT-01', ward: 'Maternidade', status: 'available', last_updated: new Date().toISOString() },
        { id: 'MAT-02', ward: 'Maternidade', status: 'available', last_updated: new Date().toISOString() },
        { id: 'CIR-01', ward: 'Cirurgia', status: 'available', last_updated: new Date().toISOString() },
        { id: 'URG-01', ward: 'Urgência', status: 'available', last_updated: new Date().toISOString() },
      ];
      
      // Try to insert them into DB
      const { error: insertError } = await supabase.from('beds').insert(initialBeds);
      if (!insertError) {
        const { data: newData } = await supabase.from('beds').select('*, patients(full_name, process_number)').order('id');
        if (newData) setBeds(newData);
      } else {
        setBeds(initialBeds);
      }
    }
    setIsLoading(false);
  };

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('beds')
        .update({
          patient_id: formData.patient_id,
          status: 'occupied',
          last_updated: new Date().toISOString()
        })
        .eq('id', formData.bed_id);

      if (error) throw error;

      alert('Internamento realizado com sucesso!');
      setIsModalOpen(false);
      setFormData({
        patient_id: '',
        bed_id: '',
        notes: ''
      });
      fetchBeds();
    } catch (error) {
      console.error('Error admitting patient:', error);
      alert('Erro ao realizar internamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBedStatus = async (bedId: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('beds')
        .update({
          status,
          last_updated: new Date().toISOString(),
          ...(status === 'available' || status === 'cleaning' ? { patient_id: null } : {})
        })
        .eq('id', bedId);

      if (error) throw error;
      setIsStatusModalOpen(false);
      fetchBeds();
    } catch (error) {
      console.error('Error updating bed status:', error);
      alert('Erro ao atualizar status do leito.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !formData.new_bed_id) return;
    setIsSubmitting(true);

    try {
      // 1. Clear old bed
      await supabase
        .from('beds')
        .update({
          patient_id: null,
          status: 'cleaning',
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedBed.id);

      // 2. Populate new bed
      const { error } = await supabase
        .from('beds')
        .update({
          patient_id: selectedBed.patient_id,
          status: 'occupied',
          last_updated: new Date().toISOString()
        })
        .eq('id', formData.new_bed_id);

      if (error) throw error;

      alert('Transferência realizada com sucesso!');
      setIsTransferModalOpen(false);
      setSelectedBed(null);
      setFormData(prev => ({ ...prev, new_bed_id: '' }));
      fetchBeds();
    } catch (error) {
      console.error('Error transferring patient:', error);
      alert('Erro ao realizar transferência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBeds = selectedWard === 'all' 
    ? beds 
    : beds.filter(bed => bed.ward.toLowerCase() === selectedWard.toLowerCase());

  const wards = [
    { id: 'pediatria', name: 'Pediatria' },
    { id: 'maternidade', name: 'Maternidade' },
    { id: 'cirurgia', name: 'Cirurgia' },
    { id: 'urgencia', name: 'Urgência' },
  ];

  const stats = {
    occupied: beds.filter(b => b.status === 'occupied').length,
    available: beds.filter(b => b.status === 'available').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
    total: beds.length || 105 // Fallback to 105 if empty
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Censo e Mapa de Leitos</h1>
          <p className="text-slate-500 mt-1">Gestão de internamentos e ocupação por enfermaria.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar Ala
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all"
          >
            Novo Internamento
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Internamento"
      >
        <form onSubmit={handleAdmission} className="space-y-4">
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
                <option key={p.id} value={p.id}>{p.full_name} ({p.process_number})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Leito Disponível</label>
            <select
              required
              value={formData.bed_id}
              onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Leito</option>
              {beds.filter(b => b.status === 'available').length > 0 ? (
                beds.filter(b => b.status === 'available').map(b => (
                  <option key={b.id} value={b.id}>{b.id} - {b.ward}</option>
                ))
              ) : (
                <option disabled value="">Nenhum leito disponível no momento</option>
              )}
            </select>
            {beds.filter(b => b.status === 'available').length === 0 && (
              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Todos os leitos estão ocupados ou em limpeza.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Notas de Admissão</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-24 resize-none"
              placeholder="Motivo do internamento, diagnóstico inicial..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald text-white rounded-2xl font-bold hover:bg-emerald/90 transition-all shadow-lg shadow-emerald/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Confirmar Internamento
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transferência de Leito"
      >
        <form onSubmit={handleTransferPatient} className="space-y-4">
          {selectedBed && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Paciente Atual</p>
              <p className="font-bold text-slate-900">{selectedBed.patients?.full_name}</p>
              <p className="text-xs text-slate-500">Leito Atual: {selectedBed.id}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Novo Leito Destino</label>
            <select
              required
              value={formData.new_bed_id}
              onChange={(e) => setFormData({ ...formData, new_bed_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Leito Vazio</option>
              {beds.filter(b => b.status === 'available').map(b => (
                <option key={b.id} value={b.id}>{b.id} - {b.ward}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
            Confirmar Transferência
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Gestão de Status do Leito"
      >
        <div className="space-y-6">
          {selectedBed && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Leito Selecionado</p>
              <p className="text-lg font-bold text-slate-900">{selectedBed.id}</p>
              <p className="text-xs text-slate-500 capitalize">Status Atual: {selectedBed.status}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {selectedBed?.status === 'occupied' && (
              <button
                onClick={() => handleUpdateBedStatus(selectedBed.id, 'cleaning')}
                className="w-full p-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl font-bold hover:bg-amber-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><LogOut className="w-5 h-5" /></div>
                  <div className="text-left">
                    <p>Processar Alta Médica</p>
                    <p className="text-[10px] font-normal opacity-70">O leito entrará em fase de limpeza.</p>
                  </div>
                </div>
                <Users className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {(selectedBed?.status === 'cleaning' || selectedBed?.status === 'occupied') && (
              <button
                onClick={() => handleUpdateBedStatus(selectedBed.id, 'available')}
                className="w-full p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  <div className="text-left">
                    <p>Libertar Leito (Disponível)</p>
                    <p className="text-[10px] font-normal opacity-70">Confirma que o leito está pronto para novo paciente.</p>
                  </div>
                </div>
                <Bed className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {selectedBed?.status === 'available' && (
              <button
                onClick={() => handleUpdateBedStatus(selectedBed.id, 'cleaning')}
                className="w-full p-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><LogOut className="w-5 h-5" /></div>
                  <div className="text-left">
                    <p>Enviar para Limpeza</p>
                    <p className="text-[10px] font-normal opacity-70">Marcar leito para manutenção/higiene.</p>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
          {/* Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Leitos Ocupados', value: stats.occupied.toString(), total: stats.total.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Leitos Disponíveis', value: stats.available.toString(), total: stats.total.toString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Em Limpeza', value: stats.cleaning.toString(), total: stats.total.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className={cn("text-3xl font-bold", stat.color)}>{stat.value}</h3>
                  <span className="text-slate-400 font-medium">/ {stat.total}</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", stat.bg.replace('bg-', 'bg-').replace('-50', '-500'))} 
                    style={{ width: `${(Number(stat.value)/Number(stat.total))*100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Wards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <button 
              onClick={() => setSelectedWard('all')}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all text-left space-y-4",
                selectedWard === 'all' ? "border-navy bg-navy text-white" : "bg-white border-slate-100 hover:border-slate-200"
              )}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg">Todas as Alas</h4>
                <Bed className={cn("w-6 h-6", selectedWard === 'all' ? "text-emerald" : "text-slate-300")} />
              </div>
              <p className="text-xs opacity-60">Visão geral de todo o hospital</p>
            </button>
            {wards.map((ward) => {
              const wardBeds = beds.filter(b => b.ward.toLowerCase() === ward.id.toLowerCase());
              const occupied = wardBeds.filter(b => b.status === 'occupied').length;
              const total = wardBeds.length || 1;
              
              return (
                <button 
                  key={ward.id}
                  onClick={() => setSelectedWard(ward.id)}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-left space-y-4",
                    selectedWard === ward.id ? "border-navy bg-navy text-white" : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg">{ward.name}</h4>
                    <Bed className={cn("w-6 h-6", selectedWard === ward.id ? "text-emerald" : "text-slate-300")} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={selectedWard === ward.id ? "text-white/60" : "text-slate-500"}>Ocupação</span>
                      <span className="font-bold">{Math.round((occupied/total)*100)}%</span>
                    </div>
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", selectedWard === ward.id ? "bg-white/10" : "bg-slate-100")}>
                      <div 
                        className={cn("h-full rounded-full", occupied/total > 0.9 ? "bg-red-500" : "bg-emerald-500")}
                        style={{ width: `${(occupied/total)*100}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Beds Map / Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Mapa Detalhado de Leitos</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Disponível
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Ocupado
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500" /> Limpeza
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">ID Leito</th>
                    <th className="px-6 py-4">Enfermaria</th>
                    <th className="px-6 py-4">Paciente</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Última Atualização</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBeds.length > 0 ? filteredBeds.map((bed) => (
                    <tr key={bed.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{bed.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{bed.ward}</td>
                      <td className="px-6 py-4">
                        {bed.patients ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {bed.patients.full_name.split(' ').map((n: any) => n[0]).join('')}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{bed.patients.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-300 italic">Vazio</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          bed.status === 'occupied' ? "bg-blue-50 text-blue-600" :
                          bed.status === 'available' ? "bg-emerald-50 text-emerald-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {bed.status === 'occupied' ? 'Ocupado' : bed.status === 'available' ? 'Disponível' : 'Em Limpeza'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(bed.last_updated).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bed.status === 'occupied' && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedBed(bed);
                                  setIsTransferModalOpen(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors" 
                                title="Transferência Interna"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedBed(bed);
                                  setIsStatusModalOpen(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-colors" 
                                title="Alta Médica"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedBed(bed);
                              setIsStatusModalOpen(true);
                            }}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-emerald transition-colors"
                            title="Gerir Status do Leito"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhum leito encontrado.
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
