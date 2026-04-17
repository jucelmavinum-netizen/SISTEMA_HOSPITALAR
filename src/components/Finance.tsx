import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Filter,
  Download,
  FileText,
  Loader2,
  Plus,
  Receipt,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';

export default function Finance() {
  const [records, setRecords] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [isCashReportModalOpen, setIsCashReportModalOpen] = React.useState(false);
  const [isPrintPreviewMode, setIsPrintPreviewMode] = React.useState(false);

  const [formData, setFormData] = React.useState({
    type: 'income',
    category: 'Consulta',
    amount: '',
    description: '',
    payment_method: 'cash'
  });

  React.useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('finance_records')
      .select(`
        *,
        profiles:recorded_by (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (!error) setRecords(data || []);
    setIsLoading(false);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('finance_records')
        .insert([{
          type: formData.type,
          category: formData.category,
          amount: Number(formData.amount),
          description: formData.description,
          recorded_by: user?.id
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({
        type: 'income',
        category: 'Consulta',
        amount: '',
        description: '',
        payment_method: 'cash'
      });
      fetchRecords();
    } catch (error) {
      console.error('Error creating finance record:', error);
      alert('Erro ao registrar movimentação financeira.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, r) => acc + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, r) => acc + Number(r.amount), 0);

  const [isPriceListOpen, setIsPriceListOpen] = React.useState(false);

  const handlePrintCashReport = () => {
    setIsCashReportModalOpen(true);
  };

  const handleTriggerPrint = () => {
    setIsPrintPreviewMode(true);
    setIsCashReportModalOpen(false);
  };

  const handleExecutePrint = () => {
    window.print();
  };

  const handleDownloadPDF = (record: any) => {
    alert(`Iniciando download da Fatura Nº FAT-${record.id.slice(0, 8).toUpperCase()}...`);
    // Simulate PDF download by triggering a print for the specific record
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500 mt-1">Controle de faturação, convênios e tesouraria.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintCashReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Relatório de Caixa
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90 transition-all"
          >
            Nova Fatura
          </button>
        </div>
      </div>

      {/* Modal for Finance Record */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Movimentação Financeira"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="flex gap-4">
            {['income', 'expense'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold border-2 transition-all",
                  formData.type === type 
                    ? (type === 'income' ? "border-emerald bg-emerald/5 text-emerald" : "border-red-500 bg-red-50 text-red-600")
                    : "border-slate-100 text-slate-400 hover:border-slate-200"
                )}
              >
                {type === 'income' ? 'Entrada' : 'Saída'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all"
            >
              <option value="Consulta">Consulta</option>
              <option value="Exame">Exame</option>
              <option value="Medicamento">Medicamento</option>
              <option value="Internamento">Internamento</option>
              <option value="Salário">Salário</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Valor (Kz)</label>
            <input
              required
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all font-bold"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all h-24 resize-none"
              placeholder="Detalhes da fatura ou despesa..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
            Emitir Fatura / Registrar
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isCashReportModalOpen}
        onClose={() => setIsCashReportModalOpen(false)}
        title="Relatório de Fecho de Caixa"
      >
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-60">Resumo Geral</span>
              <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-400">Total Entradas</p>
                <p className="text-xl font-bold">{totalIncome.toLocaleString()} Kz</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-red-400">Total Saídas</p>
                <p className="text-xl font-bold">{totalExpense.toLocaleString()} Kz</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase font-bold text-blue-400">Saldo Disponível</p>
              <p className="text-3xl font-black">{(totalIncome - totalExpense).toLocaleString()} Kz</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase px-1">Distribuição por Categoria</h4>
            <div className="space-y-2">
              {Array.from(new Set(records.map(r => r.category))).map(cat => {
                const amount = records.filter(r => r.category === cat).reduce((acc, r) => acc + (r.type === 'income' ? Number(r.amount) : -Number(r.amount)), 0);
                return (
                  <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">{cat}</span>
                    <span className={cn("text-sm font-bold", amount >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {amount.toLocaleString()} Kz
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleTriggerPrint}
              className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all"
            >
              <Printer className="w-5 h-5" />
              Imprimir Relatório
            </button>
          </div>
        </div>
      </Modal>

      {/* Print Preview Overlay (Portal to Body for isolation) */}
      {isPrintPreviewMode && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col">
            {/* Controls - Hidden during actual print */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 print:hidden bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pré-visualização</h2>
                <p className="text-sm text-slate-500">Confirme os dados e clique em imprimir.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPrintPreviewMode(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                >
                  Fechar
                </button>
                <button 
                  type="button"
                  onClick={handleExecutePrint}
                  className="px-6 py-2.5 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-navy/20"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Agora
                </button>
              </div>
            </div>

            {/* Content Area - This is what gets printed */}
            <div className="flex-1 p-10 bg-white print:p-0">
              <div className="print-only-content space-y-8 bg-white text-black">
                <div className="border-b-4 border-navy pb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-black text-navy italic uppercase">SISA ERP</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Relatório Mensal de Caixa</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold">Gerado em: {new Date().toLocaleString()}</p>
                    <p className="text-slate-400">Hospital Geral de Luanda</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Entradas</p>
                    <p className="text-lg font-bold text-emerald-600">{totalIncome.toLocaleString()} Kz</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Saídas</p>
                    <p className="text-lg font-bold text-red-600">{totalExpense.toLocaleString()} Kz</p>
                  </div>
                  <div className="p-4 bg-slate-950 text-white rounded-xl">
                    <p className="text-[10px] font-bold text-white/60 uppercase">Saldo Total</p>
                    <p className="text-lg font-bold font-mono">{(totalIncome - totalExpense).toLocaleString()} Kz</p>
                  </div>
                </div>

                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-left">
                      <th className="py-3 px-2">Data</th>
                      <th className="py-3 px-2">Categoria</th>
                      <th className="py-3 px-2">Descrição</th>
                      <th className="py-3 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {records.map((r, i) => (
                      <tr key={i}>
                        <td className="py-3 px-2">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{r.category}</td>
                        <td className="py-3 px-2 leading-relaxed">{r.description}</td>
                        <td className={cn("py-3 px-2 text-right font-bold", r.type === 'income' ? "text-emerald-700" : "text-red-700")}>
                          {r.type === 'income' ? '+' : '-'}{Number(r.amount).toLocaleString()} Kz
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="pt-24 flex justify-between gap-20">
                  <div className="flex-1 border-t-2 border-slate-900 pt-3 text-center text-[10px] font-bold uppercase tracking-wider">Assinatura Tesouraria</div>
                  <div className="flex-1 border-t-2 border-slate-900 pt-3 text-center text-[10px] font-bold uppercase tracking-wider">Carimbo da Unidade</div>
                </div>

                <div className="pt-12 text-center">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium italic">
                    Documento gerado eletronicamente pelo SISA ERP Hospitalar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald animate-spin" />
        </div>
      ) : (
        <>
          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Receita Total', value: `${totalIncome.toLocaleString()} Kz`, trend: '+8.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Despesas Totais', value: `${totalExpense.toLocaleString()} Kz`, trend: '+12%', color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Saldo Líquido', value: `${(totalIncome - totalExpense).toLocaleString()} Kz`, trend: '-2.4%', color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                    stat.color.includes('emerald') ? "bg-emerald-50 text-emerald-600" : stat.color.includes('red') ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Billing Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Movimentações Recentes</h3>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar movimentação..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-emerald rounded-xl outline-none text-sm transition-all" 
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{record.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{record.description}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{Number(record.amount).toLocaleString()} Kz</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              record.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {record.type === 'income' ? 'Entrada' : 'Saída'}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-navy hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Emitir Fatura"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Nenhuma movimentação encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Modal
              isOpen={isInvoiceModalOpen}
              onClose={() => setIsInvoiceModalOpen(false)}
              title="Fatura / Recibo Digital"
            >
              {selectedRecord && (
                <div className="space-y-6">
                  <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/5 rounded-full -mr-16 -mt-16" />
                    
                    <div className="flex justify-between items-start relative">
                      <div>
                        <h4 className="text-2xl font-black italic tracking-tighter text-navy">SISA ERP</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recibo de Pagamento</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">Nº FAT-{selectedRecord.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-slate-400">{new Date(selectedRecord.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="py-6 border-y border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Categoria</span>
                        <span className="text-sm font-bold text-slate-900">{selectedRecord.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Descrição</span>
                        <span className="text-sm font-medium text-slate-700">{selectedRecord.description || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Método</span>
                        <span className="text-sm font-medium text-slate-700">Multicaixa / Cash</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <span className="text-lg font-bold text-slate-900">Total Pago</span>
                      <span className="text-2xl font-black text-emerald">{Number(selectedRecord.amount).toLocaleString()} Kz</span>
                    </div>

                    <div className="pt-8 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 bg-emerald/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald uppercase tracking-widest">Pagamento Confirmado</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all" onClick={() => window.print()}>
                      <Printer className="w-5 h-5" />
                      Imprimir
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(selectedRecord)}
                      className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Baixar PDF
                    </button>
                  </div>
                </div>
              )}
            </Modal>

            {/* Insurance Plans */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-500" />
                Convênios Ativos
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'ENSA', share: 45, color: 'bg-blue-500' },
                  { name: 'Nossa Seguros', share: 25, color: 'bg-emerald-500' },
                  { name: 'Particular', share: 20, color: 'bg-amber-500' },
                  { name: 'Outros', share: 10, color: 'bg-slate-400' },
                ].map((plan, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{plan.name}</span>
                      <span className="text-slate-400 font-bold">{plan.share}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", plan.color)}
                        style={{ width: `${plan.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <button 
                  onClick={() => setIsPriceListOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-navy transition-colors" />
                    <span className="text-sm font-bold text-slate-700">Tabela de Preços</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-navy transition-all" />
                </button>
              </div>
            </div>

            <Modal
              isOpen={isPriceListOpen}
              onClose={() => setIsPriceListOpen(false)}
              title="Tabela de Preços Hospitalares"
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Os preços podem variar conforme convênio ou particular.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { item: 'Consulta Geral', price: '5.000 Kz' },
                    { label: 'Urgência', items: [
                      { item: 'Consulta Urgente', price: '7.500 Kz' },
                      { item: 'Sutura Pequena', price: '3.000 Kz' },
                    ]},
                    { label: 'Exames', items: [
                      { item: 'Hemograma', price: '4.500 Kz' },
                      { item: 'Teste Malária', price: '2.000 Kz' },
                      { item: 'Glicémia', price: '1.500 Kz' },
                    ]},
                    { label: 'Hospedagem', items: [
                      { item: 'Diária Quarto Comum', price: '10.000 Kz' },
                      { item: 'Diária Semi-Privado', price: '25.000 Kz' },
                    ]}
                  ].map((cat: any, i) => (
                    <div key={i} className="py-3">
                      {cat.label ? (
                        <>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{cat.label}</p>
                          <div className="space-y-2">
                            {cat.items.map((it: any, j: number) => (
                              <div key={j} className="flex justify-between text-sm">
                                <span className="text-slate-600">{it.item}</span>
                                <span className="font-bold text-slate-900">{it.price}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 font-bold">{cat.item}</span>
                          <span className="font-bold text-emerald">{cat.price}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          </div>
        </>
      )}
    </div>
  );
}
