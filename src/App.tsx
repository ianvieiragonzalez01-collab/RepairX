import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  DollarSign, 
  Settings as SettingsIcon, 
  Search,
  Menu,
  Bell,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Repairs from './pages/Repairs';
import Finance from './pages/Finance';
import NewRepair from './pages/NewRepair';
import RepairDetails from './pages/RepairDetails';
import CustomerDetails from './pages/CustomerDetails';
import ImeiVerifier from './pages/ImeiVerifier';
import Settings from './pages/Settings';
import Login from './pages/Login';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  time: string;
  read: boolean;
}

function SidebarRouteItem({ icon: Icon, label, to, onClick }: { icon: any, label: string, to: string, onClick?: () => void }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      <div className={cn(active ? "text-white" : "text-slate-400 group-hover:text-blue-600")}>
        <Icon size={20} />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('fixmaster_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('fixmaster_user');
    setUser(null);
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  if (!isAuthReady) return null;

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
        {/* Backdrop for mobile */}
        <AnimatePresence>
          {isSidebarOpen && window.innerWidth < 1024 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0",
            !isSidebarOpen && "-translate-x-full lg:hidden"
          )}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between px-2 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Wrench size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">FixMaster</h1>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pro Edition</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              <SidebarRouteItem icon={LayoutDashboard} label="Dashboard" to="/" />
              <SidebarRouteItem icon={Users} label="Clientes" to="/clientes" />
              <SidebarRouteItem icon={Wrench} label="Serviços" to="/servicos" />
              <SidebarRouteItem icon={ShieldCheck} label="Verificador de IMEI" to="/verificador-imei" />
              <SidebarRouteItem icon={DollarSign} label="Financeiro" to="/financeiro" />
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <SidebarRouteItem icon={SettingsIcon} label="Configurações" to="/config" />
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 mt-1"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden max-w-full">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente ou OS..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-all",
                    isNotificationsOpen && "bg-slate-100 text-blue-600"
                  )}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Notificações</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => setNotifications(n => n.map(notif => ({ ...notif, read: true })))}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                              <Bell size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">Não tem notificação</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-50">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={cn(
                                  "p-4 hover:bg-slate-50 transition-colors cursor-pointer",
                                  !notif.read && "bg-blue-50/30"
                                )}
                              >
                                <div className="flex gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    notif.type === 'success' ? "bg-green-100 text-green-600" :
                                    notif.type === 'warning' ? "bg-orange-100 text-orange-600" :
                                    "bg-blue-100 text-blue-600"
                                  )}>
                                    {notif.type === 'success' ? <CheckCircle2 size={16} /> :
                                     notif.type === 'warning' ? <AlertTriangle size={16} /> :
                                     <Info size={16} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{notif.time}</p>
                                  </div>
                                  {!notif.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                          <button 
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              navigate('/servicos'); // Redireciona para serviços como exemplo
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            Ver todas as notificações
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Customers />} />
              <Route path="/cliente/:id" element={<CustomerDetails />} />
              <Route path="/servicos" element={<Repairs />} />
              <Route path="/verificador-imei" element={<ImeiVerifier />} />
              <Route path="/financeiro" element={<Finance />} />
              <Route path="/novo-servico" element={<NewRepair />} />
              <Route path="/servico/:id" element={<RepairDetails />} />
              <Route path="/config" element={<Settings />} />
            </Routes>
          </div>
          <Toaster position="top-right" richColors />
          
          {/* Modal de Confirmação de Logout */}
          <AnimatePresence>
            {isLogoutModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl"
                >
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LogOut size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2 text-slate-900">Sair do Sistema?</h3>
                  <p className="text-slate-500 text-center mb-8">
                    Tem certeza que deseja encerrar sua sessão? Você precisará entrar novamente para acessar seus dados.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsLogoutModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmLogout}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                    >
                      Sair
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
  );
}
