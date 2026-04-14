import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  FlaskConical,
  BedDouble,
  Wallet,
  Calendar,
  Package,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import React from 'react';

const waitTimeData = [
  { sector: 'Triagem', time: 15, capacity: 45 },
  { sector: 'Urgência', time: 120, capacity: 95 },
  { sector: 'Pediatria', time: 45, capacity: 60 },
  { sector: 'Ortopedia', time: 30, capacity: 30 },
  { sector: 'Ginecologia', time: 60, capacity: 50 },
];

interface DashboardProps {
  user: {
    role: string;
    hospital: string;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [patientCount, setPatientCount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (!error) setPatientCount(count);
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: '12.4M Kz', icon: Wallet, trend: '+8%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Custo Operacional', value: '8.2M Kz', icon: TrendingUp, trend: '+2%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Totais', value: isLoading ? '...' : patientCount?.toString() || '0', icon: Users, trend: 'Base de Dados', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ruptura de Stock', value: '05', icon: Package, trend: '-12%', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Desempenho Financeiro (Últimos 6 Meses)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: 'Jan', revenue: 10, cost: 7 },
                { month: 'Fev', revenue: 11, cost: 7.5 },
                { month: 'Mar', revenue: 12.4, cost: 8.2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Distribuição de Recursos</h3>
          <div className="space-y-4">
            {['Médicos', 'Enfermeiros', 'Técnicos', 'Administrativos'].map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">{cat}</span>
                <span className="text-navy font-bold">{[85, 142, 65, 50][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consultas Hoje', value: '12', icon: Calendar, trend: '60% concluído', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Internados', value: '08', icon: BedDouble, trend: '02 altas hoje', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Exames Pendentes', value: '05', icon: FlaskConical, trend: '03 urgentes', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Tempo Médio/Consulta', value: '22 min', icon: Clock, trend: '-2 min', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Próximos Atendimentos</h3>
          <div className="space-y-4">
            {[
              { time: '10:30', patient: 'Maria Domingos', type: 'Retorno', priority: 'Normal' },
              { time: '11:00', patient: 'João Afonso', type: 'Consulta', priority: 'Urgente' },
              { time: '11:30', patient: 'Teresa Bento', type: 'Exame', priority: 'Normal' },
            ].map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-navy">{app.time}</span>
                  <div>
                    <p className="font-bold text-slate-900">{app.patient}</p>
                    <p className="text-xs text-slate-500">{app.type}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  app.priority === 'Urgente' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                )}>{app.priority}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Alertas Clínicos</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-sm font-bold text-red-700">Resultado Crítico</p>
              <p className="text-xs text-red-600 mt-1">Paciente Simão Pedro (Quarto 204) - Hemoglobina baixa.</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-sm font-bold text-amber-700">Alta Pendente</p>
              <p className="text-xs text-amber-600 mt-1">Aguardando assinatura para alta de Rosa Maria.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNurseDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Fila de Triagem', value: '14', icon: Stethoscope, trend: 'Tempo: 15min', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Leitos Disponíveis', value: '05', icon: BedDouble, trend: '85% ocupado', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Medicação Pendente', value: '22', icon: Package, trend: '08 urgentes', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Alertas de Sinais', value: '02', icon: AlertTriangle, trend: 'Crítico', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Fila de Triagem (Protocolo Manchester)</h3>
          <div className="space-y-4">
            {waitTimeData.map((sector, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full", sector.time > 60 ? "bg-red-500" : "bg-emerald-500")} />
                  <span className="font-bold text-slate-700">{sector.sector}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-navy">{sector.time} min</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Espera</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Estado das Enfermarias</h3>
          <div className="space-y-6">
            {['Pediatria', 'Maternidade', 'Cirurgia'].map((ward, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{ward}</span>
                  <span className="font-bold text-navy">{[90, 75, 60][i]}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald rounded-full" style={{ width: `${[90, 75, 60][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceptionDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Admissões Hoje', value: '45', icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Agendamentos', value: '28', icon: Calendar, trend: '8 pendentes', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Faturas Pendentes', value: '12', icon: Wallet, trend: 'Total: 450k', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Tempo de Espera', value: '12 min', icon: Clock, trend: 'Estável', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Últimas Admissões</h3>
          <div className="space-y-4">
            {[
              { name: 'Joaquim Neto', time: '09:30', type: 'Particular', status: 'Triagem' },
              { name: 'Rosa Maria', time: '09:45', type: 'Seguro ENSA', status: 'Aguardando' },
              { name: 'Simão Pedro', time: '10:05', type: 'Isenção', status: 'Triagem' },
            ].map((adm, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-900">{adm.name}</p>
                  <p className="text-xs text-slate-500">{adm.type} • {adm.time}</p>
                </div>
                <span className="text-xs font-bold text-emerald">{adm.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Resumo de Pagamentos</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
             <div className="text-center">
                <p className="text-4xl font-bold text-navy">850.000 Kz</p>
                <p className="text-sm text-slate-500 mt-2">Total faturado hoje</p>
                <div className="mt-6 flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald">65%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Particular</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">35%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Seguros</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (user.role) {
      case 'admin': return renderAdminDashboard();
      case 'doctor': return renderDoctorDashboard();
      case 'nurse': return renderNurseDashboard();
      case 'reception': return renderReceptionDashboard();
      default: return renderAdminDashboard();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Painel de Controle</h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao SISA, {user.role === 'admin' ? 'Administrador' : user.role === 'doctor' ? 'Doutor' : user.role === 'nurse' ? 'Enfermeiro' : 'Atendente'}.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          {new Date().toLocaleDateString('pt-AO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color, bg, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <span className={cn(
          "flex items-center text-xs font-bold px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : trend.includes('Crítico') ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
        )}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </motion.div>
  );
}
