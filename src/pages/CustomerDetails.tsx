import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Customer, Repair } from '../types';
import { cn } from '../lib/utils';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);

  useEffect(() => {
    const customers = StorageService.getCustomers();
    const foundCustomer = customers.find(c => c.id === id);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      const allRepairs = StorageService.getRepairs();
      const customerRepairs = allRepairs.filter(r => r.customerId === id);
      setRepairs(customerRepairs.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()));
    }
  }, [id]);

  if (!customer) return <div className="p-12 text-center">Carregando...</div>;

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    'pending': { label: 'Pendente', color: 'text-orange-600', bg: 'bg-orange-100', icon: Clock },
    'in-progress': { label: 'Em Conserto', color: 'text-blue-600', bg: 'bg-blue-100', icon: Wrench },
    'waiting-parts': { label: 'Aguardando Peça', color: 'text-purple-600', bg: 'bg-purple-100', icon: AlertTriangle },
    'finished': { label: 'Finalizado', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    'delivered': { label: 'Entregue', color: 'text-slate-600', bg: 'bg-slate-200', icon: CheckCircle2 },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/clientes" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-slate-500">Cliente desde {new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Telefone</p>
                  <p className="font-semibold">{customer.phone}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase">E-mail</p>
                    <p className="font-semibold truncate">{customer.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Cadastro</p>
                  <p className="font-semibold">{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-100">
            <h3 className="font-bold mb-2">Resumo de Serviços</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Total de Ordens:</span>
                <span className="font-bold">{repairs.length}</span>
              </div>
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Investimento Total:</span>
                <span className="font-bold">R$ {repairs.reduce((acc, r) => acc + r.budget.total, 0).toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Repairs History */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Histórico de Serviços</h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                {repairs.length} {repairs.length === 1 ? 'Serviço' : 'Serviços'}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {repairs.map((repair) => {
                const status = statusMap[repair.status];
                return (
                  <Link 
                    key={repair.id}
                    to={`/servico/${repair.id}`}
                    className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(status.bg, status.color, "p-3 rounded-xl")}>
                        <status.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {repair.deviceModel}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">#{repair.id.slice(-5)}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-medium">{new Date(repair.entryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", status.color)}>
                          {status.label}
                        </p>
                        <p className="text-sm font-bold text-slate-900">R$ {repair.budget.total.toFixed(2)}</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                );
              })}
              {repairs.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic">
                  Este cliente ainda não possui ordens de serviço registradas.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
