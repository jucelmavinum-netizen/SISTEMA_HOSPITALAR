import React from 'react';
import { 
  Thermometer, 
  Activity, 
  Heart, 
  Wind, 
  AlertCircle,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { TriageColor } from '../types';

export default function Triage() {
  const [selectedColor, setSelectedColor] = React.useState<TriageColor | null>(null);
  const [vitals, setVitals] = React.useState({
    temp: '',
    bp: '',
    hr: '',
    o2: ''
  });

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
            <button className="text-sm font-bold text-red-700 hover:underline flex items-center gap-1">
              Encaminhamento Imediato <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald min-h-[120px]"
                placeholder="Descreva os sintomas e observações clínicas..."
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                Limpar Formulário
              </button>
              <button 
                disabled={!selectedColor}
                className={cn(
                  "flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                  selectedColor 
                    ? "bg-navy text-white shadow-lg shadow-navy/20 hover:scale-[1.02]" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Finalizar Triagem e Encaminhar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
