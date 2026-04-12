import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  Warehouse, 
  AlertTriangle,
  MapPin,
  ChevronRight,
  PackageSearch
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const stages = [
  { id: 'pedido', label: 'Pedido', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'aprovacao', label: 'Aprovação', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'transito', label: 'Em Trânsito', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'recebido', label: 'Recebido', icon: Warehouse, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'distribuido', label: 'Distribuído', icon: Package, color: 'text-slate-500', bg: 'bg-slate-50' },
];

const activeResources = [
  { id: '1', name: 'Lote Artesunato (500un)', currentStage: 'transito', timeInStage: '2h 15min', priority: 'red' },
  { id: '2', name: 'Kit Cirúrgico Estéril', currentStage: 'aprovacao', timeInStage: '45 min', priority: 'orange' },
  { id: '3', name: 'Oxigénio (Cilindros)', currentStage: 'pedido', timeInStage: '10 min', priority: 'red' },
  { id: '4', name: 'Luvas e Máscaras', currentStage: 'recebido', timeInStage: '1h', priority: 'green' },
];

export default function Tracking() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rastreio de Recursos e Materiais</h1>
          <p className="text-slate-500 mt-1">Acompanhamento logístico de insumos críticos.</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Concluído
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Em Curso
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-200" /> Pendente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeResources.map((resource, idx) => (
          <motion.div 
            key={resource.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Resource Info */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className={cn(
                  "w-3 h-12 rounded-full",
                  `manchester-${resource.priority}`
                )} />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{resource.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <PackageSearch className="w-3 h-3" /> Origem: Depósito Central
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                <div className="relative flex justify-between items-center">
                  {stages.map((stage, i) => {
                    const currentIdx = stages.findIndex(s => s.id === resource.currentStage);
                    const isCompleted = i < currentIdx;
                    const isActive = i === currentIdx;

                    return (
                      <div key={stage.id} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all border-4",
                          isCompleted ? "bg-emerald-500 border-emerald-100 text-white" :
                          isActive ? "bg-white border-blue-500 text-blue-500 scale-110 shadow-lg shadow-blue-100" :
                          "bg-white border-slate-100 text-slate-300"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <stage.icon className="w-5 h-5" />}
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isActive ? "text-blue-600" : "text-slate-400"
                        )}>
                          {stage.label}
                        </span>
                        {isActive && (
                          <span className="absolute -bottom-6 whitespace-nowrap text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                            {resource.timeInStage}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pl-8 border-l border-slate-100">
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy p-8 rounded-3xl text-white">
          <h3 className="text-lg font-bold mb-4">Logística de Insumos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Pedidos Pendentes</span>
              <span className="font-bold">08</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Em Trânsito</span>
              <span className="font-bold">03</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Aguardando Conferência</span>
              <span className="font-bold">05</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-bold">Total em Fluxo</span>
              <span className="text-2xl font-bold text-emerald">16</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Alertas de Suprimentos</h3>
          <div className="space-y-4">
            {[
              { item: 'Oxigénio Líquido', alert: 'Nível abaixo de 20% no tanque principal', type: 'critical' },
              { item: 'Combustível Gerador', alert: 'Autonomia para apenas 12h', type: 'warning' },
              { item: 'Kits de Teste Malária', alert: 'Reposição necessária em 48h', type: 'info' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  )} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{alert.item}</p>
                    <p className="text-xs text-slate-500">{alert.alert}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-emerald hover:underline">Solicitar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
