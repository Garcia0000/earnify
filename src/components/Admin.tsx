import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Withdrawal, User } from '../types';
import axios from 'axios';
import { Shield, TrendingUp, DollarSign, Wallet, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPanel() {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('/api/admin/stats');
      setStats(statsRes.data);

      const wRes = await axios.get('/api/admin/withdrawals');
      setWithdrawals(wRes.data);

      const uRes = await axios.get('/api/admin/users');
      setUsers(uRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.isAdmin) fetchAdminData();
  }, [authUser]);

  const handleWithdrawal = async (wId: number, status: 'paid' | 'rejected') => {
    try {
      await axios.post(`/api/admin/withdrawals/${wId}/status`, { status });
      setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status } : w));
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  if (!authUser?.isAdmin) return <div className="p-8 text-center text-red-600 font-bold uppercase tracking-widest">Access Denied</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg">
          <Shield size={24} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Admin Authority</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Revenue</p>
          <div className="flex items-center gap-2 text-4xl font-black text-green-600">
            <DollarSign /> {stats?.totalRevenue || 0}
          </div>
        </div>
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Paid</p>
          <div className="flex items-center gap-2 text-4xl font-black text-primary">
            <Wallet /> {stats?.totalPaidToUsers || 0}
          </div>
        </div>
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Net Margin</p>
          <div className="flex items-center gap-2 text-4xl font-black text-orange-600">
            <TrendingUp /> {stats?.netMargin || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fintech-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-black uppercase tracking-tighter">Pending Withdrawals</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
              <p className="p-12 text-center text-gray-400 font-bold italic">No pending requests</p>
            ) : withdrawals.filter(w => w.status === 'pending').map(w => (
              <div key={w.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-black text-xl text-gray-900">${Number(w.amount).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{w.method} - {w.details}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWithdrawal(w.id, 'paid')}
                    className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all tap-effect"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => handleWithdrawal(w.id, 'rejected')}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all tap-effect"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fintech-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-black uppercase tracking-tighter">User Directory</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                    {u.email[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{u.email}</p>
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">ID: {u.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary uppercase tracking-tighter">${Number(u.balance).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{u.referral_code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
