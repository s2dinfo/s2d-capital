import styles from './Ticker.module.css';
import { getCryptoPrices } from '@/lib/api';

export default async function Ticker() {
  const prices = await getCryptoPrices();

  const items = [
    { sym: 'BTC', price: prices?.bitcoin?.usd, chg: prices?.bitcoin?.usd_24h_change },
    { sym: 'ETH', price: prices?.ethereum?.usd, chg: prices?.ethereum?.usd_24h_change },
    { sym: 'SOL', price: prices?.solana?.usd, chg: prices?.solana?.usd_24h_change },
    { sym: 'XRP', price: prices?.ripple?.usd, chg: prices?.ripple?.usd_24h_change },
    { sym: 'CLARITY Act', label: 'Senate - Pending', isGold: true },
  ];

  const fmt = (n: number) => {
    if (!n) return '-';
    if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (n >= 1) return `$${n.toFixed(2)}`;
    return `$${n.toFixed(4)}`;
  };

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.sym}>{item.sym}</span>
            {item.isGold ? (
              <span className={styles.gold}>{item.label}</span>
            ) : (
              <>
                <span className={styles.price}>{fmt(item.price!)}</span>
                {item.chg != null && (
                  <span className={item.chg > 0 ? styles.up : styles.down}>
                    {item.chg > 0 ? '+' : ''}{item.chg?.toFixed(1)}%
                  </span>
                )}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
