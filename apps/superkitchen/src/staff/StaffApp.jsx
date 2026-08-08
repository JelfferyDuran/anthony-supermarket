import { useEffect, useMemo, useRef, useState } from 'react';
import {
  isStaffRole,
  listOrders,
  readStoredSession,
  refreshSession,
  sessionRole,
  signIn,
  signOut,
  updateOrderStatus,
} from './staffAuth.js';
import './staff.css';

const LANES = [
  { status: 'recibido', title: 'New', subtitle: 'Needs attention' },
  { status: 'preparando', title: 'Cooking', subtitle: 'In the kitchen' },
  { status: 'listo', title: 'Ready', subtitle: 'Waiting for handoff' },
  { status: 'completado', title: 'Done', subtitle: 'Recently completed' },
];

const NEXT_ACTION = {
  recibido: { status: 'preparando', label: 'Start cooking' },
  preparando: { status: 'listo', label: 'Mark ready' },
  listo: { status: 'completado', label: 'Complete order' },
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function itemLabel(item) {
  const base = `${item.qty || item.cantidad || 1}× ${item.name || item.nombre || 'Item'}`;
  const parts = [];
  if (item.meat?.name) parts.push(item.meat.name);
  if (item.side?.name) parts.push(item.side.name);
  return parts.length ? `${base} — ${parts.join(' / ')}` : base;
}

function elapsedMinutes(createdAt, now) {
  const created = new Date(createdAt || 0).getTime();
  if (!Number.isFinite(created) || created <= 0) return 0;
  return Math.max(0, Math.floor((now - created) / 60000));
}

function elapsedLabel(minutes) {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function urgencyClass(minutes, status) {
  if (status === 'completado') return 'calm';
  if (minutes >= 15) return 'late';
  if (minutes >= 8) return 'watch';
  return 'on-time';
}

function OrderCard({ order, now, busy, onAdvance, onCancel }) {
  const next = NEXT_ACTION[order.estado];
  const customer = order.cliente || {};
  const minutes = elapsedMinutes(order.created_at, now);
  const urgency = urgencyClass(minutes, order.estado);

  return (
    <article className={`kds-order-card status-${order.estado} urgency-${urgency}`}>
      <div className="kds-card-topline">
        <div>
          <div className="kds-order-number">#{order.id}</div>
          <div className={`kds-timer ${urgency}`} aria-label={`Order age ${elapsedLabel(minutes)}`}>
            <span className="kds-timer-dot" />
            {elapsedLabel(minutes)}
          </div>
        </div>
        <strong className="kds-order-total">{money(order.total)}</strong>
      </div>

      <div className="kds-order-type-row">
        <span className={`kds-order-type ${order.tipo_entrega === 'delivery' ? 'delivery' : 'pickup'}`}>
          {order.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🛍️ Pickup'}
        </span>
        <span className="kds-customer-name">{customer.nombre || 'Customer'}</span>
      </div>

      <div className="kds-item-list">
        {(order.items || []).map((item, index) => (
          <div className="kds-item" key={`${order.id}-${index}`}>
            {itemLabel(item)}
          </div>
        ))}
      </div>

      {order.notas ? (
        <div className="kds-notes"><strong>⚠ Notes</strong><span>{order.notas}</span></div>
      ) : null}

      {(customer.telefono || (order.tipo_entrega === 'delivery' && customer.direccion)) ? (
        <div className="kds-customer-details">
          {customer.telefono ? <a href={`tel:${customer.telefono}`}>☎ {customer.telefono}</a> : null}
          {order.tipo_entrega === 'delivery' && customer.direccion ? <span>📍 {customer.direccion}</span> : null}
        </div>
      ) : null}

      {order.estado !== 'completado' ? (
        <div className="kds-card-actions">
          {next ? (
            <button className="kds-action-primary" disabled={busy} onClick={() => onAdvance(order, next.status)}>
              {busy ? 'Updating…' : next.label}
            </button>
          ) : null}
          <button className="kds-action-more" disabled={busy} onClick={() => onCancel(order)} aria-label={`Cancel order ${order.id}`}>
            •••
          </button>
        </div>
      ) : (
        <div className="kds-complete-stamp">✓ Completed</div>
      )}
    </article>
  );
}

export default function StaffApp() {
  const [session, setSession] = useState(() => readStoredSession());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyOrder, setBusyOrder] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [now, setNow] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState('');
  const seenOrderIds = useRef(new Set());
  const initializedOrders = useRef(false);
  const audioContextRef = useRef(null);

  const role = sessionRole(session);
  const authorized = isStaffRole(role);

  const playNewOrderSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Sound is optional. The visible alert remains the reliable path.
    }
  };

  const enableSound = async () => {
    setSoundEnabled(true);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = audioContextRef.current || new AudioCtx();
        audioContextRef.current = ctx;
        if (ctx.state === 'suspended') await ctx.resume();
      }
    } catch {
      // Browser may block audio; visible alerts still work.
    }
  };

  const load = async (quiet = false) => {
    if (!session) {
      setLoading(false);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const data = await listOrders();
      const nextOrders = Array.isArray(data) ? data : [];

      if (!initializedOrders.current) {
        nextOrders.forEach(order => seenOrderIds.current.add(order.id));
        initializedOrders.current = true;
      } else {
        const freshNewOrders = nextOrders.filter(order => order.estado === 'recibido' && !seenOrderIds.current.has(order.id));
        nextOrders.forEach(order => seenOrderIds.current.add(order.id));
        if (freshNewOrders.length) {
          const newest = freshNewOrders[0];
          setNewOrderAlert(`New ${newest.tipo_entrega === 'delivery' ? 'delivery' : 'pickup'} order #${newest.id}`);
          playNewOrderSound();
        }
      }

      setOrders(nextOrders);
      setLastSync(new Date());
      setOnline(true);
      setError('');
    } catch (e) {
      if (e.status === 401) {
        setOrders([]);
        setError('');
      } else {
        setOnline(false);
        setError(e.message || 'Could not refresh orders. The board may be out of date.');
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const fresh = await refreshSession(false);
        if (active) setSession(fresh);
      } catch {
        if (active) setSession(null);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleOnline = () => { setOnline(true); if (session && authorized) load(true); };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session?.access_token, authorized]);

  useEffect(() => {
    if (!session || !authorized) return undefined;
    load();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, 5000);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
    };
  }, [session?.access_token, authorized, soundEnabled]);

  const laneOrders = useMemo(() => {
    const grouped = Object.fromEntries(LANES.map(lane => [lane.status, []]));
    orders.forEach(order => {
      if (grouped[order.estado]) grouped[order.estado].push(order);
    });
    grouped.completado = grouped.completado.slice(0, 8);
    return grouped;
  }, [orders]);

  const activeCount = useMemo(
    () => orders.filter(order => ['recibido', 'preparando', 'listo'].includes(order.estado)).length,
    [orders]
  );

  const handleAuth = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await signIn(email.trim(), password);
      setSession(result);
      setPassword('');
    } catch (e) {
      setError(e.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshAccess = async () => {
    setSubmitting(true);
    setError('');
    try {
      const fresh = await refreshSession(true);
      setSession(fresh);
      setMessage(isStaffRole(sessionRole(fresh))
        ? 'Staff access confirmed.'
        : 'This account has not been provisioned with a staff role.');
    } catch (e) {
      setError(e.message || 'Could not refresh access.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setOrders([]);
    setMessage('Signed out.');
  };

  const changeStatus = async (order, nextStatus) => {
    setBusyOrder(order.id);
    setError('');
    try {
      await updateOrderStatus(order.id, nextStatus);
      await load(true);
    } catch (e) {
      setError(e.message || 'Status change failed.');
    } finally {
      setBusyOrder('');
    }
  };

  const cancelOrder = async (order) => {
    const ok = window.confirm(`Cancel order #${order.id}? This action is recorded in the audit log.`);
    if (!ok) return;
    await changeStatus(order, 'cancelado');
  };

  if (!session) {
    return (
      <main className="staff-shell auth-shell">
        <section className="staff-auth-card">
          <div className="staff-brand-mark">AK</div>
          <h1>Anthony's Kitchen Staff</h1>
          <p className="staff-muted">Protected staff access. Management creates staff accounts; there is no public signup.</p>
          <form onSubmit={handleAuth} className="staff-auth-form">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" minLength={8} required />
            {error && <p className="staff-error">{error}</p>}
            {message && <p className="staff-message">{message}</p>}
            <button className="staff-primary" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="staff-muted">Need access? Ask a manager to provision your staff account and role.</p>
          <a className="staff-link" href="./">← Customer menu</a>
        </section>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="staff-shell auth-shell">
        <section className="staff-auth-card">
          <div className="staff-brand-mark">AK</div>
          <h1>Access not provisioned</h1>
          <p className="staff-muted">The login is valid, but this account does not have a kitchen, manager, or admin role. Roles are assigned server-side.</p>
          {message && <p className="staff-message">{message}</p>}
          {error && <p className="staff-error">{error}</p>}
          <button className="staff-primary" onClick={handleRefreshAccess} disabled={submitting}>{submitting ? 'Checking…' : 'Refresh access'}</button>
          <button className="staff-secondary" onClick={handleLogout}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="staff-shell kds-shell">
      <header className="kds-topbar">
        <div className="kds-brand-block">
          <div className="staff-eyebrow">Anthony's Super Kitchen</div>
          <div className="kds-title-row">
            <h1>Kitchen</h1>
            <span className="kds-active-count">{activeCount} active</span>
          </div>
        </div>

        <div className="kds-system-controls">
          <div className={`kds-connection ${online ? 'online' : 'offline'}`}>
            <span className="kds-connection-dot" />
            <div>
              <strong>{online ? 'Live' : 'Offline'}</strong>
              <small>{lastSync ? `Synced ${lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for sync'}</small>
            </div>
          </div>
          <button className={`kds-sound-toggle ${soundEnabled ? 'enabled' : ''}`} onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}>
            {soundEnabled ? '🔊 Alerts on' : '🔇 Enable alerts'}
          </button>
          <button className="staff-secondary small" onClick={() => load()}>Refresh</button>
          <span className="staff-role">{role}</span>
          <button className="staff-secondary small" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      {newOrderAlert ? (
        <section className="kds-new-order-alert" role="status" aria-live="assertive">
          <div><strong>🔔 NEW ORDER</strong><span>{newOrderAlert}</span></div>
          <button onClick={() => setNewOrderAlert('')}>Acknowledge</button>
        </section>
      ) : null}

      {error ? <p className="staff-error kds-error-banner">{error}</p> : null}
      {loading ? <p className="staff-muted staff-loading">Loading kitchen board…</p> : null}

      <section className="kds-board" aria-label="Kitchen order board">
        {LANES.map(lane => {
          const laneItems = laneOrders[lane.status] || [];
          return (
            <section className={`kds-lane lane-${lane.status}`} key={lane.status}>
              <header className="kds-lane-header">
                <div>
                  <h2>{lane.title}</h2>
                  <p>{lane.subtitle}</p>
                </div>
                <span className="kds-lane-count">{laneItems.length}</span>
              </header>
              <div className="kds-lane-orders">
                {!loading && laneItems.length === 0 ? <div className="kds-lane-empty">No orders</div> : null}
                {laneItems.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    busy={busyOrder === order.id}
                    onAdvance={changeStatus}
                    onCancel={cancelOrder}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </main>
  );
}
