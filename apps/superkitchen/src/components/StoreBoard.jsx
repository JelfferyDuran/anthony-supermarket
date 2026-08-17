import { useEffect, useState } from 'react';
import { getOpsSummary, shortId, timeAgo } from '../lib/staffApi.js';

function Stat({ label, value, sub }) {
  return (
    <div className="st-stat">
      <div className="st-value">{value}</div>
      <div className="st-label">{label}</div>
      {sub && <div className="st-sub">{sub}</div>}
    </div>
  );
}

export default function StoreBoard({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const d = await getOpsSummary(token);
        if (alive) {
          setData(d);
          setLastSync(new Date());
        }
      } catch (err) {
        if (alive) setError(err.message);
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [token]);

  if (error && !data) return <div className="admin-error">Store summary unavailable: {error}</div>;
  if (!data) return <div className="board-head"><h2>Store Overview</h2><span className="board-sync">Loading…</span></div>;

  const { active, last24h, recentOrders = [] } = data;
  const byStatus = active.byStatus || {};
  const byType = last24h.byDeliveryType || {};

  return (
    <div className="store-board">
      <div className="board-head">
        <h2>Store Overview</h2>
        <span className="board-sync">
          {lastSync ? `Synced ${timeAgo(lastSync.toISOString())} ago · auto-refresh 60s` : ''}
        </span>
      </div>

      <div className="st-stats">
        <Stat label="Active orders" value={active.total} sub={last24h.orders ? `${last24h.orders} in last 24h` : ''} />
        <Stat
          label="Gross sales (24h)"
          value={`$${Number(last24h.grossSalesExcludingCancelled || 0).toFixed(2)}`}
          sub="excl. cancelled"
        />
        <Stat label="New" value={byStatus.recibido ?? 0} />
        <Stat label="Cooking" value={byStatus.preparando ?? 0} />
        <Stat label="Ready" value={byStatus.listo ?? 0} />
        <Stat label="Pickup / Delivery" value={`${byType.pickup ?? 0} / ${byType.delivery ?? 0}`} />
      </div>

      <div className="st-section">
        <h3>Recent orders (24h)</h3>
        {recentOrders.length === 0 && <div className="k-empty">No orders in the last 24h.</div>}
        <table className="st-table">
          <thead>
            <tr><th>ID</th><th>Status</th><th>Type</th><th>Total</th><th>Age</th></tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td>#{shortId(o.id)}</td>
                <td><span className={`st-status st-${o.status || 'unknown'}`}>{o.status || 'unknown'}</span></td>
                <td>{o.deliveryType === 'delivery' ? '🛵' : '🏃'}</td>
                <td>${Number(o.total || 0).toFixed(2)}</td>
                <td>{timeAgo(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="st-section">
        <h3>Status transitions (24h)</h3>
        {!last24h.transitionCounts || Object.keys(last24h.transitionCounts).length === 0 ? (
          <div className="k-empty">No transitions recorded.</div>
        ) : (
          <div className="st-transitions">
            {Object.entries(last24h.transitionCounts).map(([k, v]) => (
              <span key={k} className="st-chip">{k} ×{v}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
