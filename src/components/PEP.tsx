import React from 'react';
import { 
  History, 
  Stethoscope, 
  Search, 
  Loader2, 
  FilePlus, 
  Activity, 
  Pill, 
  ClipboardList,
  ChevronRight,
  User,
  Plus,
  Trash2,
  Save,
  Clock,
  ExternalLink,
  ShieldCheck,
  Package,
  AlertTriangle,
  X,
  Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';
import Imaging from './Imaging';

export default function PEP() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [patient, setPatient] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  
  const [clinicalData, setClinicalData] = React.useState<any>({
    consultations: [],
    evolutions: [],
    prescriptions: [],
    dispensations: []
  });

  const [currentEvolutionId, setCurrentEvolutionId] = React.useState<string | null>(null);

  const [inventory, setInventory] = React.useState<any[]>([]);
  const [isAdministering, setIsAdministering] = React.useState(false);
  const [selectedMedForDispense, setSelectedMedForDispense] = React.useState<any>(null);
  const [currentDoctor, setCurrentDoctor] = React.useState<any>(null);

  React.useEffect(() => {
    const initData = async () => {
      const [{ data: invData }, { data: { user } }] = await Promise.all([
        supabase.from('inventory').select('id, item_name, batch_number, quantity, unit').gt('quantity', 0),
        supabase.auth.getUser()
      ]);
      
      if (invData) setInventory(invData);
      if (user) {
        setCurrentDoctor(user);
        // Only ensure profile exists, don't overwrite role if it's already set
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: user.user_metadata?.role || 'doctor'
          }, { onConflict: 'id' });
        }
      }
    };
    initData();

    // Check for external search trigger
    const externalSearch = localStorage.getItem('pep_search_term');
    if (externalSearch) {
      setSearchTerm(externalSearch);
      handleSearch(externalSearch);
      localStorage.removeItem('pep_search_term');
    }
  }, []);

  const [activeSubTab, setActiveSubTab] = React.useState<'history' | 'anamnese' | 'evolution' | 'prescription' | 'administration' | 'imaging'>('history');

  const [formData, setFormData] = React.useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
    evolutionNotes: '',
    conditionStatus: 'stable',
    medications: [] as any[]
  });

  const [newMed, setNewMed] = React.useState({ name: '', dosage: '', frequency: '' });

  const [latestSavedId, setLatestSavedId] = React.useState<string | null>(null);

  const handleSearch = async (termToSearch?: string | any) => {
    const finalTerm = typeof termToSearch === 'string' ? termToSearch : searchTerm;
    const cleanTerm = finalTerm.trim();
    if (!cleanTerm) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: results, error: pError } = await supabase
        .from('patients')
        .select('*')
        .or(`bi_number.eq.${cleanTerm},process_number.eq.${cleanTerm},full_name.ilike.%${cleanTerm}%`);

      if (pError) throw pError;

      if (!results || results.length === 0) {
        alert('Nenhum paciente encontrado com este termo.');
        return;
      }

      if (results.length === 1) {
        selectPatient(results[0]);
      } else {
        setSearchResults(results);
        setIsSearchModalOpen(true);
      }
    } catch (err: any) {
      alert('Erro na busca: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = async (patientData: any) => {
    setPatient(patientData);
    setIsSearchModalOpen(false);
    setIsLoading(true);

    try {
      // Fetch only clinical data, inventory is already loaded
      const [cons, evol, presc, disp] = await Promise.all([
        supabase.from('consultations').select('*').eq('patient_id', patientData.id).order('created_at', { ascending: false }),
        supabase.from('clinical_evolutions').select('*').eq('patient_id', patientData.id).order('created_at', { ascending: false }),
        supabase.from('prescriptions').select('*').eq('patient_id', patientData.id).order('created_at', { ascending: false }),
        supabase.from('dispensations').select('*, inventory(item_name, batch_number)').eq('patient_id', patientData.id).order('administered_at', { ascending: false })
      ]);

      const evolutions = evol.data || [];
      setClinicalData({
        consultations: cons.data || [],
        evolutions: evolutions,
        prescriptions: presc.data || [],
        dispensations: disp.data || []
      });

      // Check for today's evolution
      const today = new Date().toISOString().split('T')[0];
      const todayEvol = evolutions.find(e => e.created_at.startsWith(today));
      if (todayEvol) {
        setCurrentEvolutionId(todayEvol.id);
        setFormData(prev => ({ 
          ...prev, 
          evolutionNotes: todayEvol.notes,
          conditionStatus: todayEvol.condition_status
        }));
      } else {
        setCurrentEvolutionId(null);
        setFormData(prev => ({ ...prev, evolutionNotes: '', conditionStatus: 'stable' }));
      }

    } catch (err: any) {
      alert('Erro ao carregar prontuário: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const [isAddingPrescription, setIsAddingPrescription] = React.useState(false);
  const handleSaveConsultation = async () => {
    if (!patient) return;
    if (!formData.diagnosis || !formData.symptoms) {
      alert('Por favor, preencha os sintomas e o diagnóstico para concluir o atendimento médico.');
      return;
    }
    setIsLoading(true);
    try {
      const doctorId = currentDoctor?.id || null;
      
      const { data: consData, error: consError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: patient.id,
          doctor_id: doctorId,
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          notes: formData.notes
        }])
        .select()
        .single();
      if (consError) throw new Error(`Erro na consulta: ${consError.message}`);

      if (formData.medications && formData.medications.length > 0) {
        const digitalSignature = `MD-SIG-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${new Date().getTime()}`;
        const { error: prescError } = await supabase
          .from('prescriptions')
          .insert([{
            consultation_id: consData.id,
            patient_id: patient.id,
            doctor_id: doctorId,
            medications: formData.medications,
            status: 'active',
            digital_signature: digitalSignature
          }]);
        
        if (prescError) throw new Error(`Erro na prescrição: ${prescError.message}`);
      }

      setLatestSavedId(consData.id);
      
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          symptoms: '',
          diagnosis: '',
          notes: '',
          medications: []
        }));
        setLatestSavedId(null);
        selectPatient(patient);
        setActiveSubTab('history');
      }, 3000);
      
    } catch (err: any) {
      console.error('Save Consultation Error:', err);
      alert(err.message || 'Falha ao salvar atendimento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIndependentPrescription = async () => {
    if (!patient || formData.medications.length === 0) return;
    setIsLoading(true);
    try {
      const doctorId = currentDoctor?.id || null;
      const digitalSignature = `MD-SIG-IND-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${new Date().getTime()}`;

      const { error: prescError } = await supabase
        .from('prescriptions')
        .insert([{
          patient_id: patient.id,
          doctor_id: doctorId,
          medications: formData.medications,
          status: 'active',
          digital_signature: digitalSignature
        }]);
      
      if (prescError) throw prescError;

      alert('Prescrição registrada com sucesso!');
      setFormData(prev => ({ ...prev, medications: [] }));
      setIsAddingPrescription(false);
      selectPatient(patient);
      setActiveSubTab('prescription');
    } catch (err: any) {
      alert('Erro ao salvar prescrição: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvolution = async () => {
    if (!patient) return;
    setIsLoading(true);
    try {
      const doctorId = currentDoctor?.id || null;

      if (currentEvolutionId) {
        const { error } = await supabase
          .from('clinical_evolutions')
          .update({
            notes: formData.evolutionNotes,
            condition_status: formData.conditionStatus,
            doctor_id: doctorId
          })
          .eq('id', currentEvolutionId);
        if (error) throw error;
        alert('Evolução diária atualizada!');
      } else {
        const { error } = await supabase
          .from('clinical_evolutions')
          .insert([{
            patient_id: patient.id,
            doctor_id: doctorId,
            notes: formData.evolutionNotes,
            condition_status: formData.conditionStatus
          }]);
        if (error) throw error;
        alert('Evolução diária registrada com sucesso!');
      }
      selectPatient(patient);
      setActiveSubTab('history');
    } catch (err: any) {
      alert('Erro ao salvar evolução: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) return;
    setFormData({
      ...formData,
      medications: [...formData.medications, newMed]
    });
    setNewMed({ name: '', dosage: '', frequency: '' });
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const handleDispense = async (inventoryId: string, quantity: number) => {
    if (!patient) return;
    setIsAdministering(true);
    try {
      const { error } = await supabase
        .from('dispensations')
        .insert([{
          patient_id: patient.id,
          inventory_id: inventoryId,
          quantity: quantity,
          notes: `Administração de medicação prescrita`
        }]);

      if (error) throw error;
      alert('Administração confirmada e stock atualizado!');
      setSelectedMedForDispense(null);
      handleSearch(); // Refresh
    } catch (err: any) {
      alert('Erro na administração: ' + err.message);
    } finally {
      setIsAdministering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-emerald" />
            PEP - Prontuário Eletrônico do Paciente
          </h1>
          <p className="text-slate-500">Gestão clínica avançada e histórico digital unificado.</p>
        </div>
      </div>

      {/* Patient Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4">
            <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por Nome, BI ou Nº de Processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all text-lg"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-navy text-white px-8 py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Buscar Prontuário
        </button>
      </div>

      {patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Card - Sticky side */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center border-4 border-emerald/20 overflow-hidden">
                   <img 
                    src={`https://picsum.photos/seed/${patient.id}/200/200`} 
                    alt="Patient" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="font-bold text-slate-900 leading-tight">{patient.full_name}</h2>
                <p className="text-xs text-emerald font-bold mt-1">{patient.process_number}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tipo Sanguíneo</p>
                  <p className="font-bold text-red-600">{patient.tipo_sanguineo || 'Desconhecido'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Alergias</p>
                  <p className="font-bold text-amber-600">
                    {patient.alergias?.length > 0 ? patient.alergias.join(', ') : 'Nenhuma relatada'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Contato Emergência</p>
                  <p className="font-bold text-slate-700">{patient.contato_emergencia_nome || '-'}</p>
                  <p className="text-xs text-slate-500">{patient.contato_emergencia_telefone || ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Workspace */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm gap-2 flex-wrap sm:flex-nowrap">
              {[
                { id: 'history', label: 'Histórico Completo', icon: History },
                { id: 'anamnese', label: 'Nova Consulta', icon: Stethoscope },
                { id: 'evolution', label: 'Evolução Diária', icon: Activity },
                { id: 'prescription', label: 'Receituário', icon: Pill },
                { id: 'administration', label: 'Administração', icon: ShieldCheck },
                { id: 'imaging', label: 'Imagiologia', icon: Image },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                    activeSubTab === tab.id 
                      ? "bg-navy text-white shadow-lg" 
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
              {activeSubTab === 'history' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald" />
                      Consultas e Diagnósticos
                    </h3>
                    <div className="space-y-3">
                      {clinicalData.consultations.map((c: any) => (
                        <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                            <Clock className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-slate-900">Diagnóstico: {c.diagnosis || 'Pendente'}</h4>
                                <span className="text-[10px] text-slate-400 uppercase font-black">{new Date(c.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{c.symptoms}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Evoluções Clínicas
                    </h3>
                    <div className="space-y-3">
                      {clinicalData.evolutions.map((e: any) => (
                        <div key={e.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 relative group">
                          <div className={cn(
                            "w-2 shrink-0 rounded-full",
                            e.condition_status === 'improving' ? 'bg-emerald-500' :
                            e.condition_status === 'worsening' ? 'bg-red-500' : 'bg-blue-400'
                          )} />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{e.notes}</p>
                            <span className="text-[10px] text-slate-400 uppercase font-black">{new Date(e.created_at).toLocaleString()}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setFormData(prev => ({ 
                                ...prev, 
                                evolutionNotes: e.notes,
                                conditionStatus: e.condition_status
                              }));
                              setCurrentEvolutionId(e.id);
                              setActiveSubTab('evolution');
                            }}
                            className="absolute right-4 top-4 p-2 bg-white rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-all text-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

      {activeSubTab === 'anamnese' && (
                <div className="space-y-6">
                  {latestSavedId ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald/10 border-2 border-emerald p-8 rounded-[32px] text-center space-y-4"
                    >
                      <div className="w-20 h-20 bg-emerald text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <ShieldCheck className="w-12 h-12" />
                      </div>
                      <h3 className="text-2xl font-black text-emerald-900 uppercase">Consulta Concluída</h3>
                      <div className="p-4 bg-white/50 backdrop-blur rounded-2xl border border-emerald/20">
                        <p className="text-emerald-700 font-bold mb-1">Assinatura Digital Verificada</p>
                        <p className="text-[10px] font-mono text-emerald-600 break-all">TOKEN-ID: {latestSavedId}</p>
                      </div>
                      <p className="text-slate-500 font-medium">Os dados foram arquivados permanentemente no prontuário.</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Anamnese (Sintomas e Queixas)</label>
                          <textarea 
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald h-32"
                            placeholder="Descreva o histórico de sintomas e queixas do paciente..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Diagnóstico Hipotético/Final</label>
                          <input 
                            type="text"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald"
                            placeholder="Ex: Malária por P. Falciparum"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Notas Médicas Gerais</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald h-24"
                            placeholder="Observações adicionais..."
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Pill className="w-5 h-5 text-emerald" />
                          Prescrição Integrada
                        </h4>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <input 
                            placeholder="Medicamento"
                            value={newMed.name}
                            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                          />
                          <input 
                            placeholder="Dosagem (ex: 500mg)"
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                          />
                          <div className="flex gap-2">
                            <input 
                              placeholder="Frequência"
                              value={newMed.frequency}
                              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                            />
                            <button 
                              onClick={addMedication}
                              className="p-3 bg-emerald text-white rounded-xl hover:bg-emerald/90 transition-all font-bold"
                            >
                              <Plus className="w-5 h-5 mx-auto" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {formData.medications.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-emerald/5 border border-emerald/10 rounded-xl text-sm">
                              <span className="font-bold text-emerald-900 text-xs">{m.name} - {m.dosage} ({m.frequency})</span>
                              <button onClick={() => removeMedication(i)} className="text-red-500 hover:bg-white p-1 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={handleSaveConsultation}
                        disabled={isLoading}
                        className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                        Concluir Consulta e Assinar Digitalmente
                      </button>
                    </>
                  )}
                </div>
              )}

              {activeSubTab === 'evolution' && (
                <div className="space-y-8">
                   <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                     <Activity className="w-8 h-8 text-blue-600" />
                     <div>
                       <h3 className="font-bold text-blue-900">Evolução Clínica Diária</h3>
                       <p className="text-sm text-blue-700/60">Controle de melhora ou piora do quadro clínico (Máx. 1/dia).</p>
                     </div>
                   </div>

                   <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Notas de Evolução</label>
                        <textarea 
                          value={formData.evolutionNotes}
                          onChange={(e) => setFormData({ ...formData, evolutionNotes: e.target.value })}
                          className="w-full p-6 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 h-48 shadow-sm"
                          placeholder="Registre as observações diárias sobre a resposta ao tratamento..."
                        />
                     </div>

                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Estado Geral de Hoje</label>
                        <div className="grid grid-cols-4 gap-3">
                           {[
                             { id: 'improving', label: 'Em Melhora', color: 'bg-emerald-500' },
                             { id: 'stable', label: 'Estável', color: 'bg-blue-500' },
                             { id: 'worsening', label: 'Em Piora', color: 'bg-orange-500' },
                             { id: 'critical', label: 'Crítico', color: 'bg-red-500' },
                           ].map((st) => (
                             <button
                               key={st.id}
                               onClick={() => setFormData({ ...formData, conditionStatus: st.id })}
                               className={cn(
                                 "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                 formData.conditionStatus === st.id 
                                   ? "border-blue-500 bg-white shadow-lg scale-105" 
                                   : "border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200"
                               )}
                             >
                               <div className={cn("w-3 h-3 rounded-full", st.color)} />
                               <span className="text-[10px] font-bold uppercase tracking-tighter">{st.label}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <button 
                       onClick={handleSaveEvolution}
                       disabled={isLoading}
                       className={cn(
                         "w-full py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70",
                         currentEvolutionId ? "bg-amber-500 text-white" : "bg-navy text-white"
                       )}
                     >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {currentEvolutionId ? 'Atualizar Evolução de Hoje' : 'Registrar Nova Evolução'}
                     </button>
                   </div>

                   <div className="pt-8 border-t border-slate-100">
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <History className="w-5 h-5 text-slate-400" />
                       Histórico de Evoluções
                     </h3>
                     <div className="space-y-4">
                        {clinicalData.evolutions.length > 0 ? clinicalData.evolutions.map((e: any) => (
                          <div key={e.id} className="p-5 bg-white rounded-2xl border border-slate-200 flex gap-4 hover:border-blue-300 transition-all group">
                            <div className={cn(
                              "w-1.5 shrink-0 rounded-full",
                              e.condition_status === 'improving' ? 'bg-emerald-500' :
                              e.condition_status === 'worsening' ? 'bg-orange-500' : 
                              e.condition_status === 'critical' ? 'bg-red-500' : 'bg-blue-400'
                            )} />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                                  e.condition_status === 'improving' ? 'bg-emerald-50 text-emerald-600' :
                                  e.condition_status === 'worsening' ? 'bg-orange-50 text-orange-600' :
                                  e.condition_status === 'critical' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                )}>
                                  {e.condition_status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{new Date(e.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{e.notes}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center py-8 text-slate-400 italic">Nenhum histórico registrado.</p>
                        )}
                     </div>
                   </div>
                </div>
              )}

              {activeSubTab === 'prescription' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Pill className="w-6 h-6 text-emerald" />
                        Gerenciador de Prescrições
                      </h3>
                      <button 
                        onClick={() => setIsAddingPrescription(!isAddingPrescription)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                          isAddingPrescription ? "bg-slate-100 text-slate-600" : "bg-emerald text-white hover:bg-emerald-600 shadow-md"
                        )}
                      >
                        {isAddingPrescription ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAddingPrescription ? "Cancelar" : "Nova Prescrição"}
                      </button>
                   </div>

                   {isAddingPrescription && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="bg-emerald/5 border-2 border-emerald/10 p-6 rounded-3xl mb-8 space-y-4 overflow-hidden"
                     >
                        <h4 className="font-bold text-emerald-900 text-sm">Criar nova prescrição para {patient.full_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input 
                            placeholder="Medicamento"
                            value={newMed.name}
                            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                            className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                          />
                          <input 
                            placeholder="Dosagem (ex: 500mg)"
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                            className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                          />
                          <div className="flex gap-2">
                            <input 
                              placeholder="Frequência"
                              value={newMed.frequency}
                              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald text-sm"
                            />
                            <button 
                              onClick={addMedication}
                              className="p-3 bg-emerald text-white rounded-xl hover:bg-emerald/90 transition-all shadow-sm"
                            >
                              <Plus className="w-5 h-5 mx-auto" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {formData.medications.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald/10 text-xs">
                              <span className="font-medium text-emerald-950">{m.name} - {m.dosage} ({m.frequency})</span>
                              <button onClick={() => removeMedication(i)} className="text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={handleCreateIndependentPrescription}
                          disabled={isLoading || formData.medications.length === 0}
                          className="w-full py-3 bg-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                          Concluir e Assinar Prescrição
                        </button>
                     </motion.div>
                   )}

                   <div className="space-y-4">
                      {clinicalData.prescriptions.map((p: any) => (
                         <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                                  p.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                                )}>
                                  {p.status}
                                </span>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 font-mono uppercase">ID: {p.id}</p>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                           </div>

                           <div className="space-y-2">
                              {p.medications.map((m: any, idx: number) => {
                                const matchedStock = inventory.filter(i => i.item_name.toLowerCase().includes(m.name.toLowerCase()));
                                
                                return (
                                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 group">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="font-bold">{m.name}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{m.dosage}</span>
                                    <span className="text-slate-400 ml-auto">{m.frequency}</span>
                                    <button 
                                      onClick={() => setSelectedMedForDispense({ ...m, matchedStock })}
                                      className="hidden group-hover:flex items-center gap-1 px-3 py-1 bg-navy text-white text-[10px] font-bold rounded-lg uppercase"
                                    >
                                      Dar Dose
                                    </button>
                                  </div>
                                );
                              })}
                           </div>

                           <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 italic">Assinado Digitalmente</span>
                              <div className="flex gap-4 text-xs font-bold">
                                <button className="text-emerald hover:underline flex items-center gap-1">
                                  Imprimir Guia <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                           </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {activeSubTab === 'imaging' && (
                <div className="space-y-6">
                  <div className="bg-sky-50/50 p-6 rounded-3xl border border-sky-100 flex items-center gap-4 mb-4">
                    <Image className="w-8 h-8 text-sky-600 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-sky-900">Exames de Imagem & PACS Integrado</h3>
                      <p className="text-xs text-sky-700/80 font-medium">Estudos radiológicos, tomografias (TC), ecografias e ressonâncias magnéticas (RM) vinculados diretamente à ficha do paciente.</p>
                    </div>
                  </div>
                  <Imaging patientId={patient.id} />
                </div>
              )}

              {activeSubTab === 'administration' && (
                <div className="space-y-6">
                   <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4 mb-8">
                     <ShieldCheck className="w-8 h-8 text-emerald-600" />
                     <div>
                       <h3 className="font-bold text-emerald-900">Registro de Administração de Enfermagem</h3>
                       <p className="text-sm text-emerald-700/60">Controle rigoroso de dosagem e baixa automática de estoque.</p>
                     </div>
                   </div>

                   <div className="space-y-4">
                      {clinicalData.dispensations.length > 0 ? clinicalData.dispensations.map((d: any) => (
                        <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{d.inventory?.item_name || 'Item'}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Lote: {d.inventory?.batch_number || '-'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-bold text-emerald-600">{d.quantity} un administrado</p>
                              <p className="text-[10px] text-slate-400 font-bold">{new Date(d.administered_at).toLocaleString()}</p>
                           </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                           <p>Nenhuma administração registrada para este paciente nas últimas 24h.</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>

            <Modal
              isOpen={!!selectedMedForDispense}
              onClose={() => setSelectedMedForDispense(null)}
              title="Confirmar Administração de Dose"
            >
              {selectedMedForDispense && (
                <div className="space-y-6">
                  <div className="p-4 bg-navy text-white rounded-2xl shadow-xl">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Medicamento Prescrito</p>
                    <h3 className="text-xl font-bold">{selectedMedForDispense.name}</h3>
                    <p className="text-emerald-400 font-bold">{selectedMedForDispense.dosage} - {selectedMedForDispense.frequency}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Selecione o Lote em Stock</label>
                    <div className="space-y-2">
                       {selectedMedForDispense.matchedStock.length > 0 ? selectedMedForDispense.matchedStock.map((lot: any) => (
                         <button
                           key={lot.id}
                           onClick={() => handleDispense(lot.id, 1)}
                           disabled={isAdministering}
                           className="w-full p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald rounded-2xl text-left flex justify-between items-center group transition-all"
                         >
                           <div>
                             <p className="font-bold text-slate-900 group-hover:text-emerald">Lote: {lot.batch_number}</p>
                             <p className="text-xs text-slate-500">Validade: {new Date(lot.expiry_date).toLocaleDateString()}</p>
                           </div>
                           <div className="text-right">
                             <p className="font-bold text-slate-900">{lot.quantity} {lot.unit}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-black">Disponível</p>
                           </div>
                         </button>
                       )) : (
                         <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
                           <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                           <p className="text-sm font-bold text-red-700">SEM STOCK DISPONÍVEL</p>
                           <p className="text-xs text-red-600/60 mt-1">Solicite reposição imediata à Farmácia.</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[40px] border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 bg-emerald/10 rounded-full flex items-center justify-center mx-auto">
             <Stethoscope className="w-10 h-10 text-emerald" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 italic">Inicie o Atendimento Clínico</h2>
          <p className="text-slate-500 max-w-md mx-auto">Insira o Nome, B.I. ou Número de Processo acima para abrir o prontuário eletrônico completo do paciente.</p>
        </div>
      )}

      {/* Patient Selection Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Selecione o Paciente"
      >
        <div className="space-y-3">
          {searchResults.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPatient(p)}
              className="w-full p-4 bg-slate-50 hover:bg-emerald/5 border border-slate-100 hover:border-emerald rounded-2xl text-left flex items-center gap-4 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 group-hover:border-emerald/30 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${p.id}/100/100`} 
                  alt={p.full_name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900">{p.full_name}</p>
                <p className="text-xs text-slate-500">BI: {p.bi_number} | Processo: {p.process_number}</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
