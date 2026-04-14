import React from 'react';
import { 
  User, 
  CreditCard, 
  MapPin, 
  Shield, 
  FileText, 
  Save, 
  X, 
  CheckCircle2,
  AlertCircle,
  Hash,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Mock data for Angola's administrative structure
const angolaData = {
  'Luanda': {
    municipalities: {
      'Luanda': ['Ingombota', 'Maianga', 'Rangel', 'Samba', 'Sambizanga'],
      'Belas': ['Quenguela', 'Morro dos Veados', 'Vila Estoril'],
      'Cazenga': ['Hoji-ya-Henda', 'Tala Hady', 'Cazenga Popular'],
      'Viana': ['Viana Sede', 'Estalagem', 'Kikuxi', 'Zango'],
      'Talatona': ['Talatona Sede', 'Benfica', 'Futungo de Belas'],
      'Kilamba Kiaxi': ['Sapú', 'Golfe', 'Neves Bendinha']
    }
  },
  'Benguela': {
    municipalities: {
      'Benguela': ['Benguela Sede', 'Zona A', 'Zona B'],
      'Lobito': ['Lobito Sede', 'Canata', 'Compão'],
      'Catumbela': ['Catumbela Sede', 'Biopio']
    }
  },
  'Huambo': {
    municipalities: {
      'Huambo': ['Huambo Sede', 'Calenga'],
      'Caála': ['Caála Sede', 'Cuima']
    }
  }
};

const insurers = ['ENSA', 'Nossa Seguros', 'Saham', 'Fidelidade', 'Tranquilidade', 'Bonws'];

export default function PatientAdmission() {
  const [formData, setFormData] = React.useState({
    fullName: '',
    docType: 'bi',
    docNumber: '',
    processNumber: 'HGL-' + Math.floor(100000 + Math.random() * 900000),
    province: '',
    municipality: '',
    district: '',
    financing: 'public',
    insurer: '',
    birthDate: '',
    gender: 'M'
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const validateBI = (bi: string) => {
    const regex = /^\d{13}[A-Z]$/;
    return regex.test(bi);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = 'Nome completo é obrigatório';
    if (formData.docType === 'bi' && !validateBI(formData.docNumber)) {
      newErrors.docNumber = 'Formato de BI inválido (13 dígitos + 1 letra)';
    }
    if (!formData.province) newErrors.province = 'Província é obrigatória';
    if (!formData.municipality) newErrors.municipality = 'Município é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('patients')
        .insert([{
          full_name: formData.fullName,
          bi_number: formData.docNumber,
          birth_date: formData.birthDate || null,
          gender: formData.gender,
          process_number: formData.processNumber,
          province: formData.province,
          municipality: formData.municipality,
          district: formData.district,
          financing_type: formData.financing,
          insurer: formData.insurer || null,
          created_by: user?.id
        }]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        fullName: '',
        docType: 'bi',
        docNumber: '',
        processNumber: 'HGL-' + Math.floor(100000 + Math.random() * 900000),
        province: '',
        municipality: '',
        district: '',
        financing: 'public',
        insurer: '',
        birthDate: '',
        gender: 'M'
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableMunicipalities = formData.province ? Object.keys((angolaData as any)[formData.province].municipalities) : [];
  const availableDistricts = (formData.province && formData.municipality) ? (angolaData as any)[formData.province].municipalities[formData.municipality] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admissão de Paciente</h1>
          <p className="text-slate-500 mt-1">Cadastro detalhado conforme normas do MINSA e estrutura administrativa nacional.</p>
        </div>
        <div className="bg-emerald/10 text-emerald px-4 py-2 rounded-xl flex items-center gap-2">
          <Hash className="w-5 h-5" />
          <span className="font-bold">Processo: {formData.processNumber}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {submitError}
          </div>
        )}
        {/* Personal Info Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Dados Pessoais e Identificação</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome Completo</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={cn(
                  "w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium",
                  errors.fullName ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-emerald"
                )}
                placeholder="Ex: António João Manuel"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.fullName}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tipo de Documento</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <select 
                  name="docType"
                  value={formData.docType}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all appearance-none font-medium"
                >
                  <option value="bi">Bilhete de Identidade (B.I.)</option>
                  <option value="passport">Passaporte</option>
                  <option value="resident">Cartão de Residente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Número do Documento</label>
              <input 
                type="text" 
                name="docNumber"
                value={formData.docNumber}
                onChange={handleInputChange}
                className={cn(
                  "w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium",
                  errors.docNumber ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-emerald"
                )}
                placeholder={formData.docType === 'bi' ? "Ex: 001234567LA041" : "Número do documento"}
              />
              {errors.docNumber && <p className="text-xs text-red-500 mt-1 font-bold">{errors.docNumber}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Data de Nascimento</label>
              <input 
                type="date" 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gênero</label>
              <div className="flex gap-4">
                {['M', 'F'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: g as any }))}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-bold transition-all border-2",
                      formData.gender === g 
                        ? "border-emerald bg-emerald/5 text-emerald" 
                        : "border-slate-100 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    {g === 'M' ? 'Masculino' : 'Feminino'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Residência e Localização</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Província</label>
              <select 
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium"
              >
                <option value="">Selecione...</option>
                {Object.keys(angolaData).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Município</label>
              <select 
                name="municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                disabled={!formData.province}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {availableMunicipalities.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Distrito Urbano / Bairro</label>
              <select 
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                disabled={!formData.municipality}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {availableDistricts.map((d: string) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Financing Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Responsabilidade Financeira</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 flex gap-4">
              {[
                { id: 'particular', label: 'Particular', icon: User },
                { id: 'insurance', label: 'Seguro de Saúde', icon: Shield },
                { id: 'public', label: 'Sistema Público / Isenção', icon: Globe },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, financing: type.id as any }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl font-bold transition-all border-2",
                    formData.financing === type.id 
                      ? "border-amber-500 bg-amber-50 text-amber-700" 
                      : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs text-center">{type.label}</span>
                </button>
              ))}
            </div>

            {formData.financing === 'insurance' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="md:col-span-3"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Seguradora</label>
                <select 
                  name="insurer"
                  value={formData.insurer}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald transition-all font-medium"
                >
                  <option value="">Selecione a seguradora...</option>
                  {insurers.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button 
            type="button"
            className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-12 py-4 bg-navy text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-navy/20",
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-navy/90 active:scale-95"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Finalizar Admissão
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Notification */}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-emerald text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
        >
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <p className="font-bold">Admissão Concluída!</p>
            <p className="text-xs text-white/80">Paciente registrado com sucesso no sistema.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
