import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Globe, Sparkles, ChevronRight, Zap, Filter } from 'lucide-react';

export default function OfferWall() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user?.id) return;
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/offers?tracking_id=${user.id}`);
        const data = await res.json();
        setOffers(data);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [user?.id]);

  const types = ['all', ...Array.from(new Set(offers.map((o) => o.type).filter(Boolean)))];
  const filtered = filter === 'all' ? offers : offers.filter((o) => o.type === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginBottom: 2 }}>
          Live from CPAGrip
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', margin: 0 }}>
          {t('offers')} ⚡
        </h1>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}
      >
        {[
          { label: 'Available', value: offers.length, color: '#6C3EF4', bg: '#EDE9FE' },
          { label: 'Global', value: '🌍', color: '#0EA5E9', bg: '#E0F2FE' },
          { label: 'Targeted', value: '✅', color: '#00C896', bg: '#E8FBF5' },
        ].map((s) => (
          <div key={s.label} className="bank-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 16 }}>
              {typeof s.value === 'number'
                ? <span style={{ fontWeight: 900, fontSize: 14, color: s.color }}>{s.value}</span>
                : s.value}
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter chips */}
      {types.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
        >
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className="tap-effect"
              style={{
                background: filter === type ? '#6C3EF4' : 'var(--card-bg)',
                color: filter === type ? '#fff' : 'var(--muted)',
                border: `1px solid ${filter === type ? '#6C3EF4' : 'var(--card-border)'}`,
                borderRadius: 50,
                padding: '6px 16px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {type}
            </button>
          ))}
        </motion.div>
      )}

      {/* Offers list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #EDE9FE', borderTopColor: '#6C3EF4' }}
          />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Fetching best offers...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bank-card" style={{ padding: 40, textAlign: 'center' }}>
          <Globe size={32} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>
            No offers available for your region right now.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((offer, i) => (
            <motion.a
              key={offer.id}
              href={offer.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bank-card tap-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 18,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                overflow: 'hidden', flexShrink: 0,
                background: '#EDE9FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {offer.image
                  ? <img src={offer.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Sparkles size={22} color="#6C3EF4" />}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {offer.title}
                </p>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {offer.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>
                    ${offer.payout?.toFixed(2)}
                  </span>
                  {offer.type && (
                    <span style={{ background: '#EDE9FE', color: '#6C3EF4', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>
                      {offer.type}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div style={{
                background: '#6C3EF4', color: '#fff',
                borderRadius: 12, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                <Zap size={13} /> Start
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
