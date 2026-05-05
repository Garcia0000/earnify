import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Withdrawal } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Landmark, History, Clock, CheckCircle2, XCircle, ChevronRight, DollarSign, Wallet } from 'lucide-react';

export default function WithdrawalPage() {
  const { user, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('5.00');
  const [method, setMethod] = useState<'paypal' | 'bank_transfer'>('paypal');
  const [details, setDetails] = useState('');
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/transactions');
      // Transactions table now includes types like 'withdrawal'
      // Or we can fetch from withdrawals specifically if we added an endpoint
      // Let's assume we use /api/user/transactions for simplicity or add a specific one
      // For now, I'll fetch withdrawals specifically (I should add this to server.ts)
      const wRes = await axios.get('/api/user/withdrawals');
      setHistory(wRes.data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const val = parseFloat(amount);
    if (val < 5) return alert(t('min_withdraw'));
    if (val > user.balance) return alert('Insufficient balance');

    setLoading(true);
    try {
      await axios.post('/api/user/withdraw', {
        amount: val,
        method,
        details
      });
      alert('Withdrawal request submitted successfully!');
      setDetails('');
      await refreshProfile();
      await fetchHistory();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Payout Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fintech-card p-8 md:p-12 rounded-[2.5rem] space-y-8"
      >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{t('withdraw')}</h2>
        </div>

        <div className="p-8 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col items-center">
            <p className="font-bold uppercase text-[10px] tracking-[0.3em] opacity-60 mb-2">{t('balance')}</p>
            <p className="text-5xl font-black">${Number(user?.balance || 0).toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('method')}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod('paypal')}
                className={`flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 transition-all tap-effect ${method === 'paypal' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100 shadow-sm'}`}
              >
                <CreditCard size={32} />
                <span className="font-black text-xs uppercase tracking-widest">{t('paypal')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 transition-all tap-effect ${method === 'bank_transfer' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100 shadow-sm'}`}
              >
                <Landmark size={32} />
                <span className="font-black text-xs uppercase tracking-widest">{t('bank')}</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('payout_details')}</label>
              <input
                required
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={method === 'paypal' ? 'Email address' : 'Account details'}
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Payout Amount ($)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                <input
                    required
                    type="number"
                    step="0.01"
                    min="5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 text-xl font-black outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase mt-3 tracking-widest">{t('min_withdraw')}</p>
            </div>
          </div>

          <button
            disabled={loading || (user?.balance || 0) < 5}
            className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl shadow-primary/20 tap-effect"
          >
            {loading ? 'Processing...' : t('request')}
          </button>
        </form>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fintech-card p-8 md:p-12 rounded-[2.5rem] h-fit"
      >
        <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
          <History size={32} className="text-primary" /> History
        </h2>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-20 text-center opacity-10">
              <History size={64} className="mx-auto mb-4" />
              <p className="font-bold">No history available</p>
            </div>
          ) : (
            history.map((w) => (
              <motion.div 
                key={w.id} 
                className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl ${
                    w.status === 'paid' ? 'bg-accent/10 text-accent' : 
                    w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                  }`}>
                    {w.status === 'paid' ? <CheckCircle2 size={24} /> : w.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900">${Number(w.amount).toFixed(2)}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-30">{w.method.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-[.2em] mb-1 ${
                    w.status === 'paid' ? 'text-accent' : 
                    w.status === 'rejected' ? 'text-red-500' : 'text-primary'
                  }`}>
                    {t(`status_${w.status}`)}
                  </p>
                  <p className="text-[10px] font-bold opacity-30">
                    {new Date(w.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
