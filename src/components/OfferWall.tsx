import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Globe, Smartphone, Monitor, Sparkles, ChevronRight } from 'lucide-react';

export default function OfferWall() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/offers?tracking_id=${profile.uid}`);
        const data = await res.json();
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [profile?.uid]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fintech-card rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px]"
    >
      <div className="p-6 md:p-8 border-b border-[var(--card-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t('offers')}</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <Globe size={12} /> Live Revenue Feed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-[var(--card-border)] text-[10px] font-black uppercase tracking-tighter text-gray-400 shadow-sm">
            <Globe size={14} className="text-primary" />
            {profile?.country}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-[var(--card-border)] text-[10px] font-black uppercase tracking-tighter text-gray-400 shadow-sm">
            {profile?.device === 'mobile' ? <Smartphone size={14} className="text-primary" /> : <Monitor size={14} className="text-primary" />}
            {profile?.device}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white p-6 overflow-y-auto max-h-[800px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-32">
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full mb-4"
              />
              <p className="font-bold uppercase tracking-widest text-xs">Fetching Best Offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">No offers available for your region. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <motion.a
                key={offer.id}
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
                  {offer.image ? (
                    <img src={offer.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <Sparkles size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{offer.title}</h3>
                  <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mt-0.5">{offer.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[10px] font-black uppercase tracking-tighter">
                      ${offer.payout.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest truncate">{offer.type}</span>
                  </div>
                </div>
                <div className="p-2 text-gray-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
