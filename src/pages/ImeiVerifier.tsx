import { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, History, Smartphone, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ImeiStatus {
  imei: string;
  status: 'clean' | 'blacklisted' | 'alert';
  model?: string;
  brand?: string;
  lastCheck?: string;
  history: { date: string; event: string; type: 'info' | 'warning' | 'error' }[];
}

export default function ImeiVerifier() {
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImeiStatus | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (imei.length < 14) return;

    setLoading(true);
    setResult(null);

    // Mock verification delay
    setTimeout(() => {
      setLoading(false);
      
      // Mock logic: IMEIs ending in '000' are blacklisted, '111' are alerts
      if (imei.endsWith('000')) {
        setResult({
          imei,
          status: 'blacklisted',
          model: 'iPhone 13 Pro',
          brand: 'Apple',
          lastCheck: new Date().toISOString(),
          history: [
            { date: '2025-12-10', event: 'Aparelho reportado como roubado/perdido', type: 'error' },
            { date: '2025-12-11', event: 'Bloqueio efetuado pela operadora (Anatel)', type: 'error' }
          ]
        });
      } else if (imei.endsWith('111')) {
        setResult({
          imei,
          status: 'alert',
          model: 'Galaxy S22 Ultra',
          brand: 'Samsung',
          lastCheck: new Date().toISOString(),
          history: [
            { date: '2026-01-05', event: 'Aparelho com histórico de reparos não autorizados', type: 'warning' },
            { date: '2026-02-20', event: 'Tentativa de desbloqueio de conta detectada', type: 'warning' }
          ]
        });
      } else {
        setResult({
          imei,
          status: 'clean',
          model: 'Desconhecido',
          brand: 'Desconhecido',
          lastCheck: new Date().toISOString(),
          history: [
            { date: new Date().toISOString(), event: 'Consulta realizada: Sem restrições no banco de dados', type: 'info' }
          ]
        });
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verificador de IMEI</h2>
          <p className="text-slate-500 font-medium">Consulte o histórico do aparelho e evite celulares com restrição.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-sm font-bold border border-blue-100">
          <ShieldCheck size={18} />
          Proteção RepairX
        </div>
      </div>

      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">Insira o IMEI do Aparelho (15 dígitos)</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                maxLength={15}
                value={imei}
                onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 358742091234567"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-mono tracking-wider"
              />
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
            <button 
              type="submit"
              disabled={loading || imei.length < 14}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Search size={24} />
                </motion.div>
              ) : (
                <Search size={24} />
              )}
              Consultar
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Dica: Digite *#06# no teclado do celular para descobrir o IMEI.
          </p>
        </form>
      </section>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center gap-8",
              result.status === 'clean' ? "bg-green-50 border-green-100" : 
              result.status === 'blacklisted' ? "bg-red-50 border-red-100" : 
              "bg-amber-50 border-amber-100"
            )}>
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-inner",
                result.status === 'clean' ? "bg-green-100 text-green-600" : 
                result.status === 'blacklisted' ? "bg-red-100 text-red-600" : 
                "bg-amber-100 text-amber-600"
              )}>
                {result.status === 'clean' ? <CheckCircle2 size={48} /> : 
                 result.status === 'blacklisted' ? <ShieldAlert size={48} /> : 
                 <AlertTriangle size={48} />}
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h3 className={cn(
                    "text-2xl font-black uppercase tracking-tight",
                    result.status === 'clean' ? "text-green-700" : 
                    result.status === 'blacklisted' ? "text-red-700" : 
                    "text-amber-700"
                  )}>
                    {result.status === 'clean' ? "Aparelho Regular" : 
                     result.status === 'blacklisted' ? "Aparelho com Restrição" : 
                     "Aparelho em Alerta"}
                  </h3>
                  <span className="text-slate-500 font-mono text-sm">IMEI: {result.imei}</span>
                </div>
                <p className="text-slate-600 font-medium">
                  {result.status === 'clean' ? "Nenhuma restrição de roubo, furto ou perda foi encontrada para este IMEI." : 
                   result.status === 'blacklisted' ? "Este aparelho está bloqueado por perda ou roubo. Não realize o serviço!" : 
                   "Este aparelho possui histórico suspeito. Verifique a procedência com atenção."}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <div className="bg-white/50 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest">
                    Modelo: {result.model}
                  </div>
                  <div className="bg-white/50 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest">
                    Marca: {result.brand}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                  <History size={18} />
                </div>
                <h3 className="text-lg font-bold">Histórico de Consultas</h3>
              </div>

              <div className="space-y-4">
                {result.history.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      item.type === 'info' ? "bg-blue-500" : 
                      item.type === 'warning' ? "bg-amber-500" : 
                      "bg-red-500"
                    )} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{item.event}</p>
                      <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()} às {new Date(item.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
