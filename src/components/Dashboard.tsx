import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { DollarSign, CheckCircle, TrendingUp, Users, Copy, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const referralLink = `${window.location.origin}?ref=${user?.referral_code}`;

  const copyRef = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copied!');
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
          {t('welcome')} <Sparkles className="text-accent" />
        </h1>
        <p className="text-gray-500 font-medium font-mono lowercase tracking-tighter">ready to maximize your gains?</p>
      </div>

      {/* BIG Balance Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-8 rounded-[3rem] dark-card bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <DollarSign size={200} />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">{t('balance')}</p>
        <motion.div 
          key={user?.balance}
          initial={{ scale: 1.2, color: '#00FF87' }}
          animate={{ scale: 1, color: 'inherit' }}
          className="text-7xl md:text-9xl font-black tracking-tighter"
        >
          ${Number(user?.balance || 0).toFixed(2)}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="dark-card p-8 rounded-[2.5rem] flex items-center gap-6"
        >
          <div className="p-5 bg-accent/10 text-accent rounded-3xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-bold opacity-50 uppercase tracking-wider">{t('total_earned')}</p>
            <p className="text-3xl font-black">${Number(user?.total_earned || 0).toFixed(2)}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="dark-card p-8 rounded-[2.5rem] flex items-center gap-6"
        >
          <div className="p-5 bg-primary/10 text-primary rounded-3xl">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold opacity-50 uppercase tracking-wider">{t('completed')}</p>
            <p className="text-3xl font-black">ACTIVE</p>
          </div>
        </motion.div>
      </div>

      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary p-12 md:p-16 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl shadow-primary/20"
      >
        <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 flex items-center gap-4">
              <Users size={48} /> {t('referrals')}
            </h2>
            <p className="text-white/70 text-xl font-medium leading-relaxed mb-10">{t('invite_friends')}</p>
            <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
              <input
                readOnly
                value={referralLink}
                className="bg-transparent border-none text-white px-6 py-4 flex-1 text-sm outline-none font-bold placeholder:text-white/30"
              />
              <button
                onClick={copyRef}
                className="bg-accent text-dark-bg px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
              >
                <Copy size={18} /> {t('copy_link')}
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
               <div className="absolute inset-0 bg-accent/30 blur-[100px] rounded-full translate-y-10" />
               <Users size={240} className="relative z-10 text-white/10" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
