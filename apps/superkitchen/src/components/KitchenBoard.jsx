import { useEffect, useRef, useState } from 'react';
import { listOrders, updateOrderStatus, shortId, timeAgo } from '../lib/staffApi.js';

const LANES = [
  { key: 'recibido', label: '🆕 New', color: 'lane-new' },
  { key: 'preparando', label: '🍳 Cooking', color: 'lane-cooking' },
  { key: 'listo', label: '✅ Ready', color: 'lane-ready' },
  { key: 'completado', label: '📦 Done', color: 'lane-done' },
  { key: 'cancelado', label: '🚫 Cancelled', color: 'lane-cancel' },
];

const NEXT_STATUS = { recibido: 'preparando', preparando: 'listo', listo: 'completado' };
const ADVANCE_LABEL = { recibido: 'Start cooking', preparando: 'Mark ready', listo: 'Mark done' };

function OrderCard({ order, token, role, onError }) {
  const [busy, setBusy] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];
  const summary = items
    .slice(0, 4)
    .map((i) => `${i.name || i.nombre || 'item'} ×${i.qty ?? i.cantidad ?? 1}`)
    .join(' · ');
  const more = items.length > 4 ? ` +${items.length - 4}` : '';
  const next = NEXT_STATUS[order.estado];
  const canAdvance = next && order.estado !== 'cancelado' && order.estado !== 'completado';

  async function advance() {
    setBusy(true);
    try {
      await updateOrderStatus(token, order.id, next);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (!window.confirm(`Cancel order #${shortId(order.id)}?`)) return;
    setBusy(true);
    try {
      await updateOrderStatus(token, order.id, 'cancelado');
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`k-order-card ${order.estado === 'cancelado' ? 'k-cancelled' : ''}`}>
      <div className="k-card-top">
        <span className="k-order-id">#{shortId(order.id)}</span>
        <span className="k-order-time">{timeAgo(order.created_at)}</span>
      </div>
      <div className="k-order-items">{summary}{more}</div>
      <div className="k-card-meta">
        <span>{order.tipo_entrega === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}</span>
        <span className="k-order-total">${Number(order.total || 0).toFixed(2)}</span>
      </div>
      {order.notas && <div className="k-order-notes">📝 {order.notas}</div>}
      <div className="k-card-actions">
        {canAdvance && (
          <button className="k-advance" onClick={advance} disabled={busy}>
            {ADVANCE_LABEL[order.estado] || 'Advance'}
          </button>
        )}
        {(order.estado === 'recibido' || order.estado === 'preparando') && (
          <button className="k-cancel" onClick={cancel} disabled={busy}>Cancel</button>
        )}
      </div>
    </div>
  );
}

export default function KitchenBoard({ token, role }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await listOrders(token);
        setOrders(Array.isArray(data) ? data : []);
        setLastSync(new Date());
      } catch (err) {
        setError(err.message);
      }
    }
    load();
    timer.current = setInterval(load, 20000);
    return () => clearInterval(timer.current);
  }, [token]);

  const lanes = LANES.map((lane) => ({
    ...lane,
    cards: orders.filter((o) => o.estado === lane.key),
  }));

  return (
    <div className="kitchen-board">
      <div className="board-head">
        <h2>Kitchen Board</h2>
        <span className="board-sync">
          {lastSync ? `Synced ${timeAgo(lastSync.toISOString())} ago · auto-refresh 20s` : 'Syncing…'}
        </span>
      </div>
      {error && <div className="admin-error">{error}</div>}
      <div className="k-lanes">
        {lanes.map((lane) => (
          <div className={`k-lane ${lane.color}`} key={lane.key}>
            <div className="k-lane-head">
              <span>{lane.label}</span>
              <span className="k-lane-count">{lane.cards.length}</span>
            </div>
            <div className="k-lane-body">
              {lane.cards.length === 0 && <div className="k-empty">—</div>}
              {lane.cards.map((o) => (
                <OrderCard key={o.id} order={o} token={token} role={role} onError={setError} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
