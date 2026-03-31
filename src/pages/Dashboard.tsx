import { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Repair, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    setRepairs(StorageService.getRepairs());
    setTransactions(StorageService.getTransactions());
  }, []);

  const stats = [
    { label: 'Em Aberto', value: repairs.filter(r => r.status !== 'delivered').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Finalizados', value: repairs.filter(r => r.status === 'finished').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Clientes', value: StorageService.getCustomers().length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Receita (Mês)', value: `R$ ${transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const recentRepairs = repairs.slice(-5).reverse();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-slate-500">Bem-vindo de volta! Aqui está o resumo da sua oficina.</p>
        </div>
        <Link 
          to="/novo-servico"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          Novo Serviço
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/verificador-imei"
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Verificador de IMEI</h3>
            <p className="text-xs text-slate-500">Consultar histórico do aparelho</p>
          </div>
        </Link>
        <Link 
          to="/novo-servico"
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Smart Service</h3>
            <p className="text-xs text-slate-500">Novo serviço com tempo estimado</p>
          </div>
        </Link>
        <Link 
          to="/clientes"
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Base de Clientes</h3>
            <p className="text-xs text-slate-500">Gerenciar contatos e histórico</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Repairs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg">Serviços Recentes</h3>
            <Link to="/servicos" className="text-blue-600 text-sm font-semibold hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentRepairs.length > 0 ? (
              recentRepairs.map((repair) => (
                <Link 
                  key={repair.id} 
                  to={`/servico/${repair.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <Wrench size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{repair.deviceModel}</p>
                        <p className="text-sm text-slate-500 truncate">{repair.reportedDefect}</p>
                      </div>
                    </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      repair.status === 'finished' ? 'bg-green-100 text-green-700' : 
                      repair.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {repair.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{new Date(repair.entryDate).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum serviço registrado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Alerts */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Dica do Dia</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Lembre-se de sempre testar o carregamento e o microfone antes de abrir o aparelho para evitar reclamações posteriores.
              </p>
            </div>
            <Wrench size={120} className="absolute -bottom-10 -right-10 text-blue-500 opacity-20 rotate-12" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Avisos</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600">3 aparelhos aguardando peças há mais de 5 dias.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600">Meta mensal de faturamento atingida em 85%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
