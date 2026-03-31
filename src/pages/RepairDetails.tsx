import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Wrench,
  Camera,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { StorageService } from '../services/storage';
import { PDFService } from '../services/pdfService';
import { Repair, Customer } from '../types';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function RepairDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const repairs = StorageService.getRepairs();
    const found = repairs.find(r => r.id === id);
    if (found) {
      setRepair(found);
      const customers = StorageService.getCustomers();
      setCustomer(customers.find(c => c.id === found.customerId) || null);
    }
  }, [id]);

  if (!repair || !customer) return <div className="p-12 text-center">Carregando...</div>;

  const updateStatus = (newStatus: Repair['status']) => {
    const updated = { ...repair, status: newStatus };
    StorageService.saveRepair(updated);
    setRepair(updated);
    toast.success(`Status atualizado para: ${statusMap[newStatus].label}`);
  };

  const shareWhatsApp = () => {
    const message = `Olá ${customer.name}! Seu aparelho ${repair.deviceModel} está com o status: ${repair.status.toUpperCase()}. Valor: R$ ${repair.budget.total.toFixed(2)}.`;
    window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteRepair = () => {
    if (repair) {
      StorageService.deleteRepair(repair.id);
      toast.success('Ordem de serviço excluída com sucesso!');
      navigate('/servicos');
    }
  };

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    'pending': { label: 'Pendente', color: 'text-orange-600', bg: 'bg-orange-100', icon: Clock },
    'in-progress': { label: 'Em Conserto', color: 'text-blue-600', bg: 'bg-blue-100', icon: Wrench },
    'waiting-parts': { label: 'Aguardando Peça', color: 'text-purple-600', bg: 'bg-purple-100', icon: AlertTriangle },
    'finished': { label: 'Finalizado', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    'delivered': { label: 'Entregue', color: 'text-slate-600', bg: 'bg-slate-200', icon: CheckCircle2 },
  };

  const currentStatus = statusMap[repair.status];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/servicos" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{repair.deviceModel}</h2>
              <span className={cn(currentStatus.bg, currentStatus.color, "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider")}>
                {currentStatus.label}
              </span>
            </div>
            <p className="text-slate-500">
              OS #{repair.id.slice(-5)} • 
              <Link to={`/cliente/${customer.id}`} className="hover:text-blue-600 transition-colors ml-1">
                {customer.name}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={shareWhatsApp}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            <MessageSquare size={18} />
            WhatsApp
          </button>
          <button 
            onClick={() => PDFService.generateRepairOS(repair, customer)}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
            title="Imprimir OS"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.success('Link da Ordem de Serviço copiado!');
            }}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
            title="Compartilhar OS"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 bg-white border border-slate-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
            title="Excluir Serviço"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Defeito Relatado</h4>
                  <p className="text-slate-900 font-medium">{repair.reportedDefect}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data de Entrada</h4>
                  <p className="text-slate-900 font-medium">{new Date(repair.entryDate).toLocaleDateString()} às {new Date(repair.entryDate).toLocaleTimeString()}</p>
                </div>
                {repair.imei && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">IMEI</h4>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <ShieldCheck size={16} className="text-blue-600" />
                      {repair.imei}
                    </div>
                  </div>
                )}
                {repair.estimatedTime && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tempo Estimado</h4>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Clock size={16} className="text-blue-600" />
                      {repair.estimatedTime}
                    </div>
                  </div>
                )}
              </div>

              {repair.diagnosis && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Diagnóstico Técnico</h4>
                  <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-6 rounded-2xl">
                    <ReactMarkdown>{repair.diagnosis}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Checklist de Entrada</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(repair.checklist).map(([key, value]) => (
                    <div key={key} className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border",
                      value ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                    )}>
                      {value ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span className="text-sm font-bold">
                        {key === 'powersOn' ? 'Liga' : 
                         key === 'charges' ? 'Carrega' : 
                         key === 'simRecognized' ? 'Chip' : 
                         key === 'screenIntact' ? 'Tela' : 
                         'Touch'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Fotos do Aparelho</h3>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1">
                <Camera size={16} />
                Adicionar
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 italic text-sm">
                Nenhuma foto
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status Control */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Alterar Status</h3>
            <div className="space-y-2">
              {Object.entries(statusMap).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => updateStatus(key as Repair['status'])}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2",
                    repair.status === key 
                      ? `${value.bg} ${value.color} border-current` 
                      : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <value.icon size={18} />
                  {value.label}
                </button>
              ))}
            </div>
          </section>

          {/* Budget Summary */}
          <section className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 space-y-6">
            <h3 className="text-lg font-bold">Resumo Financeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Peças:</span>
                <span className="font-bold">R$ {repair.budget.partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Mão de Obra:</span>
                <span className="font-bold">R$ {repair.budget.laborCost.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-blue-500 flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-black">R$ {repair.budget.total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={() => PDFService.generateRepairOS(repair, customer)}
              className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Gerar Ordem de Serviço
            </button>
          </section>

          {/* Customer Info */}
          <Link 
            to={`/cliente/${customer.id}`}
            className="block bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all group"
          >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cliente</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                <p className="text-sm text-slate-500">{customer.phone}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Modal Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Excluir Serviço?</h3>
            <p className="text-slate-500 text-center mb-8">
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteRepair}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
