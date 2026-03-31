import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  Wrench, 
  CheckSquare, 
  DollarSign, 
  Sparkles,
  Loader2,
  Plus
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Customer, Repair } from '../types';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function NewRepair() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  const [aiTips, setAiTips] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    deviceModel: '',
    reportedDefect: '',
    partsCost: 0,
    laborCost: 0,
    notes: '',
    checklist: {
      powersOn: false,
      charges: false,
      simRecognized: false,
      screenIntact: false,
      touchWorks: false,
    }
  });

  useEffect(() => {
    setCustomers(StorageService.getCustomers());
  }, []);

  const handleAiDiagnosis = async () => {
    if (!formData.deviceModel || !formData.reportedDefect) return;
    setAiLoading(true);
    const [diagnosis, tips] = await Promise.all([
      GeminiService.getDiagnosis(formData.deviceModel, formData.reportedDefect),
      GeminiService.getModelTips(formData.deviceModel)
    ]);
    setAiDiagnosis(diagnosis);
    setAiTips(tips);
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const repair: Repair = {
      id: Date.now().toString(),
      customerId: formData.customerId,
      deviceModel: formData.deviceModel,
      reportedDefect: formData.reportedDefect,
      diagnosis: aiDiagnosis,
      checklist: formData.checklist,
      status: 'pending',
      budget: {
        partsCost: formData.partsCost,
        laborCost: formData.laborCost,
        total: formData.partsCost + formData.laborCost
      },
      entryDate: new Date().toISOString(),
      photos: [],
      notes: formData.notes
    };

    StorageService.saveRepair(repair);
    
    // Save transaction if there's a budget
    if (repair.budget.total > 0) {
      StorageService.saveTransaction({
        id: Date.now().toString() + '-t',
        type: 'income',
        amount: repair.budget.total,
        description: `Serviço: ${repair.deviceModel} - ${formData.reportedDefect}`,
        date: new Date().toISOString(),
        repairId: repair.id
      });
    }

    setTimeout(() => {
      setLoading(false);
      navigate('/servicos');
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/servicos" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nova Ordem de Serviço</h2>
            <p className="text-slate-500">Preencha os dados do aparelho e do cliente.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Wrench size={18} />
              </div>
              <h3 className="text-lg font-bold">Informações Básicas</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Cliente</label>
                <div className="flex gap-2">
                  <select 
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Selecionar cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Link to="/clientes" className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    <Plus size={20} />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Modelo do Aparelho</label>
                <input 
                  required
                  type="text" 
                  value={formData.deviceModel}
                  onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ex: iPhone 13 Pro Max"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Defeito Relatado</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.reportedDefect}
                  onChange={(e) => setFormData({...formData, reportedDefect: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Descreva o problema relatado pelo cliente..."
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={handleAiDiagnosis}
              disabled={aiLoading || !formData.deviceModel || !formData.reportedDefect}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Gerar Diagnóstico com IA
            </button>

            {aiDiagnosis && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                  <Sparkles size={16} />
                  Diagnóstico Sugerido
                </div>
                <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                  <ReactMarkdown>{aiDiagnosis}</ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          {/* Checklist */}
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <CheckSquare size={18} />
              </div>
              <h3 className="text-lg font-bold">Checklist de Entrada</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formData.checklist).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData, 
                      checklist: { ...formData.checklist, [key]: e.target.checked }
                    })}
                    className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {key === 'powersOn' ? 'Liga?' : 
                     key === 'charges' ? 'Carrega?' : 
                     key === 'simRecognized' ? 'Reconhece Chip?' : 
                     key === 'screenIntact' ? 'Tela Intacta?' : 
                     'Touch OK?'}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Budget & Photos */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <h3 className="text-lg font-bold">Orçamento</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Custo da Peça (R$)</label>
                <input 
                  type="number" 
                  value={formData.partsCost}
                  onChange={(e) => setFormData({...formData, partsCost: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mão de Obra (R$)</label>
                <input 
                  type="number" 
                  value={formData.laborCost}
                  onChange={(e) => setFormData({...formData, laborCost: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Total:</span>
                  <span className="text-2xl font-black text-blue-600">R$ {(formData.partsCost + formData.laborCost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Camera size={18} />
              </div>
              <h3 className="text-lg font-bold">Fotos do Aparelho</h3>
            </div>
            
            <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-100 transition-all cursor-pointer">
              <Camera size={32} />
              <span className="text-xs font-bold uppercase tracking-wider">Adicionar Fotos</span>
            </div>
            <p className="text-xs text-slate-400 text-center">Tire fotos antes do conserto para segurança.</p>
          </section>

          {aiTips && (
            <section className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm uppercase tracking-wider">
                <AlertCircle size={16} />
                Dicas do Modelo
              </div>
              <div className="prose prose-sm prose-amber max-w-none text-slate-700">
                <ReactMarkdown>{aiTips}</ReactMarkdown>
              </div>
            </section>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            Salvar Ordem de Serviço
          </button>
        </div>
      </form>
    </div>
  );
}

function AlertCircle({ size, className }: { size: number, className?: string }) {
  return <Wrench size={size} className={className} />;
}
