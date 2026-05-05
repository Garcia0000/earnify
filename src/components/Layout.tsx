import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Wallet, Gift, ShieldAlert, LogOut, Menu, X, Coins, Users, Moon, Sun, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children, activeTab, onTabChange }: { children: React.ReactNode, activeTab: string, onTabChange: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'offers', label: t('offers'), icon: Gift },
    { id: 'withdraw', label: t('withdraw'), icon: Wallet },
    { id: 'referrals', label: t('referrals'), icon: Users },
  ];

  if (user?.isAdmin) {
    menuItems.push({ id: 'admin', label: t('admin'), icon: ShieldAlert });
  }

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-500 pb-32 md:pb-0`}>
      {/* Top Bar - Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--card-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 tap-effect">
              <Coins size={22} className="rotate-12" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-primary">Earnify</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-gray-500 hover:text-primary transition-all tap-effect shadow-sm"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-gray-500 hover:text-primary transition-all tap-effect shadow-sm"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-[var(--card-border)]">
              <div className="text-right">
                <p className="text-xs font-bold opacity-50 truncate max-w-[120px]">{user?.email}</p>
                <p className="text-sm font-black text-primary">${Number(user?.balance || 0).toFixed(2)}</p>
              </div>
              <button 
                onClick={logout} 
                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all tap-effect"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 h-[calc(100vh-80px)] p-8 flex-col sticky top-20">
          <div className="space-y-3 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all tap-effect ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' 
                    : 'text-gray-500 hover:bg-white hover:text-primary shadow-sm hover:shadow-md'
                }`}
              >
                <item.icon size={22} strokeWidth={2.5} />
                {item.label}
              </button>
            ))}
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-all mt-auto tap-effect"
          >
            <LogOut size={22} />
            {t('logout')}
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden mobile-bottom-nav">
        <div className="flex justify-around items-center h-20">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-all tap-effect ${
                activeTab === item.id ? 'text-primary scale-110' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-primary/10 shadow-lg' : ''}`}>
                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
