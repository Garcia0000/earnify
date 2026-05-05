import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { TrendingUp, CheckCircle, Copy, Users, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const referralLink = `${window.location.origin}?ref=${user?.referral_code}`;
  const copyRef = () => { navigator.clipboard.writeText(referralLink); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const username = user?.email?.split('@')[0] || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginBottom: 2 }}>{greeting},</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', margin: 0, textTransform: 'capitalize' }}>
          {username} 👋
        </h1>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: 'linear-gradient(135deg, #1E1040 0%, #6C3EF4 100%)',
          borderRadius: 24,
          padding: '28px 24px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            Current Balance
          </p>
          <motion.p
            key={user?.balance}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-2px', margin: '0 0 24px' }}
          >
            ${Number(user?.balance || 0).toFixed(2)}
          </motion.p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="tap-effect"
              style={{
                background: '#fff',
                color: '#6C3EF4',
                border: 'none',
                borderRadius: 50,
                padding: '10px 24px',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ArrowUpRight size={15} /> Withdraw
            </button>
            <button
              className="tap-effect"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 50,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Zap size={14} /> Earn More
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Total Earned', value: `$${Number(user?.total_earned || 0).toFixed(2)}`, icon: TrendingUp, color: '#00C896', bg: '#E8FBF5' },
          { label: 'Offers Done', value: 'Active', icon: CheckCircle, color: '#6C3EF4', bg: '#EDE9FE' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bank-card"
            style={{ padding: '18px 16px' }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Referral Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bank-card"
        style={{ padding: '20px', borderRadius: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#6C3EF4" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)' }}>{t('referrals')}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{t('invite_friends')}</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'var(--background)', borderRadius: 14, padding: '4px 4px 4px 14px', alignItems: 'center', border: '1px solid var(--card-border)' }}>
          <p style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {referralLink}
          </p>
          <button
            onClick={copyRef}
            className="tap-effect"
            style={{ background: '#6C3EF4', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            <Copy size={13} /> Copy
          </button>
        </div>
      </motion.div>

    </div>
  );
}
