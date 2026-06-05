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
  ClipboardList,
  Printer,
  FileText,
  Download,
  History
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

  // Weekly report & transactions state
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState<'all' | 'entrada' | 'saida'>('all');
  const [weeklyReportFilter, setWeeklyReportFilter] = React.useState({
    startDate: '',
    endDate: ''
  });

  React.useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    setWeeklyReportFilter({
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, []);

  React.useEffect(() => {
    const cached = localStorage.getItem('sisa_pharmacy_transactions_v2');
    if (cached) {
      setTransactions(JSON.parse(cached));
    } else {
      const today = new Date();
      const createPastDateStr = (daysAgo: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      const initialTransactions = [
        {
          id: 'tx-1',
          type: 'entrada',
          item_name: 'Paracetamol 500mg',
          batch_number: 'PRT-2024-01',
          quantity: 1200,
          unit: 'tabs',
          date: createPastDateStr(6),
          user_or_requester: 'Dr. Manuel Neto (Médico Principal)',
          notes: 'Abastecimento Central de Farmácia SISA'
        },
        {
          id: 'tx-2',
          type: 'saida',
          item_name: 'Paracetamol 500mg',
          batch_number: 'PRT-2024-01',
          quantity: 150,
          unit: 'tabs',
          date: createPastDateStr(5),
          user_or_requester: 'Serviço de Urgência Geral',
          notes: 'Tratamento de pacientes com febre na Urgência'
        },
        {
          id: 'tx-3',
          type: 'entrada',
          item_name: 'Amoxicilina 875mg',
          batch_number: 'AMX-2024-K2',
          quantity: 500,
          unit: 'tabs',
          date: createPastDateStr(4),
          user_or_requester: 'Drª. Isabel de Castro',
          notes: 'Reposição para tratamento de infecções'
        },
        {
          id: 'tx-4',
          type: 'saida',
          item_name: 'Amoxicilina 875mg',
          batch_number: 'AMX-2024-K2',
          quantity: 90,
          unit: 'tabs',
          date: createPastDateStr(3),
          user_or_requester: 'Internamento de Pediatria - Bloco B',
          notes: 'Dose semanal prescrita para internados'
        },
        {
          id: 'tx-5',
          type: 'entrada',
          item_name: 'Soro Fisiológico 500ml',
          batch_number: 'SRO-B202',
          quantity: 350,
          unit: 'ml',
          date: createPastDateStr(3),
          user_or_requester: 'Farm. Sandra Pinto',
          notes: 'Reposição em massa do stock central'
        },
        {
          id: 'tx-6',
          type: 'saida',
          item_name: 'Soro Fisiológico 500ml',
          batch_number: 'SRO-B202',
          quantity: 120,
          unit: 'ml',
          date: createPastDateStr(2),
          user_or_requester: 'Enf. António Kipaxe',
          notes: 'Hidratação rápida de pacientes desidratados'
        },
        {
          id: 'tx-7',
          type: 'saida',
          item_name: 'Luvas de Látex Estéreis',
          batch_number: 'LVS-M49',
          quantity: 30,
          unit: 'un',
          date: createPastDateStr(1),
          user_or_requester: 'Bloco Operatório Principal',
          notes: 'Uso cirúrgico programado'
        },
        {
          id: 'tx-8',
          type: 'entrada',
          item_name: 'Ibuprofeno 400mg',
          batch_number: 'IBP-9902',
          quantity: 1000,
          unit: 'tabs',
          date: createPastDateStr(1),
          user_or_requester: 'Supervisão Geral de Farmácia',
          notes: 'Compra direta autorizada'
        }
      ];
      setTransactions(initialTransactions);
      localStorage.setItem('sisa_pharmacy_transactions_v2', JSON.stringify(initialTransactions));
    }
  }, []);

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
      batch_number: item.batch_number || '',
      unit: item.unit || 'un',
      quantity: 0,
      min_stock: item.min_stock || 10,
      expiry_date: item.expiry_date || '',
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

      // Log transaction
      const newTransaction = {
        id: 'tx-' + Date.now(),
        type: 'entrada',
        item_name: stockFormData.item_name,
        batch_number: stockFormData.batch_number || 'Sem Lote',
        quantity: Number(stockFormData.quantity),
        unit: stockFormData.unit,
        date: new Date().toISOString().split('T')[0],
        user_or_requester: 'Farmacêutico Responsável',
        notes: 'Entrada manual de stock registada no portal'
      };

      setTransactions(prev => {
        const updated = [newTransaction, ...prev];
        localStorage.setItem('sisa_pharmacy_transactions_v2', JSON.stringify(updated));
        return updated;
      });

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

      // Log transaction
      const newTransaction = {
        id: 'tx-' + Date.now(),
        type: 'saida',
        item_name: item.item_name,
        batch_number: item.batch_number || 'S/L',
        quantity: Number(requestFormData.quantity),
        unit: item.unit || 'un',
        date: new Date().toISOString().split('T')[0],
        user_or_requester: requestFormData.requester || 'Solicitante Geral',
        notes: 'Requisição digital p/ pacientes e enfermarias'
      };

      setTransactions(prev => {
        const updated = [newTransaction, ...prev];
        localStorage.setItem('sisa_pharmacy_transactions_v2', JSON.stringify(updated));
        return updated;
      });

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
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/90 border border-emerald-150 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Relatório Semanal
          </button>
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

      {/* weekly transactions rendering / export helpers */}
      {(() => {
        const filteredTransactions = transactions.filter(tx => {
          if (reportType !== 'all' && tx.type !== reportType) return false;
          if (weeklyReportFilter.startDate && tx.date < weeklyReportFilter.startDate) return false;
          if (weeklyReportFilter.endDate && tx.date > weeklyReportFilter.endDate) return false;
          return true;
        });

        const handleDownloadCSV = (txList: any[]) => {
          const headers = ['Id', 'Tipo', 'Item', 'Lote', 'Quantidade', 'Unidade', 'Data', 'Operador_Solicitante', 'Observações'];
          const rows = txList.map(tx => [
            tx.id,
            tx.type === 'entrada' ? 'Entrada' : 'Saída',
            tx.item_name,
            tx.batch_number,
            tx.quantity,
            tx.unit,
            tx.date,
            tx.user_or_requester,
            tx.notes || ''
          ]);

          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `SISA_Relatorio_Stock_${reportType}_${weeklyReportFilter.startDate}_a_${weeklyReportFilter.endDate}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        const handlePrintWeeklyReport = (txList: any[]) => {
          const printWindow = window.open('', '_blank');
          if (!printWindow) return;

          const totalEntradas = txList.filter(t => t.type === 'entrada').length;
          const totalSaidas = txList.filter(t => t.type === 'saida').length;
          const totalQtyEntrada = txList.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.quantity, 0);
          const totalQtySaida = txList.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.quantity, 0);

          const tableRows = txList.map((tx, idx) => `
            <tr class="border-b border-slate-200 text-xs text-slate-700">
              <td class="py-2.5 font-bold">${idx + 1}</td>
              <td class="py-2.5 font-mono text-[10px]">${tx.date}</td>
              <td class="py-2.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  tx.type === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }">
                  ${tx.type === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                </span>
              </td>
              <td class="py-2.5 font-bold text-slate-900">${tx.item_name}</td>
              <td class="py-2.5 font-mono">${tx.batch_number}</td>
              <td class="py-2.5 font-black text-slate-800">${tx.quantity} ${tx.unit}</td>
              <td class="py-2.5 text-slate-600">${tx.user_or_requester}</td>
              <td class="py-2.5 text-slate-500 text-[10px]">${tx.notes || ''}</td>
            </tr>
          `).join('');

          printWindow.document.write(`
            <html>
              <head>
                <title>Relatório de Movimento de Stock SISA</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  @media print {
                    body { padding: 0; margin: 0; }
                    .no-print { display: none !important; }
                  }
                </style>
              </head>
              <body class="p-10 font-sans bg-white text-slate-900 min-h-screen flex flex-col justify-between">
                <div>
                  <!-- Republic Header -->
                  <div class="text-center space-y-1 mb-6 border-b pb-4 border-slate-300">
                    <div class="text-[20px] font-extrabold text-slate-900">REPÚBLICA DE ANGOLA</div>
                    <div class="text-[12px] uppercase tracking-widest text-slate-600 font-bold">Ministério da Saúde</div>
                    <div class="text-xs font-semibold text-slate-500 uppercase">Hospital Geral - Unidade SISA</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-1 font-bold">SISA Código Ref: #REP_STOCK_${Date.now().toString().slice(-6)}</div>
                  </div>

                  <!-- Title -->
                  <div class="text-center my-6">
                    <h2 class="text-lg font-black uppercase tracking-tight text-slate-900">RELATÓRIO DE MOVIMENTAÇÃO DE STOCK</h2>
                    <p class="text-xs text-slate-500 font-bold mt-1">Período: ${weeklyReportFilter.startDate} a ${weeklyReportFilter.endDate}</p>
                    <p class="text-xs text-slate-400 capitalize">Tipo de Relatório: ${reportType === 'all' ? 'Entradas & Saídas Gerais' : reportType === 'entrada' ? 'Apenas Entradas (Stock-In)' : 'Apenas Saídas (Stock-Out)'}</p>
                  </div>

                  <!-- Summary Cards -->
                  <div class="grid grid-cols-4 gap-4 mb-8 text-center">
                    <div class="border border-slate-200 p-4 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Registos Entradas</p>
                      <p class="text-xl font-black text-emerald-600 mt-1">${totalEntradas}</p>
                    </div>
                    <div class="border border-slate-200 p-4 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Total Entrado (Qtd)</p>
                      <p class="text-xl font-black text-slate-800 mt-1">${totalQtyEntrada}</p>
                    </div>
                    <div class="border border-slate-200 p-4 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Registos Saídas</p>
                      <p class="text-xl font-black text-amber-600 mt-1">${totalSaidas}</p>
                    </div>
                    <div class="border border-slate-200 p-4 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Total Saído (Qtd)</p>
                      <p class="text-xl font-black text-slate-800 mt-1">${totalQtySaida}</p>
                    </div>
                  </div>

                  <!-- Table -->
                  <div class="border border-slate-200 rounded-xl overflow-hidden mb-8">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-slate-50 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">
                          <th class="py-3 px-3">#</th>
                          <th class="py-3">Data</th>
                          <th class="py-3">Tipo</th>
                          <th class="py-3">Item</th>
                          <th class="py-3">Lote</th>
                          <th class="py-3">Quantidade</th>
                          <th class="py-3">Operador / Setor</th>
                          <th class="py-3 pr-3 text-slate-400">Observações</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        ${tableRows || '<tr><td colspan="8" class="text-center py-8 text-slate-400 italic">Nenhuma movimentação realizada neste período.</td></tr>'}
                      </tbody>
                    </table>
                  </div>

                </div>

                <!-- Signature Slots -->
                <div class="mt-16 pt-8 border-t border-slate-200">
                  <div class="grid grid-cols-2 gap-12 text-center text-xs w-full">
                    <div>
                      <div class="w-48 mx-auto border-b border-slate-400 h-10 mb-2"></div>
                      <p class="font-bold uppercase text-slate-700">Responsável de Farmácia SISA</p>
                      <p class="text-[10px] text-slate-400">Rubrica de Verificação</p>
                    </div>
                    <div>
                      <div class="w-48 mx-auto border-b border-slate-400 h-10 mb-2"></div>
                      <p class="font-bold uppercase text-slate-800">Direção Geral de Clínicas</p>
                      <p class="text-[10px] text-slate-500">Autoridade Certificadora</p>
                    </div>
                  </div>

                  <div class="text-center text-[9px] text-slate-400 mt-12">
                    <p>Relatório oficial gerado electronicamente pelo Sistema Integrado de Saúde de Angola (SISA).</p>
                    <p>Gerado em: ${new Date().toLocaleString('pt-AO')} &bull; ID de Autenticação: SEC_STK_REP_${Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
                </div>

                <div class="no-print mt-8 flex justify-center">
                  <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow cursor-pointer">
                    Imprimir Guia de Movimento
                  </button>
                </div>

                <script>
                  window.onload = () => {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        };

        return (
          <Modal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            title="Relatório Semanal de Stock SISA"
            className="max-w-3xl"
          >
            <div className="space-y-6">
              <p className="text-xs text-slate-500 font-medium pb-2 border-b">
                Filtre os tipos de movimentação médica e o intervalo de datas para consultar, descarregar relatórios em formato Excel/CSV ou imprimir vias oficiais assináveis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Filtro de Fluxo</label>
                  <select
                    value={reportType}
                    onChange={(e: any) => setReportType(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white font-bold text-slate-700 focus:border-emerald"
                  >
                    <option value="all">Todos os Movimentos</option>
                    <option value="entrada">Apenas Entradas (Stock-In)</option>
                    <option value="saida">Apenas Saídas (Stock-Out / Requisições)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Data de Início</label>
                  <input
                    type="date"
                    value={weeklyReportFilter.startDate}
                    onChange={(e) => setWeeklyReportFilter({ ...weeklyReportFilter, startDate: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white text-slate-800 focus:border-emerald font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Data Final</label>
                  <input
                    type="date"
                    value={weeklyReportFilter.endDate}
                    onChange={(e) => setWeeklyReportFilter({ ...weeklyReportFilter, endDate: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-150 rounded-xl outline-none bg-white text-slate-800 focus:border-emerald font-bold"
                  />
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Movimentos Filtrados</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{filteredTransactions.length}</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase">Total Entrada</p>
                  <p className="text-lg font-black text-emerald-700 mt-1">
                    {filteredTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.quantity, 0)}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-center">
                  <p className="text-[9px] font-bold text-amber-600 uppercase">Total Saída</p>
                  <p className="text-lg font-black text-amber-700 mt-1">
                    {filteredTransactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.quantity, 0)}
                  </p>
                </div>
              </div>

              {/* Transactions Preview List */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-150 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Lista de Movimentos ({filteredTransactions.length})
                  </span>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    Período selecionado
                  </span>
                </div>

                <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-150 text-xs">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide",
                          tx.type === 'entrada' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {tx.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{tx.item_name}</p>
                          <p className="text-[9px] text-slate-400 font-medium">lote: {tx.batch_number} &bull; {tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-800">{tx.quantity} {tx.unit}</p>
                        <p className="text-[9px] text-slate-400">{tx.user_or_requester}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-slate-400 italic">
                      Nenhuma movimentação registada para este intervalo e filtros.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-shrink-0 text-slate-500 hover:text-slate-800 font-bold text-xs px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleDownloadCSV(filteredTransactions)}
                  disabled={filteredTransactions.length === 0}
                  className="flex-1 py-3 px-4 bg-emerald hover:bg-emerald/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Excel / CSV
                </button>
                <button
                  onClick={() => handlePrintWeeklyReport(filteredTransactions)}
                  disabled={filteredTransactions.length === 0}
                  className="flex-1 py-3 px-4 bg-navy hover:bg-navy/95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Vias Oficiais
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

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
