import { useState, useEffect, forwardRef } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { toast } from 'sonner';
import { StorageService } from '../services/storage';
import { Repair, Customer } from '../types';
import { cn } from '../lib/utils';

export default function Repairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setRepairs(StorageService.getRepairs());
    setCustomers(StorageService.getCustomers());
  }, []);

  const handleDeleteRepair = () => {
    if (deleteConfirmId) {
      StorageService.deleteRepair(deleteConfirmId);
      setRepairs(StorageService.getRepairs());
      setDeleteConfirmId(null);
      toast.success('Ordem de serviço excluída com sucesso!');
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente Desconhecido';
  };

  const filteredRepairs = repairs.filter(r => {
    const matchesSearch = r.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getCustomerName(r.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    'pending': { label: 'Pendente', color: 'text-orange-600', bg: 'bg-orange-100', icon: Clock },
    'in-progress': { label: 'Em Conserto', color: 'text-blue-600', bg: 'bg-blue-100', icon: Wrench },
    'waiting-parts': { label: 'Aguardando Peça', color: 'text-purple-600', bg: 'bg-purple-100', icon: AlertTriangle },
    'finished': { label: 'Finalizado', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    'delivered': { label: 'Entregue', color: 'text-slate-600', bg: 'bg-slate-200', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
          <p className="text-slate-500">Acompanhe o status de todos os reparos em andamento.</p>
        </div>
        <Link 
          to="/novo-servico"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          Nova OS
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por modelo ou cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter size={18} className="text-slate-400 mr-2 shrink-0" />
          {['all', 'pending', 'in-progress', 'waiting-parts', 'finished', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                statusFilter === status 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {status === 'all' ? 'Todos' : statusMap[status].label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[800px]">
        <VirtuosoGrid
          data={filteredRepairs}
          listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1"
          itemContent={(_index, repair) => {
            const status = statusMap[repair.status];
            return (
              <Link 
                to={`/servico/${repair.id}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden h-full flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(status.bg, status.color, "p-2 rounded-lg")}>
                      <status.icon size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{repair.id.slice(-5)}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirmId(repair.id);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-600 transition-colors"
                        title="Excluir Serviço"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{repair.deviceModel}</h3>
                  <p className="text-sm text-slate-500 mb-4">{getCustomerName(repair.customerId)}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Defeito:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{repair.reportedDefect}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Entrada:</span>
                      <span className="font-medium text-slate-700">{new Date(repair.entryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Valor:</span>
                      <span className="font-bold text-blue-600">R$ {repair.budget.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={cn(status.bg, "px-6 py-3 flex items-center justify-between mt-auto")}>
                  <span className={cn(status.color, "text-xs font-bold uppercase tracking-wider")}>
                    {status.label}
                  </span>
                  <ChevronRight size={16} className={status.color} />
                </div>
              </Link>
            );
          }}
          components={{
            List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => (
              <div {...props} ref={ref} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1">
                {children}
              </div>
            )),
            Item: ({ children, ...props }: { children?: React.ReactNode }) => (
              <div {...props} className="h-full">
                {children}
              </div>
            )
          }}
        />
        {filteredRepairs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p>Nenhum serviço encontrado com esses filtros.</p>
          </div>
        )}
      </div>

      {/* Modal Confirmação de Exclusão */}
      {deleteConfirmId && (
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
                onClick={() => setDeleteConfirmId(null)}
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
