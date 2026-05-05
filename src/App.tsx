import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n/config';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import WithdrawalPage from './components/Withdrawal';
import AdminPanel from './components/Admin';
import Campaigns from './components/Campaigns';
import CreateCampaign from './components/CreateCampaign';
import Deposit from './components/Deposit';
import { Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function SplashScreen() {
  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center" style={{ background: '#0D0D14' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
        <div className="p-6 rounded-[2rem] shadow-2xl" style={{ background: '#6C3EF4' }}>
          <Coins size={56} color="white" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>EARNIFY</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Social Exchange Platform</p>
      </motion.div>
    </motion.div>
  );
}

function AuthScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'earner' | 'advertiser'>('earner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const ref = localStorage.getItem('referredBy') || undefined;
        await register(email, password, ref, role);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 420, width: '100%' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#6C3EF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Coins size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-1px', color: '#0D0D14' }}>EARNIFY</h1>
          <p style={{ fontSize: 12, color: '#8A93A8', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Social Exchange Platform</p>
        </div>

        <div className="bank-card" style={{ padding: 32, borderRadius: 24 }}>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Role selector (solo en register) */}
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A93A8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>I want to...</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'earner', label: '💰 Earn Money', desc: 'Complete tasks' },
                  { value: 'advertiser', label: '📢 Advertise', desc: 'Grow my social' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as any)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 14,
                      border: `2px solid ${role === r.value ? '#6C3EF4' : 'var(--card-border)'}`,
                      background: role === r.value ? '#EDE9FE' : 'var(--background)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 800, color: role === r.value ? '#6C3EF4' : '#0D0D14', margin: '0 0 2px' }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: '#8A93A8', margin: 0 }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <input
              required type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 600, outline: 'none' }}
            />
            <input
              required type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 600, outline: 'none' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 50,
              background: '#6C3EF4', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#8A93A8', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
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
    if (ref) localStorage.setItem('referredBy', ref);
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isAdvertiser = user?.role === 'advertiser';

  return (
    <AnimatePresence>
      {showSplash && <SplashScreen key="splash" />}
      {!showSplash && (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loading ? (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D14' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(108,62,244,0.2)', borderTopColor: '#6C3EF4', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !user ? (
            <AuthScreen />
          ) : (
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'dashboard' && <Dashboard />}
              {/* Earner tabs */}
              {!isAdvertiser && activeTab === 'tasks' && <Tasks />}
              {!isAdvertiser && activeTab === 'withdraw' && <WithdrawalPage />}
              {!isAdvertiser && activeTab === 'referrals' && <Dashboard />}
              {/* Advertiser tabs */}
              {isAdvertiser && activeTab === 'campaigns' && <Campaigns />}
              {isAdvertiser && activeTab === 'create' && <CreateCampaign />}
              {isAdvertiser && activeTab === 'deposit' && <Deposit />}
              {/* Admin */}
              {activeTab === 'admin' && <AdminPanel />}
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
