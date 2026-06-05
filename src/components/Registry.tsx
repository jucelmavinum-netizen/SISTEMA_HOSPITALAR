import React from 'react';
import { 
  Search, 
  Fingerprint, 
  CreditCard, 
  UserPlus, 
  History, 
  FileText,
  ExternalLink,
  QrCode,
  Download,
  Loader2,
  AlertCircle,
  Printer,
  ClipboardList,
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

export default function Registry({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [searchType, setSearchType] = React.useState<'bi' | 'card' | 'fingerprint'>('bi');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [patient, setPatient] = React.useState<any>(null);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [clinicalHistory, setClinicalHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListLoading, setIsListLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = React.useState<any>(null);
  const [editFormData, setEditFormData] = React.useState<any>({});

  // Physical sheets state
  const [isSheetModalOpen, setIsSheetModalOpen] = React.useState(false);
  const [activeSheetType, setActiveSheetType] = React.useState<'entrada' | 'saida' | 'transferencia'>('entrada');
  const [sheetFormData, setSheetFormData] = React.useState({
    doctorName: 'Dr. Manuel Neto',
    receptionistName: 'Sandro Pinto',
    dischargeState: 'Melhora Clínica Significativa',
    dischargeMeds: 'Paracetamol 500mg de 8h/8h, Amoxicilina 875mg de 12h/12h, Polivitamínico de 24h/24h.',
    dischargeNotes: 'Repouso domiciliar recomendado por 3 dias. Retorno imediato em caso de febre ou dor intensa.',
    transferDestination: 'Hospital Josina Machel',
    transferReason: 'Necessidade de Cuidados Intensivos Especializados (CTI) indisponíveis nesta unidade.',
    transferClinicalStatus: 'Estável sob monitoramento hemodinâmico leve.',
    urgencyLevel: 'Urgente / Laranja'
  });

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsListLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPatients(data || []);
    } catch (err: any) {
      console.error('Error fetching patients:', err.message);
    } finally {
      setIsListLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setError(null);
    setPatient(null);

    try {
      let query = supabase.from('patients').select('*');
      
      if (searchType === 'bi') {
        query = query.eq('bi_number', searchTerm);
      } else if (searchType === 'card') {
        query = query.eq('municipal_card_id', searchTerm);
      } else if (searchType === 'fingerprint') {
        query = query.eq('fingerprint_id', searchTerm);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          const typeLabel = searchType === 'bi' ? 'B.I.' : searchType === 'card' ? 'Cartão' : 'Biometria';
          setError(`Paciente não encontrado com esta identificação (${typeLabel}).`);
        } else {
          throw error;
        }
      } else {
        setPatient(data);
        // Fetch triage history as clinical history
        const { data: history, error: historyError } = await supabase
          .from('triage_records')
          .select('*')
          .eq('patient_id', data.id)
          .order('created_at', { ascending: false });
        
        if (!historyError) setClinicalHistory(history || []);
      }
    } catch (err: any) {
      setError('Erro ao buscar paciente: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('digital-card');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cartão do Paciente - SISA ERP</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 flex items-center justify-center min-h-screen">
          <div class="w-[500px]">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    // In a real app we might use html2canvas or similar
    // For now, let's trigger a print which usually allows "Save as PDF"
    handlePrint();
  };

  const handlePrintClinicalSheet = (type: 'entrada' | 'saida' | 'transferencia') => {
    if (!patient) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let docTitle = '';
    let docSpecificContentHtml = '';

    if (type === 'entrada') {
      docTitle = 'Ficha de Entrada e Admissão - SISA';
      docSpecificContentHtml = `
        <div class="space-y-4">
          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">1. Dados de Admissão</h3>
            <table class="w-full text-xs text-left">
              <tr>
                <td class="font-bold py-1 w-1/3 text-slate-500">Data/Hora Registo:</td>
                <td class="py-1 text-slate-800 font-bold">${new Date().toLocaleString('pt-AO')}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Financiamento:</td>
                <td class="py-1 text-slate-800 capitalize">${patient.financing_type || 'Público'}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Nº Processo SISA:</td>
                <td class="py-1 font-mono text-indigo-700 font-bold">${patient.process_number}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Responsável Registo:</td>
                <td class="py-1 text-slate-800">${sheetFormData.receptionistName}</td>
              </tr>
            </table>
          </div>

          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">2. Antecedentes Clínicos Triados</h3>
            <table class="w-full text-xs text-left">
              <tr>
                <td class="font-bold py-1 w-1/3 text-slate-500">Alergias Clínicas:</td>
                <td class="py-1 text-red-650 font-bold text-red-650">${patient.alergias && patient.alergias.length > 0 ? patient.alergias.join(', ') : 'Nenhuma conhecida'}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Patologias Crónicas:</td>
                <td class="py-1 text-slate-800">${patient.doencas_cronicas && patient.doencas_cronicas.length > 0 ? patient.doencas_cronicas.join(', ') : 'Nenhuma declarada'}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Grupo Sanguíneo:</td>
                <td class="py-1 font-bold text-red-600">${patient.tipo_sanguineo || 'N/D'}</td>
              </tr>
            </table>
          </div>

          <div class="border border-dashed border-slate-300 p-6 rounded-xl mt-6">
            <p class="text-[10px] text-slate-400 font-bold uppercase mb-8">Espaço reservado para Triagem Física & Sinais Vitais (T.A, F.C, Temp, SpO2):</p>
            <div class="grid grid-cols-4 gap-4 text-center mt-12 text-slate-400">
              <div class="border-t border-slate-200 pt-1 text-[10px] font-bold">Tens. Art. (TA)</div>
              <div class="border-t border-slate-200 pt-1 text-[10px] font-bold">Freq. Card. (FC)</div>
              <div class="border-t border-slate-200 pt-1 text-[10px] font-bold">Temperatura (ºC)</div>
              <div class="border-t border-slate-200 pt-1 text-[10px] font-bold">Saturação (SpO2)</div>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'saida') {
      docTitle = 'Ficha de Saída e Alta Clínica - SISA';
      docSpecificContentHtml = `
        <div class="space-y-4">
          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">1. Dados de Alta de Paciente</h3>
            <table class="w-full text-xs text-left">
              <tr>
                <td class="font-bold py-1 w-1/3 text-slate-500">Data de Saída:</td>
                <td class="py-1 text-slate-800 font-bold">${new Date().toLocaleDateString('pt-AO')}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Médico Responsável:</td>
                <td class="py-1 text-slate-800 font-bold">${sheetFormData.doctorName}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Estado Clínico de Alta:</td>
                <td class="py-1 font-bold text-emerald-700">${sheetFormData.dischargeState}</td>
              </tr>
            </table>
          </div>

          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">2. Prescrições de Alta Domiciliar</h3>
            <p class="text-xs text-slate-700 font-mono leading-relaxed bg-white p-3 rounded border border-slate-200">${sheetFormData.dischargeMeds}</p>
          </div>

          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">3. Recomendações e Observações</h3>
            <p class="text-xs text-slate-700 leading-relaxed">${sheetFormData.dischargeNotes}</p>
          </div>
        </div>
      `;
    } else {
      docTitle = 'Guia de Transferência Inter-Hospitalar - SISA';
      docSpecificContentHtml = `
        <div class="space-y-4">
          <div class="bg-red-50 border border-red-100 p-4 rounded-xl">
            <h3 class="text-xs font-black text-red-800 uppercase mb-2">1. Alerta de Transferência Clínica</h3>
            <table class="w-full text-xs text-left text-red-950">
              <tr>
                <td class="font-bold py-1 w-1/3 text-slate-500">Hospital de Origem:</td>
                <td class="py-1 text-slate-800">Hospital Geral - Unidade SISA</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Hospital de Destino:</td>
                <td class="py-1 font-bold text-red-900">${sheetFormData.transferDestination}</td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Grau de Urgência:</td>
                <td class="py-1"><span class="bg-red-600 text-white px-2 py-0.5 rounded font-black text-[10px] uppercase">${sheetFormData.urgencyLevel}</span></td>
              </tr>
              <tr>
                <td class="font-bold py-1 text-slate-500">Médico Transferente:</td>
                <td class="py-1 text-slate-800 font-bold">${sheetFormData.doctorName}</td>
              </tr>
            </table>
          </div>

          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">2. Motivação da Transferência</h3>
            <p class="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">${sheetFormData.transferReason}</p>
          </div>

          <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h3 class="text-xs font-black text-slate-800 uppercase mb-2">3. Estado Clínico para Transporte</h3>
            <p class="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">${sheetFormData.transferClinicalStatus}</p>
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="p-12 font-sans bg-white text-slate-900 min-h-screen flex flex-col justify-between">
          <div>
            <!-- Republic Header -->
            <div class="text-center space-y-1 mb-6 border-b pb-4 border-slate-300">
              <div class="text-[20px] font-extrabold text-slate-900">REPÚBLICA DE ANGOLA</div>
              <div class="text-[12px] uppercase tracking-widest text-slate-600 font-bold">Ministério da Saúde</div>
              <div class="text-xs font-semibold text-slate-500 uppercase">Hospital Geral - Sistema SISA</div>
              <div class="text-[10px] text-slate-400 font-mono mt-1">SISA Código Ref: #${patient.id.slice(0, 8).toUpperCase()}</div>
            </div>

            <!-- Header Title -->
            <div class="text-center font-black uppercase text-base text-slate-900 tracking-tight my-5 underline decoration-2">
              ${docTitle.toUpperCase()}
            </div>

            <!-- Patient Core Biographical Data Table -->
            <div class="border border-slate-300 rounded-xl p-4 mb-6">
              <h3 class="text-[10px] font-black uppercase text-slate-500 mb-2">Dados de Identificação do Paciente</h3>
              <table class="w-full text-xs text-left">
                <tr>
                  <td class="font-bold py-1 w-1/4 text-slate-500">Nome Completo:</td>
                  <td class="py-1 font-bold text-slate-900 text-sm" colSpan="3">${patient.full_name}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-slate-500">Nº Processo SISA:</td>
                  <td class="py-1 font-mono text-slate-700 font-bold">${patient.process_number}</td>
                  <td class="font-bold py-1 w-1/4 text-slate-500">Documento Identificação:</td>
                  <td class="py-1 font-mono text-slate-700 font-bold">${patient.bi_number ? 'BI: ' + patient.bi_number : patient.municipal_card_id ? 'Cartão Munícipe: ' + patient.municipal_card_id : 'Não Declarado'}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-slate-500">Gênero:</td>
                  <td class="py-1">${patient.gender === 'M' ? 'Masculino' : 'Feminino'}</td>
                  <td class="font-bold py-1 text-slate-500">Contacto de Emergência:</td>
                  <td class="py-1 font-mono">${patient.contato_emergencia_telefone || 'Sem contato'}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-slate-500">Província:</td>
                  <td class="py-1">${patient.province || 'Não informado'}</td>
                  <td class="font-bold py-1 text-slate-500">Município/Localidade:</td>
                  <td class="py-1">${patient.municipality || 'Não informado'}</td>
                </tr>
              </table>
            </div>

            <!-- Specific Dynamic Content HTML -->
            ${docSpecificContentHtml}

          </div>

          <!-- Formal Signatures Stamp Area -->
          <div class="mt-20 pt-8 border-t border-slate-200">
            <div class="grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div class="w-48 mx-auto border-b border-slate-400 h-10 mb-2"></div>
                <p class="font-bold uppercase text-slate-700">Assinatura do Paciente / Familiar</p>
                <p class="text-[10px] text-slate-400">Autoridade Legal Resignatária</p>
              </div>
              <div>
                <div class="w-48 mx-auto border-b border-indigo-400 h-10 mb-2"></div>
                <p class="font-bold uppercase text-slate-800">Direção Clínica & Equipa Médica SISA</p>
                <p class="text-[10px] text-slate-500 font-mono">${type === 'entrada' ? sheetFormData.receptionistName : sheetFormData.doctorName || 'Emitente SISA'}</p>
              </div>
            </div>

            <!-- Print Footer info -->
            <div class="text-center text-[9px] text-slate-400 mt-12 space-y-1">
              <p>Este documento foi impresso pelo Sistema Integrado de Saúde de Angola (SISA) e serve como certidão física legítima.</p>
              <p>Data de Emissão: ${new Date().toLocaleString('pt-AO')} &bull; Autenticação Criptográfica SISA: SEC_${Math.floor(1000 + Math.random() * 9000)}_HASH</p>
            </div>
          </div>

          <div class="no-print mt-8 flex justify-center">
            <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-sm shadow">
              Confirmar Gravação Física (Imprimir)
            </button>
          </div>

          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          full_name: editFormData.full_name,
          bi_number: editFormData.bi_number,
          municipal_card_id: editFormData.municipal_card_id,
          process_number: editFormData.process_number,
          gender: editFormData.gender,
          birth_date: editFormData.birth_date,
          province: editFormData.province,
          municipality: editFormData.municipality,
          district: editFormData.district,
          financing_type: editFormData.financing_type,
          insurer: editFormData.insurer,
          tipo_sanguineo: editFormData.tipo_sanguineo,
          alergias: typeof editFormData.alergias === 'string' ? [editFormData.alergias] : editFormData.alergias,
          doencas_cronicas: typeof editFormData.doencas_cronicas === 'string' ? [editFormData.doencas_cronicas] : editFormData.doencas_cronicas,
          contato_emergencia_nome: editFormData.contato_emergencia_nome,
          contato_emergencia_telefone: editFormData.contato_emergencia_telefone
        })
        .eq('id', selectedPatientForEdit.id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      alert('Dados do paciente atualizados com sucesso!');
      fetchPatients();
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (p: any) => {
    setSelectedPatientForEdit(p);
    setEditFormData({
      ...p,
      alergias: p.alergias?.join(', ') || '',
      doencas_cronicas: p.doencas_cronicas?.join(', ') || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Registro Único e Biometria</h1>
        <p className="text-slate-500">Identificação integrada com a base de dados nacional.</p>
      </div>

      {/* Search Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-center flex-wrap gap-4">
          {[
            { id: 'bi', label: 'Bilhete de Identidade', icon: CreditCard },
            { id: 'card', label: 'Cartão de Munícipe', icon: FileText },
            { id: 'fingerprint', label: 'Biometria (Digital)', icon: Fingerprint },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSearchType(type.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2",
                searchType === type.id 
                  ? "border-emerald bg-emerald/5 text-emerald" 
                  : "border-slate-100 text-slate-500 hover:border-slate-200"
              )}
            >
              <type.icon className="w-5 h-5" />
              {type.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-2xl mx-auto">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              searchType === 'bi' ? "Digite o número do BI (ex: 001234567LA041)" : 
              searchType === 'card' ? "Digite o número do Cartão" : 
              "Aguardando leitura biométrica..."
            }
            className="w-full pl-6 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all text-xl font-medium"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Buscar
          </button>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
              <AlertCircle className="w-6 h-6 shrink-0" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Patient List or Detail */}
      <AnimatePresence mode="wait">
        {patient ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Patient Profile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                <button 
                  onClick={() => {
                    setPatient(null);
                    setClinicalHistory([]);
                  }}
                  className="mb-4 text-xs font-bold text-slate-400 hover:text-navy flex items-center gap-1 mx-auto"
                >
                  <Search className="w-3 h-3" />
                  Voltar à Lista
                </button>
                <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-emerald/20">
                  <img 
                    src={`https://picsum.photos/seed/${patient.id}/200/200`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{patient.full_name}</h2>
                <div className="space-y-1 mt-2">
                  {patient.bi_number && <p className="text-xs text-slate-500">B.I.: {patient.bi_number}</p>}
                  {patient.municipal_card_id && <p className="text-xs text-slate-500">Cartão Munícipe: {patient.municipal_card_id}</p>}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gênero</p>
                    <p className="font-bold text-slate-700">{patient.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Sangue</p>
                    <p className="font-bold text-red-600">{patient.tipo_sanguineo || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Província</p>
                    <p className="font-bold text-slate-700">{patient.province || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Município</p>
                    <p className="font-bold text-slate-700">{patient.municipality || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Alergias</p>
                    <p className="font-bold text-amber-600 text-xs">{patient.alergias && patient.alergias.length > 0 ? patient.alergias.join(', ') : 'Nenhuma conhecida'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Doenças Crônicas</p>
                    <p className="font-bold text-slate-700 text-xs">{patient.doencas_cronicas && patient.doencas_cronicas.length > 0 ? patient.doencas_cronicas.join(', ') : 'Nenhuma registrada'}</p>
                  </div>
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Contato de Emergência</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{patient.contato_emergencia_nome || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-mono">{patient.contato_emergencia_telefone || ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Financiamento</p>
                    <p className="font-bold text-emerald capitalize">{patient.financing_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Nº Processo</p>
                    <p className="font-bold text-navy">{patient.process_number}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!patient.bi_number && !patient.municipal_card_id) {
                      alert("Apenas pacientes com documentação (B.I. ou Cartão Municipal) podem gerar cartão digital.");
                      return;
                    }
                    setIsCardModalOpen(true);
                  }}
                  className={cn(
                    "w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                    (!patient.bi_number && !patient.municipal_card_id)
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-emerald text-white hover:shadow-lg hover:shadow-emerald/20"
                  )}
                >
                  <QrCode className="w-5 h-5" />
                  Gerar Cartão Digital
                </button>

                {/* Physical Forms / Documentos Físicos de Hospital */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-left">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald" /> Fichas Clínicas (Formato Físico)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                    Preencha e emita formulários oficiais prontos para impressão física ou download em PDF:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <button 
                      onClick={() => {
                        setActiveSheetType('entrada');
                        setIsSheetModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 hover:border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald transition-colors" />
                        Ficha de Entrada (Admissão)
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveSheetType('saida');
                        setIsSheetModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 hover:border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        Ficha de Saída (Alta Clínica)
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveSheetType('transferencia');
                        setIsSheetModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 hover:border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        Guia de Transferência
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-emerald" />
                    Histórico Clínico Unificado
                  </h3>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    Rede Nacional Ativa
                  </span>
                </div>

                <div className="space-y-4">
                  {clinicalHistory.length > 0 ? clinicalHistory.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl group-hover:border-emerald/30 transition-colors">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-slate-900">Registro: {new Date(item.created_at).toLocaleDateString()}</h4>
                          <span className="text-xs font-medium text-slate-400">{new Date(item.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{item.notes || 'Sem observações registradas.'}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white",
                            item.classification === 'red' ? 'bg-red-500' : 
                            item.classification === 'orange' ? 'bg-orange-500' :
                            item.classification === 'yellow' ? 'bg-yellow-500' :
                            item.classification === 'green' ? 'bg-green-500' : 'bg-blue-500'
                          )}>
                            {item.classification || 'normal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhum histórico clínico encontrado para este paciente.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald" />
                Pacientes Cadastrados
              </h3>
              <p className="text-xs text-slate-400">Total: {patients.length} pacientes</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Paciente</th>
                    <th className="px-6 py-4">Documentação</th>
                    <th className="px-6 py-4">Localização / Contato</th>
                    <th className="px-6 py-4">Nº Processo</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isListLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Carregando base de dados...
                      </td>
                    </tr>
                  ) : patients.length > 0 ? patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group-hover:border-emerald/30">
                            <img 
                              src={`https://picsum.photos/seed/${p.id}/100/100`} 
                              alt="Patient" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.full_name}</p>
                            <p className="text-[10px] text-slate-400">{p.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {p.bi_number && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit capitalize">
                              <CreditCard className="w-3 h-3" />
                              BI: {p.bi_number}
                            </div>
                          )}
                          {p.municipal_card_id && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald bg-emerald/5 px-2 py-0.5 rounded w-fit capitalize">
                              <FileText className="w-3 h-3" />
                              C.M.: {p.municipal_card_id}
                            </div>
                          )}
                          {!p.bi_number && !p.municipal_card_id && (
                            <span className="text-[10px] font-bold text-amber-500 italic">Sem Documentos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500">{p.province || 'Luanda'}</p>
                          <p className="text-[10px] text-slate-400 italic line-clamp-1">{p.contato_emergencia_telefone || 'Sem telefone'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-navy">
                        {p.process_number}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(p)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                            title="Editar Dados"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (setActiveTab) {
                                localStorage.setItem('pep_search_term', p.process_number);
                                setActiveTab('pep');
                              } else {
                                setPatient(p);
                                supabase
                                  .from('triage_records')
                                  .select('*')
                                  .eq('patient_id', p.id)
                                  .order('created_at', { ascending: false })
                                  .then(({ data }) => setClinicalHistory(data || []));
                              }
                            }}
                            className="p-2 hover:bg-emerald/10 text-emerald rounded-lg transition-all"
                            title="Ver Prontuário Completo"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Nenhum paciente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Card Modal */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Cartão Digital do Paciente"
      >
        {patient && (
          <div className="space-y-6">
            <div id="digital-card" className="relative bg-gradient-to-br from-navy to-slate-800 p-8 rounded-3xl text-white overflow-hidden shadow-2xl">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald/10 rounded-full -ml-12 -mb-12 blur-xl" />
              
              <div className="relative flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-xl font-black tracking-tighter italic">SISA ERP</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sistema Integrado de Saúde</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <QrCode className="w-6 h-6 text-emerald" />
                </div>
              </div>

              <div className="relative flex gap-6 items-center">
                <div className="w-24 h-24 rounded-2xl border-2 border-white/20 overflow-hidden bg-white/5">
                  <img 
                    src={`https://picsum.photos/seed/${patient.id}/200/200`} 
                    alt="Patient" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight">{patient.full_name}</h3>
                  <p className="text-emerald font-mono text-sm mt-1">{patient.process_number}</p>
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">B.I. / Documento</p>
                  <p className="font-bold text-sm tracking-widest">{patient.bi_number || patient.municipal_card_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tipo de Sangue</p>
                  <p className="font-bold text-sm">{patient.tipo_sanguineo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Província</p>
                  <p className="font-bold text-sm">{patient.province || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Validade</p>
                  <p className="font-bold text-sm">Indeterminada</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all font-sans"
              >
                <Printer className="w-5 h-5" />
                Imprimir Cartão
              </button>
              <button 
                onClick={handleDownload}
                className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all font-sans"
              >
                <Download className="w-5 h-5" />
                Baixar PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modificar Dados do Paciente"
      >
        <form onSubmit={handleUpdatePatient} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
              <input 
                type="text" 
                value={editFormData.full_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">B.I. / Documento</label>
              <input 
                type="text" 
                value={editFormData.bi_number || ''}
                onChange={(e) => setEditFormData({ ...editFormData, bi_number: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nº Processo</label>
              <input 
                type="text" 
                value={editFormData.process_number || ''}
                onChange={(e) => setEditFormData({ ...editFormData, process_number: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Gênero</label>
              <select 
                value={editFormData.gender || 'M'}
                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data de Nascimento</label>
              <input 
                type="date" 
                value={editFormData.birth_date || ''}
                onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Província</label>
                <input 
                  type="text" 
                  value={editFormData.province || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Município</label>
                <input 
                  type="text" 
                  value={editFormData.municipality || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, municipality: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Distrito</label>
                <input 
                  type="text" 
                  value={editFormData.district || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Sangue</label>
              <input 
                type="text" 
                value={editFormData.tipo_sanguineo || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tipo_sanguineo: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Financiamento</label>
              <select 
                value={editFormData.financing_type || 'public'}
                onChange={(e) => setEditFormData({ ...editFormData, financing_type: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="public">Público</option>
                <option value="particular">Particular</option>
                <option value="insurance">Seguro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Alergias</label>
              <input 
                type="text" 
                value={editFormData.alergias || ''}
                onChange={(e) => setEditFormData({ ...editFormData, alergias: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Separadas por vírgula"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Doenças Crônicas</label>
              <input 
                type="text" 
                value={editFormData.doencas_cronicas || ''}
                onChange={(e) => setEditFormData({ ...editFormData, doencas_cronicas: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Separadas por vírgula"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Emergência (Nome)</label>
              <input 
                type="text" 
                value={editFormData.contato_emergencia_nome || ''}
                onChange={(e) => setEditFormData({ ...editFormData, contato_emergencia_nome: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Emergência (Tel)</label>
              <input 
                type="text" 
                value={editFormData.contato_emergencia_telefone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, contato_emergencia_telefone: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. EMISSÃO DE FICHAS E DOCUMENTOS FÍSICOS MODAL */}
      <Modal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        title={
          activeSheetType === 'entrada' ? 'Emitir Ficha de Entrada/Admissão' :
          activeSheetType === 'saida' ? 'Emitir Ficha de Alta/Saída' :
          'Emitir Guia de Transferência Inter-Hospitalar'
        }
        className="max-w-xl"
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-500 font-medium pb-2 border-b">
            Preencha os dados abaixo para personalizar o documento clínico físico oficial do paciente <span className="font-bold text-slate-800">{patient?.full_name}</span> antes de gerar o ficheiro para download ou impressão.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conditional input fields depending on document type */}
            {activeSheetType === 'entrada' && (
              <div className="col-span-2 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Responsável da Recepção</label>
                  <input
                    type="text"
                    value={sheetFormData.receptionistName}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, receptionistName: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-emerald bg-white"
                    placeholder="Nome do Recepcionista"
                  />
                </div>
              </div>
            )}

            {activeSheetType === 'saida' && (
              <div className="col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Médico Concedente da Alta</label>
                    <input
                      type="text"
                      value={sheetFormData.doctorName}
                      onChange={(e) => setSheetFormData({ ...sheetFormData, doctorName: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-indigo-600 bg-white font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Estado de Alta</label>
                    <select
                      value={sheetFormData.dischargeState}
                      onChange={(e) => setSheetFormData({ ...sheetFormData, dischargeState: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700"
                    >
                      <option value="Melhora Clínica Significativa">Melhora Clínica Significativa</option>
                      <option value="Cura Completa / Alta Médica">Cura Completa / Alta Médica</option>
                      <option value="Melhora Parcial de Sintomas">Melhora Parcial de Sintomas</option>
                      <option value="Alta a Pedido do Paciente">Alta a Pedido do Paciente</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Prescrições de Alta (Medicamentos)</label>
                  <textarea
                    rows={2}
                    value={sheetFormData.dischargeMeds}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, dischargeMeds: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-indigo-600 bg-white font-mono"
                    placeholder="Ex: Paracetamol 500mg de 8h/8h."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Recomendações Clínicas e Repouso</label>
                  <textarea
                    rows={2}
                    value={sheetFormData.dischargeNotes}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, dischargeNotes: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-indigo-600 bg-white"
                  />
                </div>
              </div>
            )}

            {activeSheetType === 'transferencia' && (
              <div className="col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Médico Responsável</label>
                    <input
                      type="text"
                      value={sheetFormData.doctorName}
                      onChange={(e) => setSheetFormData({ ...sheetFormData, doctorName: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-rose-500 bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Nível de Urgência SISA</label>
                    <select
                      value={sheetFormData.urgencyLevel}
                      onChange={(e) => setSheetFormData({ ...sheetFormData, urgencyLevel: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold"
                    >
                      <option value="Urgente / Laranja">Urgente / Laranja</option>
                      <option value="Emergência / Vermelho">Emergência / Vermelho</option>
                      <option value="Não Urgente / Verde">Não Urgente / Verde</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Hospital de Destino Nacional</label>
                  <input
                    type="text"
                    value={sheetFormData.transferDestination}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, transferDestination: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-rose-500 bg-white text-rose-900 font-bold"
                    placeholder="Ex: Hospital Josina Machel, Clínica Girassol"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Motivo Clínico de Transferência</label>
                  <textarea
                    rows={2}
                    value={sheetFormData.transferReason}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, transferReason: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-rose-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide font-semibold">Estado Clínico de Transporte</label>
                  <input
                    type="text"
                    value={sheetFormData.transferClinicalStatus}
                    onChange={(e) => setSheetFormData({ ...sheetFormData, transferClinicalStatus: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSheetModalOpen(false)}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Fechar Painel
            </button>
            <button
              onClick={() => {
                handlePrintClinicalSheet(activeSheetType);
                setIsSheetModalOpen(false);
              }}
              className="flex-1 py-3 px-4 bg-navy hover:bg-navy/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Documento Físico
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
