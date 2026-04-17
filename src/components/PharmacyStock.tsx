import React from 'react';
import { 
  Pill, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ShoppingCart,
  Search,
  Plus,
  ArrowDown,
  Loader2,
  PackagePlus,
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
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

export default function PharmacyStock() {
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);

  const [stockFormData, setStockFormData] = React.useState({
    item_name: '',
    category: 'Medicamentos',
    batch_number: '',
    unit: 'un',
    quantity: 0,
    min_stock: 10,
    expiry_date: '',
    manufacturer: ''
  });

  const [requestFormData, setRequestFormData] = React.useState({
    item_id: '',
    quantity: 0,
    requester: ''
  });

  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  const handleQuickOrder = (item: any) => {
    setStockFormData({
      item_name: item.item_name,
      category: item.category || 'Medicamentos',
      batch_number: '', // Usually a new entry needs a new batch, or user can fill existing
      unit: item.unit || 'un',
      quantity: 0,
      min_stock: item.min_stock || 10,
      expiry_date: '',
      manufacturer: item.manufacturer || ''
    });
    setIsStockModalOpen(true);
    if (isDetailsModalOpen) setIsDetailsModalOpen(false);
  };

  const handleShowDetails = (item: any) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  React.useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name');
    
    if (!error) setInventory(data || []);
    setIsLoading(false);
  };

  const handleStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if item already exists with SAME BATCH
      const existingBatch = inventory.find(i => 
        i.item_name.toLowerCase() === stockFormData.item_name.toLowerCase() && 
        i.batch_number === stockFormData.batch_number
      );

      if (existingBatch) {
        const { error } = await supabase
          .from('inventory')
          .update({
            quantity: existingBatch.quantity + Number(stockFormData.quantity),
            expiry_date: stockFormData.expiry_date || existingBatch.expiry_date
          })
          .eq('id', existingBatch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert([stockFormData]);
        if (error) throw error;
      }

      setIsStockModalOpen(false);
      setStockFormData({
        item_name: '',
        category: 'Medicamentos',
        batch_number: '',
        unit: 'un',
        quantity: 0,
        min_stock: 10,
        expiry_date: '',
        manufacturer: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Erro ao processar entrada de stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const item = inventory.find(i => i.id === requestFormData.item_id);
      if (!item || item.quantity < requestFormData.quantity) {
        throw new Error('Stock insuficiente');
      }

      const { error } = await supabase
        .from('inventory')
        .update({
          quantity: item.quantity - Number(requestFormData.quantity)
        })
        .eq('id', item.id);

      if (error) throw error;

      setIsRequestModalOpen(false);
      setRequestFormData({
        item_id: '',
        quantity: 0,
        requester: ''
      });
      fetchInventory();
    } catch (error: any) {
      console.error('Error processing requisition:', error);
      alert(error.message || 'Erro ao processar requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalItems = inventory.filter(item => item.quantity <= item.min_stock);

  // Mock expiry data for the chart as we don't have many real items yet, 
  // but we can derive it if expiry_date exists
  const expiryData = [
    { month: 'Abr', count: 12 },
    { month: 'Mai', count: 45 },
    { month: 'Jun', count: 28 },
    { month: 'Jul', count: 110 },
    { month: 'Ago', count: 65 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Farmácia e Stock</h1>
          <p className="text-slate-500 mt-1">Controle de medicamentos, consumíveis e validade.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Requisição Digital
          </button>
          <button 
            onClick={() => setIsStockModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Entrada de Stock
          </button>
        </div>
      </div>

      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title="Entrada de Stock"
      >
        <form onSubmit={handleStockEntry} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome do Item</label>
            <input
              required
              type="text"
              value={stockFormData.item_name}
              onChange={(e) => setStockFormData({ ...stockFormData, item_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              placeholder="Ex: Paracetamol 500mg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Lote (Batch nº)</label>
              <input
                required
                type="text"
                value={stockFormData.batch_number}
                onChange={(e) => setStockFormData({ ...stockFormData, batch_number: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: LOT-2024-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
              <select
                value={stockFormData.unit}
                onChange={(e) => setStockFormData({ ...stockFormData, unit: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              >
                <option value="un">Unidades</option>
                <option value="mg">mg (Miligramas)</option>
                <option value="ml">ml (Mililitros)</option>
                <option value="caps">Cápsulas</option>
                <option value="tabs">Comprimidos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Fabricante</label>
              <input
                type="text"
                value={stockFormData.manufacturer}
                onChange={(e) => setStockFormData({ ...stockFormData, manufacturer: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Ex: Bayer, Pfizer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade Entrada</label>
              <input
                required
                type="number"
                min="1"
                value={stockFormData.quantity}
                onChange={(e) => setStockFormData({ ...stockFormData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Stock Mínimo</label>
              <input
                required
                type="number"
                min="1"
                value={stockFormData.min_stock}
                onChange={(e) => setStockFormData({ ...stockFormData, min_stock: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Validade</label>
              <input
                type="date"
                value={stockFormData.expiry_date}
                onChange={(e) => setStockFormData({ ...stockFormData, expiry_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald text-white rounded-2xl font-bold hover:bg-emerald/90 transition-all shadow-lg shadow-emerald/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackagePlus className="w-5 h-5" />}
            Registrar Entrada
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Requisição Digital"
      >
        <form onSubmit={handleRequisition} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Item</label>
            <select
              required
              value={requestFormData.item_id}
              onChange={(e) => setRequestFormData({ ...requestFormData, item_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="">Selecionar Item</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>{item.item_name} (Stock: {item.quantity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade</label>
              <input
                required
                type="number"
                min="1"
                value={requestFormData.quantity}
                onChange={(e) => setRequestFormData({ ...requestFormData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Solicitante</label>
              <input
                required
                type="text"
                value={requestFormData.requester}
                onChange={(e) => setRequestFormData({ ...requestFormData, requester: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
                placeholder="Nome ou Setor"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
            Processar Requisição
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes do Item"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <Pill className="w-8 h-8 text-navy" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedItem.item_name}</h3>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">{selectedItem.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Atual</p>
                <p className="text-2xl font-black text-slate-900">{selectedItem.quantity} <span className="text-sm font-normal text-slate-500">{selectedItem.unit}</span></p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lote / Batch</p>
                <p className="text-sm font-black text-navy">{selectedItem.batch_number || 'Sem Lote'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Fabricante</p>
                <p className="text-sm font-bold text-slate-700">{selectedItem.manufacturer || '-'}</p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Validade</p>
                <div className="flex items-center justify-end gap-2 text-amber-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {selectedItem.expiry_date ? new Date(selectedItem.expiry_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsRequestModalOpen(true);
                  setRequestFormData(prev => ({ ...prev, item_id: selectedItem.id }));
                }}
                className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all"
              >
                Solicitar Saída
              </button>
              <button 
                onClick={() => handleQuickOrder(selectedItem)}
                className="flex-1 py-4 bg-emerald text-white rounded-2xl font-bold hover:bg-emerald/90 transition-all"
              >
                Repoer Stock
              </button>
            </div>
          </div>
        )}
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
          {/* Critical Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  Ruptura de Stock (Crítico)
                </h3>
                <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">
                  {criticalItems.length} itens em alerta
                </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {criticalItems.length > 0 ? criticalItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Pill className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.item_name}</h4>
                        <p className="text-xs text-slate-500">Stock atual: <span className="text-red-600 font-bold">{item.quantity} un</span> / Mínimo: {item.min_stock} un</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleQuickOrder(item)}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                    >
                      Pedir Agora
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 italic">
                    Nenhum item em estado crítico no momento.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-500" />
                Vencimento Próximo
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expiryData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {expiryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 50 ? '#ef4444' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">Medicamentos a vencer nos próximos 5 meses.</p>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar no inventário..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" 
                />
              </div>
              <div className="flex gap-4">
                <select className="bg-slate-50 border-none text-xs font-bold rounded-xl px-4 py-2 outline-none">
                  <option>Todos os Tipos</option>
                  <option>Medicamentos</option>
                  <option>Consumíveis</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Item (Lote)</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Stock Atual</th>
                    <th className="px-6 py-4">Fabricante</th>
                    <th className="px-6 py-4">Validade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length > 0 ? filteredInventory.map((item, i) => {
                    const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
                    const isExpired = expiryDate && expiryDate < new Date();
                    const isExpiringSoon = expiryDate && !isExpired && expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                    const isCritical = item.quantity <= item.min_stock;
                    
                    return (
                      <tr key={i} className={cn("hover:bg-slate-50 transition-colors", isExpired ? "bg-red-50/30" : "")}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{item.item_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">lote: {item.batch_number || 'S/L'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-bold", isCritical ? "text-red-600" : "text-slate-700")}>
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.manufacturer || '-'}</td>
                        <td className="px-6 py-4">
                           <div className={cn(
                             "text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1",
                             isExpired ? "bg-red-100 text-red-600" : isExpiringSoon ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                           )}>
                             <Calendar className="w-3 h-3" />
                             {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleShowDetails(item)}
                            className="text-xs font-bold text-navy hover:underline"
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhum item encontrado no inventário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
