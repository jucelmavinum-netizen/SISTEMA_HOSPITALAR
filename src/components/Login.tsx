import React from 'react';
import { 
  Lock, 
  MapPin, 
  Hospital, 
  ChevronRight,
  ShieldCheck,
  Globe,
  Mail,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [role, setRole] = React.useState('reception');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        setMessage('Cadastro realizado! Verifique seu email para confirmar a conta (se habilitado) ou tente fazer login.');
        setIsLoading(false);
        setIsRegistering(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Credenciais inválidas. Verifique seu email e senha.' : error.message);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl shadow-navy/10 overflow-hidden border border-slate-100">
        
        {/* Left Side - Branding & Info */}
        <div className="bg-navy p-12 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-emerald rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald/20">
                S
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">SISA</h1>
                <p className="text-emerald font-medium text-sm">Sistema Integrado de Saúde</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Gestão Hospitalar <br />
                <span className="text-emerald">Inteligente para Angola.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                Conectando unidades de saúde, unificando históricos clínicos e otimizando o atendimento ao cidadão em todo o território nacional.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-12 border-t border-white/10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Acesso Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Rede Nacional</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">
                {isRegistering ? 'Criar Nova Conta' : 'Acesso ao Sistema'}
              </h3>
              <p className="text-slate-500 mt-2">
                {isRegistering 
                  ? 'Preencha os dados para se cadastrar como profissional.' 
                  : 'Entre com suas credenciais institucionais.'}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium"
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        required
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="António João Manuel"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald focus:bg-white transition-all font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Perfil de Acesso</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <select 
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald focus:bg-white transition-all appearance-none font-medium text-slate-700"
                      >
                        <option value="admin">Administrador</option>
                        <option value="doctor">Médico / Especialista</option>
                        <option value="nurse">Enfermeiro / Triagem</option>
                        <option value="reception">Recepção / Atendimento</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Institucional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@minsa.gov.ao"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy text-white py-5 rounded-2xl font-bold text-lg hover:bg-navy/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-navy/20 active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 text-center space-y-4">
              <p className="text-sm text-slate-500">
                {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}
                <button 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                    setMessage(null);
                  }}
                  className="ml-2 text-emerald font-bold hover:underline"
                >
                  {isRegistering ? 'Fazer Login' : 'Criar Conta'}
                </button>
              </p>
              <p className="text-xs text-slate-400">
                Problemas com o acesso? <button className="text-emerald font-bold hover:underline">Contate o suporte técnico MINSA</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
