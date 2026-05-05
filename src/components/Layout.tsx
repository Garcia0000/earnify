import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Wallet, ListTodo, ShieldAlert, LogOut, Users, Moon, Sun, Globe, Coins, Bell, PlusCircle, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children, activeTab, onTabChange }: {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const earnerMenu = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'withdraw', label: 'Withdraw', icon: Wallet },
    { id: 'referrals', label: 'Referrals', icon: Users },
  ];

  const advertiserMenu = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart2 },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'deposit', label: 'Deposit', icon: Wallet },
  ];

  const menuItems = user?.role === 'advertiser' ? advertiserMenu : earnerMenu;
  const allItems = user?.isAdmin ? [...menuItems, { id: 'admin', label: 'Admin', icon: ShieldAlert }] : menuItems;

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  const initials = user?.email?.[0]?.toUpperCase() || 'U';
  const isAdvertiser = user?.role === 'advertiser';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 pb-24 md:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg)] border-b border-[var(--card-border)]" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isAdvertiser ? '#0EA5E9' : '#6C3EF4' }}>
              <Coins size={18} color="white" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: isAdvertiser ? '#0EA5E9' : '#6C3EF4', letterSpacing: '-0.5px' }}>
                EARNIFY
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 6, background: isAdvertiser ? '#E0F2FE' : '#EDE9FE', padding: '2px 6px', borderRadius: 4 }}>
                {isAdvertiser ? 'Advertiser' : 'Earner'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="tap-effect w-9 h-9 rounded-xl flex items-center justify-center bank-card">
              <Globe size={16} color="var(--muted)" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="tap-effect w-9 h-9 rounded-xl flex items-center justify-center bank-card">
              {isDark ? <Sun size={16} color="var(--muted)" /> : <Moon size={16} color="var(--muted)" />}
            </button>
            <button className="tap-effect w-9 h-9 rounded-xl flex items-center justify-center bank-card">
              <Bell size={16} color="var(--muted)" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white ml-1" style={{ background: isAdvertiser ? '#0EA5E9' : '#6C3EF4' }}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 h-[calc(100vh-65px)] flex-col sticky top-[65px] p-6 gap-2">
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 12 }}>
            Menu
          </p>
          {allItems.map((item) => {
            const active = activeTab === item.id;
            const color = isAdvertiser ? '#0EA5E9' : '#6C3EF4';
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="tap-effect flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all text-sm w-full"
                style={{
                  background: active ? color : 'transparent',
                  color: active ? '#fff' : 'var(--muted)',
                  fontWeight: active ? 700 : 500,
                }}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
          <div className="mt-auto">
            <div className="bank-card p-4 rounded-2xl mb-3">
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
                {isAdvertiser ? 'Credits' : 'Balance'}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: isAdvertiser ? '#0EA5E9' : '#6C3EF4' }}>
                ${Number(user?.balance || 0).toFixed(2)}
              </p>
            </div>
            <button onClick={logout} className="tap-effect flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-sm font-semibold" style={{ color: '#EF4444' }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden mobile-bottom-nav">
        <div className="flex justify-around items-center h-16">
          {allItems.slice(0, 4).map((item) => {
            const active = activeTab === item.id;
            const color = isAdvertiser ? '#0EA5E9' : '#6C3EF4';
            const bgColor = isAdvertiser ? '#E0F2FE' : '#EDE9FE';
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)} className="tap-effect flex flex-col items-center gap-1 py-2 px-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" style={{ background: active ? bgColor : 'transparent' }}>
                  <item.icon size={20} strokeWidth={active ? 2.5 : 1.8} color={active ? color : 'var(--muted)'} />
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? color : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
