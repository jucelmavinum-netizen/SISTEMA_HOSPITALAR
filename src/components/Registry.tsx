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
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Registry() {
  const [searchType, setSearchType] = React.useState<'bi' | 'card' | 'fingerprint'>('bi');
  const [showHistory, setShowHistory] = React.useState(false);

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
            placeholder={searchType === 'bi' ? "Digite o número do BI (ex: 001234567LA041)" : "Aguardando leitura..."}
            className="w-full pl-6 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all text-xl font-medium"
          />
          <button 
            onClick={() => setShowHistory(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </div>
      </div>

      {showHistory ? (
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
                  src="https://picsum.photos/seed/patient1/200/200" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-900">António João Manuel</h2>
              <p className="text-sm text-slate-500">BI: 005432189LA045</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Idade</p>
                  <p className="font-bold text-slate-700">34 anos</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gênero</p>
                  <p className="font-bold text-slate-700">Masculino</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tipo Sanguíneo</p>
                  <p className="font-bold text-red-600">O+</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Alergias</p>
                  <p className="font-bold text-amber-600">Penicilina</p>
                </div>
              </div>

              <button className="w-full mt-8 bg-emerald text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald/20 transition-all">
                <QrCode className="w-5 h-5" />
                Gerar Cartão Digital
              </button>
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
                {[
                  { date: '12 Mar 2024', hospital: 'Hospital Geral de Luanda', reason: 'Malária Grave', type: 'Internamento' },
                  { date: '05 Jan 2024', hospital: 'Centro de Saúde da Samba', reason: 'Consulta de Rotina', type: 'Ambulatório' },
                  { date: '20 Nov 2023', hospital: 'Hospital Josina Machel', reason: 'Fratura de Membro', type: 'Cirurgia' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl group-hover:border-emerald/30 transition-colors">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-slate-900">{item.reason}</h4>
                        <span className="text-xs font-medium text-slate-400">{item.date}</span>
                      </div>
                      <p className="text-sm text-slate-500">{item.hospital}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-500">{item.type}</span>
                        <button className="text-xs font-bold text-emerald flex items-center gap-1 hover:underline">
                          Ver detalhes <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
