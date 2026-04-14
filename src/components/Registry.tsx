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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

export default function Registry() {
  const [searchType, setSearchType] = React.useState<'bi' | 'card' | 'fingerprint'>('bi');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [patient, setPatient] = React.useState<any>(null);
  const [clinicalHistory, setClinicalHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = React.useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setError(null);
    setPatient(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('bi_number', searchTerm)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Paciente não encontrado com este B.I.');
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Registro Único e Biometria</h1>
        <p className="text-slate-500">Identificação integrada com a base de dados nacional.</p>
      </div>

      {/* Search Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-center gap-4">
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
            placeholder={searchType === 'bi' ? "Digite o número do BI (ex: 001234567LA041)" : "Aguardando leitura..."}
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
          <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {patient ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Patient Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-emerald/20">
                <img 
                  src={`https://picsum.photos/seed/${patient.id}/200/200`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{patient.full_name}</h2>
              <p className="text-sm text-slate-500">BI: {patient.bi_number}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gênero</p>
                  <p className="font-bold text-slate-700">{patient.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Província</p>
                  <p className="font-bold text-slate-700">{patient.province}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Financiamento</p>
                  <p className="font-bold text-emerald capitalize">{patient.financing_type}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Nº Processo</p>
                  <p className="font-bold text-navy">{patient.process_number}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsCardModalOpen(true)}
                className="w-full mt-8 bg-emerald text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald/20 transition-all"
              >
                <QrCode className="w-5 h-5" />
                Gerar Cartão Digital
              </button>
            </div>
          </div>

          <Modal
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            title="Cartão Digital do Paciente"
          >
            <div className="space-y-6">
              <div className="relative bg-gradient-to-br from-navy to-slate-800 p-8 rounded-3xl text-white overflow-hidden shadow-2xl">
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
                    <p className="font-bold text-sm">{patient.bi_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tipo de Sangue</p>
                    <p className="font-bold text-sm">A+</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Província</p>
                    <p className="font-bold text-sm">{patient.province}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Validade</p>
                    <p className="font-bold text-sm">Indeterminada</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir Cartão
                </button>
                <button className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all">
                  <Download className="w-5 h-5" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </Modal>

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
                        <h4 className="font-bold text-slate-900">Triagem: {item.classification.toUpperCase()}</h4>
                        <span className="text-xs font-medium text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{item.notes}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white",
                          item.classification === 'red' ? 'bg-red-500' : 
                          item.classification === 'orange' ? 'bg-orange-500' :
                          item.classification === 'yellow' ? 'bg-yellow-500' :
                          item.classification === 'green' ? 'bg-green-500' : 'bg-blue-500'
                        )}>
                          {item.classification}
                        </span>
                        <button className="text-xs font-bold text-emerald flex items-center gap-1 hover:underline">
                          Ver detalhes <ExternalLink className="w-3 h-3" />
                        </button>
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
        /* Temporary ID Generation */
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Paciente sem Documentação?</h3>
              <p className="text-sm text-slate-500">Gere um ID temporário para atendimento imediato.</p>
            </div>
          </div>

          <form className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nome Completo (ou Descrição)</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald" placeholder="Ex: Desconhecido - Trauma Estrada" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Gênero Estimado</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald">
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Não Identificado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Idade Estimada</label>
              <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald" placeholder="Ex: 25" />
            </div>
            <button className="col-span-2 mt-4 bg-navy text-white py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Gerar ID Temporário e Iniciar Triagem
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
