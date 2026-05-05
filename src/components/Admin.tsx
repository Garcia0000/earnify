import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { collection, query, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Withdrawal, UserProfile } from '../types';
import axios from 'axios';
import { Shield, TrendingUp, DollarSign, Wallet, Check, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function AdminPanel() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await axios.get('/api/admin/stats');
        setStats(statsRes.data);

        try {
          const wSnap = await getDocs(query(collection(db, 'withdrawals')));
          setWithdrawals(wSnap.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal)));
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'withdrawals');
        }

        try {
          const uSnap = await getDocs(query(collection(db, 'users')));
          setUsers(uSnap.docs.map(d => ({ ...d.data() } as UserProfile)));
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'users');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleWithdrawal = async (wId: string, status: 'paid' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'withdrawals', wId), {
        status,
        processedAt: new Date()
      });
      setWithdrawals(prev => prev.map(w => w.id === wId ? { ...w, status } : w));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${wId}`);
    }
  };

  if (!profile?.isAdmin) return <div className="p-8 text-center text-red-600 font-bold">Access Denied</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-100">
          <Shield size={24} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('admin_rev')}</p>
          <div className="flex items-center gap-2 text-4xl font-black text-green-600">
            <DollarSign /> {stats?.totalRevenue || 0}
          </div>
        </div>
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('admin_paid')}</p>
          <div className="flex items-center gap-2 text-4xl font-black text-primary">
            <Wallet /> {stats?.totalPaidToUsers || 0}
          </div>
        </div>
        <div className="fintech-card p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('admin_margin')}</p>
          <div className="flex items-center gap-2 text-4xl font-black text-orange-600">
            <TrendingUp /> {stats?.netMargin || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fintech-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-[var(--card-border)] bg-gray-50/50">
            <h2 className="text-xl font-black">{t('status_pending')} Withdrawals</h2>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
              <p className="p-12 text-center text-gray-400 font-bold italic">No pending requests</p>
            ) : withdrawals.filter(w => w.status === 'pending').map(w => (
              <div key={w.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-black text-xl text-gray-900">${w.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 font-medium">{w.details}</p>
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
          <div className="p-8 border-b border-[var(--card-border)] bg-gray-50/50">
            <h2 className="text-xl font-black">User Directory</h2>
          </div>
          <div className="divide-y divide-[var(--card-border)] max-h-[500px] overflow-y-auto">
            {users.map(u => (
              <div key={u.uid} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    {u.fullName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{u.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary uppercase tracking-tighter">{u.country}</p>
                  <p className="text-[10px] text-gray-300 font-bold capitalize">{u.device}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
