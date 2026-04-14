import React from 'react';
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

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500 mt-1">Controle de faturação, convênios e tesouraria.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
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
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                    >
                      <Printer className="w-5 h-5" />
                      Imprimir
                    </button>
                    <button className="flex-1 py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition-all">
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
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-navy transition-colors" />
                    <span className="text-sm font-bold text-slate-700">Tabela de Preços</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-navy transition-all" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
