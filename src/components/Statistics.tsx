import React from 'react';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Activity, 
  Download,
  Calendar,
  Map as MapIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const epiData = [
  { day: 'Seg', malaria: 45, colera: 2, gripe: 120 },
  { day: 'Ter', malaria: 52, colera: 0, gripe: 110 },
  { day: 'Qua', malaria: 38, colera: 5, gripe: 135 },
  { day: 'Qui', malaria: 65, colera: 1, gripe: 150 },
  { day: 'Sex', malaria: 48, colera: 0, gripe: 140 },
  { day: 'Sab', malaria: 70, colera: 3, gripe: 160 },
  { day: 'Dom', malaria: 85, colera: 8, gripe: 180 },
];

export default function Statistics() {
  const [stats, setStats] = React.useState({
    patients: 0,
    consultations: 0,
    exams: 0,
    recentAdmissions: [] as any[],
    diagnosisStats: [] as any[]
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    
    // Total patients
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Total consultations
    const { count: consultationCount } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    // Total exams
    const { count: examCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });

    // Diagnosis distribution
    const { data: diagnosisData } = await supabase
      .from('consultations')
      .select('diagnosis');

    const diagMap: Record<string, number> = {};
    diagnosisData?.forEach(d => {
      if (d.diagnosis) {
        diagMap[d.diagnosis] = (diagMap[d.diagnosis] || 0) + 1;
      }
    });

    const diagnosisStats = Object.entries(diagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      patients: patientCount || 0,
      consultations: consultationCount || 0,
      exams: examCount || 0,
      recentAdmissions: [], // Could fetch daily admissions here
      diagnosisStats
    });
    
    setIsLoading(false);
  };

  const handleExportMINSA = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Indicador,Valor,Tendencia\n"
      + `Pacientes,${stats.patients},+15%\n`
      + `Consultas,${stats.consultations},+12%\n`
      + `Exames,${stats.exams},+8%`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_minsa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Relatório exportado com sucesso para o formato MINSA (CSV).');
  };

  const handlePeriodFilter = () => {
    alert('Funcionalidade de filtro por período:\nNesta versão demo, os dados são agregados dos últimos 7 dias por padrão.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Estatísticas e Relatórios</h1>
          <p className="text-slate-500 mt-1">Dados epidemiológicos e produtividade hospitalar.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePeriodFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Calendar className="w-4 h-4" />
            Período: Últimos 7 dias
          </button>
          <button 
            onClick={handleExportMINSA}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar para MINSA
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total de Pacientes', value: stats.patients.toString(), trend: '+15%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Consultas Realizadas', value: stats.consultations.toString(), trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Exames Processados', value: stats.exams.toString(), trend: '+8%', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Altas Médicas', value: '112', trend: '+5%', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Epidemiological Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-500" />
                  Tendência Epidemiológica
                </h3>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500" /> Malária</span>
                  <span className="flex items-center gap-1 text-red-600"><div className="w-2 h-2 rounded-full bg-red-500" /> Cólera</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={epiData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="malaria" stroke="#f59e0b" fill="#fef3c7" />
                    <Area type="monotone" dataKey="colera" stroke="#ef4444" fill="#fee2e2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Pathologies */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-emerald" />
                Mapa de Patologias
              </h3>
              <div className="space-y-6">
                {stats.diagnosisStats.length > 0 ? stats.diagnosisStats.map((patho, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{patho.name}</span>
                      <span className="text-slate-400">{patho.count} casos</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(patho.count / stats.consultations) * 100}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    Nenhum dado de patologia disponível.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official Reports List */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Relatórios Oficiais Pendentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Boletim Semanal Epidemiológico', status: 'ready', date: 'Hoje' },
                { title: 'Relatório de Produtividade Mensal', status: 'pending', date: 'Em 2 dias' },
                { title: 'Censo Hospitalar Diário', status: 'ready', date: 'Agora' },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{report.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{report.date}</p>
                    </div>
                  </div>
                  {report.status === 'ready' ? (
                    <button className="p-2 text-emerald hover:bg-emerald-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-2 text-slate-300">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
