import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
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
  };
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, isOffline, user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    doctor: 'Médico',
    nurse: 'Enfermeiro',
    reception: 'Recepção'
  };

  const menuItems = [
    { id: 'dashboard', label: 'Gestão de Enchentes', icon: LayoutDashboard },
    { id: 'registry', label: 'Registro e Biometria', icon: UserPlus },
    { id: 'scheduling', label: 'Agendamento', icon: CalendarIcon },
    { id: 'triage', label: 'Triagem Dinâmica', icon: Stethoscope },
    { id: 'laboratory', label: 'Laboratório', icon: FlaskConical },
    { id: 'beds', label: 'Censo e Leitos', icon: BedDouble },
    { id: 'pharmacy', label: 'Farmácia e Stock', icon: Pill },
    { id: 'hr', label: 'Recursos Humanos', icon: Users },
    { id: 'tracking', label: 'Rastreio de Recursos', icon: PackageSearch },
    { id: 'stats', label: 'Estatísticas e Relatórios', icon: BarChart3 },
    { id: 'finance', label: 'Gestão Financeira', icon: Wallet },
  ];

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

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
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

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.hospital}</p>
                <p className="text-[10px] text-emerald font-bold uppercase mt-1">{roleLabels[user.role] || user.role}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.municipality}, {user.province}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors group relative"
              >
                <span className="group-hover:hidden">MN</span>
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
