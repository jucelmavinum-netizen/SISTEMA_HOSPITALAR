import React from 'react';
import { 
  Thermometer, 
  Activity, 
  Heart, 
  Wind, 
  AlertCircle,
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  Loader2,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { TriageColor } from '../types';
import { supabase } from '../lib/supabase';

export default function Triage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [patient, setPatient] = React.useState<any>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<TriageColor | null>(null);
  const [notes, setNotes] = React.useState('');
  const [vitals, setVitals] = React.useState({
    temp: '',
    bp: '',
    hr: '',
    o2: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    setError(null);
    setPatient(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`bi_number.eq.${searchTerm},process_number.eq.${searchTerm}`)
        .single();

      if (error) {
        setError('Paciente não encontrado. Verifique o B.I. ou Nº de Processo.');
      } else {
        setPatient(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!patient || !selectedColor) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('triage_records')
        .insert([{
          patient_id: patient.id,
          classification: selectedColor,
          vitals: vitals,
          notes: notes,
          nurse_id: user?.id
        }]);

      if (error) throw error;

      setSuccess(true);
      // Reset form
      setPatient(null);
      setSearchTerm('');
      setSelectedColor(null);
      setNotes('');
      setVitals({ temp: '', bp: '', hr: '', o2: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erro ao salvar triagem: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors: { id: TriageColor; label: string; time: string; colorClass: string }[] = [
    { id: 'red', label: 'Emergência', time: 'Imediato', colorClass: 'manchester-red' },
    { id: 'orange', label: 'Muito Urgente', time: '10 min', colorClass: 'manchester-orange' },
    { id: 'yellow', label: 'Urgente', time: '60 min', colorClass: 'manchester-yellow' },
    { id: 'green', label: 'Pouco Urgente', time: '120 min', colorClass: 'manchester-green' },
    { id: 'blue', label: 'Não Urgente', time: '240 min', colorClass: 'manchester-blue' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Triagem Dinâmica</h1>
          <p className="text-slate-500 mt-1">Protocolo de Manchester Adaptado (SISA).</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-xs font-bold text-red-600 uppercase">Emergência Crítica?</p>
            <button 
              onClick={async () => {
                if (!patient && searchTerm) {
                  await handleSearch();
                }
                setSelectedColor('red');
                setNotes('ENCAMINHAMENTO IMEDIATO - EMERGÊNCIA CRÍTICA');
              }}
              className="text-sm font-bold text-red-700 hover:underline flex items-center gap-1"
            >
              Encaminhamento Imediato <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Buscar Paciente (B.I. ou Nº Processo)</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: 001234567LA041"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium"
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-navy text-white px-8 py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2 disabled:opacity-70 h-[60px]"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Identificar
          </button>
        </div>

        {patient && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-emerald-200">
                <User className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{patient.full_name}</h4>
                <p className="text-xs text-slate-500">Processo: {patient.process_number} | BI: {patient.bi_number}</p>
              </div>
            </div>
            <button onClick={() => setPatient(null)} className="text-slate-400 hover:text-red-500 transition-colors">
              Alterar
            </button>
          </motion.div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Triagem finalizada e enviada com sucesso!
          </div>
        )}
      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity", !patient && "opacity-50 pointer-events-none")}>
        {/* Vitals Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald" />
              Sinais Vitais
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Temperatura (°C)', icon: Thermometer, key: 'temp', placeholder: '36.5' },
                { label: 'Pressão Arterial', icon: Activity, key: 'bp', placeholder: '120/80' },
                { label: 'Freq. Cardíaca (bpm)', icon: Heart, key: 'hr', placeholder: '80' },
                { label: 'Saturação O2 (%)', icon: Wind, key: 'o2', placeholder: '98' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      value={vitals[field.key as keyof typeof vitals]}
                      onChange={(e) => setVitals({...vitals, [field.key]: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald transition-all"
                      placeholder={field.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Classificação de Risco</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
                    selectedColor === color.id 
                      ? "border-slate-900 ring-4 ring-slate-100" 
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("absolute top-0 left-0 w-2 h-full", color.colorClass)} />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{color.label}</h4>
                      <p className="text-sm text-slate-500 mt-1">Tempo de espera: <span className="font-bold">{color.time}</span></p>
                    </div>
                    {selectedColor === color.id && (
                      <CheckCircle2 className="w-6 h-6 text-emerald" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase block">Queixa Principal / Observações</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald min-h-[120px]"
                placeholder="Descreva os sintomas e observações clínicas..."
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => {
                  setPatient(null);
                  setSearchTerm('');
                  setSelectedColor(null);
                  setNotes('');
                  setVitals({ temp: '', bp: '', hr: '', o2: '' });
                }}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Limpar Formulário
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!selectedColor || isSubmitting}
                className={cn(
                  "flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                  selectedColor && !isSubmitting
                    ? "bg-navy text-white shadow-lg shadow-navy/20 hover:scale-[1.02]" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Finalizar Triagem e Encaminhar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
