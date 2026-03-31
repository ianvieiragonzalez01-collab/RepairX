import { 
  Settings as SettingsIcon, 
  Database, 
  Trash2, 
  Download, 
  Upload,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function Settings() {
  const clearData = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      customers: localStorage.getItem('fixmaster_customers'),
      repairs: localStorage.getItem('fixmaster_repairs'),
      transactions: localStorage.getItem('fixmaster_transactions'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixmaster_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-slate-500">Gerencie as preferências e dados do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Database size={18} />
            </div>
            <h3 className="text-lg font-bold">Dados e Backup</h3>
          </div>

          <div className="space-y-4">
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-slate-400 group-hover:text-blue-600" />
                <div className="text-left">
                  <p className="font-bold text-slate-900">Exportar Backup</p>
                  <p className="text-xs text-slate-500">Baixe todos os seus dados em um arquivo JSON.</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-slate-400" />
                <div className="text-left">
                  <p className="font-bold text-slate-900">Importar Backup</p>
                  <p className="text-xs text-slate-500">Restaure dados de um arquivo anterior.</p>
                </div>
              </div>
            </button>

            <button 
              onClick={clearData}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-red-400 group-hover:text-red-600" />
                <div className="text-left">
                  <p className="font-bold text-red-900">Limpar Tudo</p>
                  <p className="text-xs text-red-500">Apague permanentemente todos os registros.</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-lg font-bold">Segurança</h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Info size={16} className="text-blue-600" />
              Armazenamento Local
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Seus dados estão sendo salvos apenas neste navegador. Para maior segurança, recomendamos fazer backups regulares ou utilizar uma conta em nuvem futuramente.
            </p>
          </div>
        </section>
      </div>

      <div className="text-center pt-8">
        <p className="text-slate-400 text-sm">FixMaster Pro v1.0.0 • Desenvolvido com ❤️ para técnicos</p>
      </div>
    </div>
  );
}
