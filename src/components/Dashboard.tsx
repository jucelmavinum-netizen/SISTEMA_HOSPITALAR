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
  Loader2,
  ClipboardList
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
import Modal from './ui/Modal';
import { CheckCircle2, X } from 'lucide-react';

const waitTimeData = [
  { sector: 'Triagem', time: 15, capacity: 45 },
  { sector: 'Urgência', time: 120, capacity: 95 },
  { sector: 'Pediatria', time: 45, capacity: 60 },
  { sector: 'Ortopedia', time: 30, capacity: 30 },
  { sector: 'Ginecologia', time: 60, capacity: 50 },
];

interface DashboardProps {
  user: {
    id: string;
    role: string;
    hospital_name?: string;
  };
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ user, setActiveTab }: DashboardProps) {
  const [stats, setStats] = React.useState({
    patientCount: 0,
    staffCount: 0,
    criticalStock: 0,
    triageStats: [] as any[],
    recentPatients: [] as any[],
    monthlyRevenue: 0,
    doctorAppointments: [] as any[],
    pendingExams: 0,
    inpatientCount: 0,
    criticalExams: [] as any[],
    pendingDischarges: [] as any[]
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState(false);
  const [alertType, setAlertType] = React.useState<'critical' | 'discharge' | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Patient Count
        const { count: pCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // 2. Staff Count
        const { count: sCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Critical Stock
        const { data: inventory } = await supabase
          .from('inventory')
          .select('quantity, min_stock');
        const cStock = inventory?.filter(item => item.quantity <= item.min_stock).length || 0;

        // 4. Triage Stats
        const { data: triage } = await supabase
          .from('triage_records')
          .select('classification');
        
        const triageCounts = triage?.reduce((acc: any, curr) => {
          acc[curr.classification] = (acc[curr.classification] || 0) + 1;
          return acc;
        }, {});

        const formattedTriage = [
          { sector: 'Vermelho', count: triageCounts?.red || 0, color: '#ef4444' },
          { sector: 'Laranja', count: triageCounts?.orange || 0, color: '#f97316' },
          { sector: 'Amarelo', count: triageCounts?.yellow || 0, color: '#eab308' },
          { sector: 'Verde', count: triageCounts?.green || 0, color: '#10b981' },
          { sector: 'Azul', count: triageCounts?.blue || 0, color: '#3b82f6' },
        ];

        // 5. Recent Patients
        const { data: recent } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // 6. Alertas e Dados Específicos
        const { data: criticalExams } = await supabase
          .from('exams')
          .select('*, patients(full_name)')
          .eq('status', 'pending')
          .limit(10); // Mocking critical for now or use a 'result' check if schema allows

        const { data: occupiedBeds } = await supabase
          .from('beds')
          .select('*, patients(full_name)')
          .eq('status', 'occupied');

        if (user.role === 'doctor') {
          const { data: docApps } = await supabase
            .from('appointments')
            .select('*, patients(full_name)')
            .eq('doctor_id', user.id)
            .eq('status', 'scheduled')
            .order('appointment_date');
          
          const { count: examsCount } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

          const { count: bedsCount } = await supabase
            .from('beds')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'occupied');

          setStats(prev => ({
            ...prev,
            doctorAppointments: docApps || [],
            pendingExams: examsCount || 0,
            inpatientCount: bedsCount || 0
          }));
        }

        // Fetch Monthly Revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: revenueData } = await supabase
          .from('finance_records')
          .select('amount')
          .eq('type', 'income')
          .gte('created_at', startOfMonth.toISOString());

        const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

        setStats(prev => ({
          ...prev,
          patientCount: pCount || 0,
          staffCount: sCount || 0,
          criticalStock: cStock,
          triageStats: formattedTriage,
          recentPatients: recent || [],
          monthlyRevenue,
          criticalExams: criticalExams || [],
          pendingDischarges: occupiedBeds || []
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id, user.role]);

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Mensal', value: isLoading ? '...' : `${(stats.monthlyRevenue / 1000000).toFixed(1)}M Kz`, icon: Wallet, trend: '+8%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Funcionários Ativos', value: isLoading ? '...' : stats.staffCount.toString(), icon: Users, trend: 'Estável', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Totais', value: isLoading ? '...' : stats.patientCount.toString(), icon: Users, trend: 'Base de Dados', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ruptura de Stock', value: isLoading ? '...' : stats.criticalStock.toString().padStart(2, '0'), icon: Package, trend: 'Crítico', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Ocupação por Classificação (Triagem)</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Tempo Real</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.triageStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.triageStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Últimos Pacientes Admitidos</h3>
          <div className="space-y-4">
            {stats.recentPatients.length > 0 ? stats.recentPatients.map((patient, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">
                  {patient.full_name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{patient.full_name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{patient.process_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(patient.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 italic">
                Nenhum paciente admitido recentemente.
              </div>
            )}
          </div>
          <button 
            onClick={() => setActiveTab('registry')}
            className="w-full mt-6 py-3 text-sm font-bold text-emerald hover:bg-emerald-50 rounded-xl transition-all"
          >
            Ver Todos os Registros
          </button>
        </div>
      </div>
    </div>
  );

  const renderDoctorDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consultas Hoje', value: stats.doctorAppointments.length.toString(), icon: Calendar, trend: 'Próximas', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Internados', value: stats.inpatientCount.toString(), icon: BedDouble, trend: 'Ocupação', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Exames Pendentes', value: stats.pendingExams.toString(), icon: FlaskConical, trend: 'Laboratório', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Tempo Médio/Consulta', value: '22 min', icon: Clock, trend: '-2 min', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Próximos Atendimentos</h3>
          <div className="space-y-4">
            {stats.doctorAppointments.length > 0 ? stats.doctorAppointments.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-navy">
                    {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{app.patients?.full_name}</p>
                    <p className="text-xs text-slate-500">{app.type}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  app.type === 'Urgência' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                )}>{app.type === 'Urgência' ? 'Urgente' : 'Normal'}</span>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 italic">
                Nenhuma consulta agendada para hoje.
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Ações Rápidas</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('pep')}
              className="w-full flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6 text-emerald" />
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-900">Prontuário (PEP)</p>
                <p className="text-xs text-emerald-700/60">Abrir histórico completo e prescrição</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('triage')}
              className="w-full flex items-center gap-4 p-4 bg-navy text-white rounded-2xl hover:bg-navy/90 transition-all group"
            >
              <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Fila de Triagem</p>
                <p className="text-xs text-white/60">Ver pacientes classificados</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Alertas Clínicos</h3>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setAlertType('critical');
                setIsAlertModalOpen(true);
              }}
              className="w-full text-left p-4 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-all transition-all group"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-red-700">Resultado Crítico</p>
                <span className="text-[10px] font-bold bg-red-200 text-red-700 px-2 py-0.5 rounded-full">{stats.criticalExams.length}</span>
              </div>
              <p className="text-xs text-red-600 mt-1">Verifique os últimos exames laboratoriais pendentes.</p>
            </button>
            <button 
              onClick={() => {
                setAlertType('discharge');
                setIsAlertModalOpen(true);
              }}
              className="w-full text-left p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-all group"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-amber-700">Alta Pendente</p>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">{stats.pendingDischarges.length}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Existem pacientes aguardando revisão para alta.</p>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertType === 'critical' ? 'Resultados Críticos' : 'Pacientes para Alta'}
      >
        <div className="space-y-4">
          {alertType === 'critical' ? (
            stats.criticalExams.length > 0 ? stats.criticalExams.map((exam, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{exam.patients?.full_name}</p>
                  <p className="text-xs text-slate-500">{exam.exam_type} • Pendente</p>
                </div>
                <button 
                  onClick={() => setActiveTab('laboratory')}
                  className="px-3 py-1 bg-navy text-white text-[10px] font-bold rounded-lg uppercase"
                >
                  Ver Laudo
                </button>
              </div>
            )) : <p className="text-center py-8 text-slate-400">Nenhum resultado crítico pendente.</p>
          ) : (
            stats.pendingDischarges.length > 0 ? stats.pendingDischarges.map((bed, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{bed.patients?.full_name}</p>
                  <p className="text-xs text-slate-500">Leito {bed.bed_number} • {bed.ward}</p>
                </div>
                <button 
                  onClick={() => setActiveTab('beds')}
                  className="px-3 py-1 bg-emerald text-white text-[10px] font-bold rounded-lg uppercase"
                >
                  Processar Alta
                </button>
              </div>
            )) : <p className="text-center py-8 text-slate-400">Nenhum paciente aguardando alta.</p>
          )}
        </div>
      </Modal>
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
