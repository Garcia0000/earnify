import { useAuth } from '../context/AuthContext';
import { BarChart2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Campaigns() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>My Campaigns</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Manage your active promotions and track performance.</p>
      </motion.div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Active', value: '0', icon: CheckCircle, color: '#10B981' },
          { label: 'Pending', value: '0', icon: Clock, color: '#F59E0B' },
          { label: 'Total Budget', value: '$0.00', icon: BarChart2, color: '#0EA5E9' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bank-card"
            style={{ padding: 16 }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0, color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      <div className="bank-card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ padding: 20, borderRadius: '50%', background: '#F0F9FF' }}>
          <AlertCircle size={40} color="#0EA5E9" />
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>No campaigns found</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Start growing your social presence today.</p>
        </div>
        <button
          style={{
            background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 50,
            padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            marginTop: 8
          }}
        >
          Create Your First Campaign
        </button>
      </div>
    </div>
  );
}
