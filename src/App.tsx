/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n/config';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OfferWall from './components/OfferWall';
import WithdrawalPage from './components/Withdrawal';
import AdminPanel from './components/Admin';
import { Coins, LogIn as GoogleIcon, ShieldCheck, Globe, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-dark-bg flex flex-col items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="flex flex-col items-center"
      >
        <div className="p-6 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/40 mb-8">
            <Coins size={64} className="animate-pulse" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">EARNIFY</h1>
        <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-accent rounded-full"
                />
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-fintech-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full fintech-card p-10 md:p-14 rounded-[3.5rem] text-center relative z-10"
      >
        <div className="inline-flex p-5 bg-primary text-white rounded-[2rem] mb-10 shadow-2xl shadow-primary/30 relative">
          <Coins size={48} className="rotate-12" />
          <div className="absolute -top-2 -right-2 p-1.5 bg-accent text-dark-bg rounded-lg shadow-lg">
             <Sparkles size={16} />
          </div>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase">EARNIFY</h1>
        <p className="text-gray-400 mb-12 font-medium leading-relaxed">
            Payout on demand.<br/>
            <span className="text-primary font-black uppercase tracking-widest text-[10px]">The Trusted Rewards Ecosystem</span>
        </p>
        
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-4 bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-2xl shadow-gray-200 active:scale-[0.96] group"
        >
          <GoogleIcon size={20} className="group-hover:rotate-12 transition-transform" />
          {t('google_login')}
        </button>

        <div className="mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-gray-50">
          <div className="flex flex-col items-center gap-2">
            <Globe size={20} className="text-primary/30" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Global</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck size={20} className="text-primary/30" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Secure</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star size={20} className="text-primary/30" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Fintech</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referredBy', ref);
    }

    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showSplash && <SplashScreen key="splash" />}
      
      {!showSplash && (
        <motion.div
           key="content"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="min-h-screen transition-opacity duration-1000"
        >
          {loading ? (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-primary/20 border-t-accent rounded-full"
                />
            </div>
          ) : !user ? (
            <LoginScreen />
          ) : (
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'offers' && <OfferWall />}
              {activeTab === 'withdraw' && <WithdrawalPage />}
              {activeTab === 'admin' && <AdminPanel />}
              {activeTab === 'referrals' && <Dashboard />}
            </Layout>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
