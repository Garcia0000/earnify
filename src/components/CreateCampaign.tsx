import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Instagram, Youtube, Twitter, Send, Globe, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function CreateCampaign() {
  const [platform, setPlatform] = useState('instagram');

  const platforms = [
    { id: 'instagram', icon: Instagram, color: '#E1306C' },
    { id: 'youtube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'telegram', icon: Send, color: '#0088CC' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>New Campaign</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Create a new promotion to grow your social audience.</p>
      </motion.div>

      <div className="bank-card" style={{ padding: 24, borderRadius: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Select Platform</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                style={{
                  padding: '16px 8px',
                  borderRadius: 16,
                  border: `2px solid ${platform === p.id ? p.color : 'var(--card-border)'}`,
                  background: platform === p.id ? `${p.color}10` : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <p.icon size={20} color={platform === p.id ? p.color : 'var(--muted)'} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'capitalize', color: platform === p.id ? p.color : 'var(--muted)' }}>{p.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>Campaign Title</label>
            <input
              placeholder="e.g., Follow my Instagram"
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 500 }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>URL</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }}><Globe size={16} /></div>
              <input
                placeholder="https://..."
                style={{ width: '100%', padding: '14px 16px 14px 40px', borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>Payout / Action</label>
              <input
                type="number" step="0.01" placeholder="0.05"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 500 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>Total Budget</label>
              <input
                type="number" placeholder="50.00"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 500 }}
              />
            </div>
          </div>

          <button
            style={{
              width: '100%', padding: 16, borderRadius: 50, background: '#0EA5E9', color: '#fff',
              border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <PlusCircle size={18} /> Launch Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
