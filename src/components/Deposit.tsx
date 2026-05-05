import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Deposit() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const usdtAddress = 'TR7NHqjew36bFfCkhzg4OWVgFAS9DgC1_DEMO'; // Example
  
  const copyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>Add Funds</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Deposit USDT (TRC20) to launch your campaigns.</p>
      </motion.div>

      <div className="bank-card" style={{ padding: 24 }}>
        <div style={{ background: '#F0F9FF', padding: 16, borderRadius: 16, display: 'flex', gap: 12, marginBottom: 24, border: '1px solid #BAE6FD' }}>
          <AlertCircle size={20} color="#0EA5E9" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', margin: '0 0 2px' }}>TRC20 Network Only</p>
            <p style={{ fontSize: 12, color: '#0EA5E9', margin: 0 }}>Please only send USDT via the TRON (TRC20) network. Other assets will be lost.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>Deposit Address (USDT TRC20)</label>
            <div style={{ display: 'flex', gap: 8, background: 'var(--background)', borderRadius: 14, padding: '12px 14px', alignItems: 'center', border: '1px solid var(--card-border)' }}>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{usdtAddress}</p>
              <button onClick={copyAddress} style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer' }}><Copy size={18} /></button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'block' }}>Amount to Deposit ($)</label>
            <input
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Min $10.00"
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--background)', fontSize: 14, fontWeight: 500 }}
            />
          </div>

          <div style={{ background: 'var(--background)', padding: 16, borderRadius: 16, border: '1px dashed var(--card-border)' }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>After sending funds, your balance will be updated automatically once confirmed (5-10 mins).</p>
          </div>

          <button
            style={{
              width: '100%', padding: 16, borderRadius: 50, background: '#0EA5E9', color: '#fff',
              border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <CheckCircle2 size={18} /> I've Made the Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
