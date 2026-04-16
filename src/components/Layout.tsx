import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Fingerprint,
  Stethoscope, 
  Activity, 
  Wifi, 
  WifiOff, 
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  BedDouble,
  Pill,
  Users,
  PackageSearch,
  BarChart3,
  Wallet,
  Calendar as CalendarIcon,
  FlaskConical
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOffline: boolean;
  user: {
    province: string;
    municipality: string;
    hospital: string;
    role: string;
    full_name?: string;
  };
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, isOffline, user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    doctor: 'Médico',
    nurse: 'Enfermeiro',
    reception: 'Recepção'
  };

  const menuItems = [
    { id: 'dashboard', label: 'Gestão de Enchentes', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'admission', label: 'Admissão de Pacientes', icon: UserPlus, roles: ['admin', 'nurse', 'reception'] },
    { id: 'registry', label: 'Registro e Biometria', icon: Fingerprint, roles: ['admin', 'doctor', 'nurse', 'reception'] },
    { id: 'scheduling', label: 'Agendamento', icon: CalendarIcon, roles: ['admin', 'doctor', 'reception'] },
    { id: 'triage', label: 'Triagem Dinâmica', icon: Stethoscope, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'laboratory', label: 'Laboratório', icon: FlaskConical, roles: ['admin', 'doctor'] },
    { id: 'beds', label: 'Censo e Leitos', icon: BedDouble, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'pharmacy', label: 'Farmácia e Stock', icon: Pill, roles: ['admin', 'nurse'] },
    { id: 'hr', label: 'Recursos Humanos', icon: Users, roles: ['admin'] },
    { id: 'tracking', label: 'Rastreio de Recursos', icon: PackageSearch, roles: ['admin', 'nurse'] },
    { id: 'stats', label: 'Estatísticas e Relatórios', icon: BarChart3, roles: ['admin'] },
    { id: 'finance', label: 'Gestão Financeira', icon: Wallet, roles: ['admin', 'reception'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-navy text-white transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-emerald rounded-lg flex items-center justify-center font-bold text-xl">
            S
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight">SISA</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6 shrink-0", activeTab === item.id ? "text-white" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar paciente ou ID..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
              isOffline ? "bg-amber-100 text-amber-700" : "bg-emerald/10 text-emerald-700"
            )}>
              {isOffline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Modo Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Conectado</span>
                </>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors",
                  isNotificationsOpen && "bg-slate-100 text-emerald"
                )}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] py-2">
                  <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-900">Notificações</h4>
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">2 Novas</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { title: 'Resultado de Exame', desc: 'Maria Domingos - Sangue liberado', time: '10 min ago', type: 'lab', target: 'laboratory' },
                      { title: 'Novo Agendamento', desc: 'Consulta para amanhã às 09:00', time: '1h ago', type: 'app', target: 'scheduling' },
                    ].map((n, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          setActiveTab(n.target);
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group"
                      >
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{n.time}</p>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-slate-50">
                    <button className="text-[10px] font-bold text-emerald hover:underline">Ver Todas</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.full_name || user.hospital}</p>
                <p className="text-[10px] text-emerald font-bold uppercase mt-1">
                  {user.role === 'doctor' ? `Dr. ${user.full_name?.split(' ')[0]}` : (roleLabels[user.role] || user.role)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.hospital}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors group relative"
              >
                <span className="group-hover:hidden">{getInitials(user.full_name)}</span>
                <LogOut className="w-5 h-5 hidden group-hover:block" />
                <span className="absolute -bottom-8 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
