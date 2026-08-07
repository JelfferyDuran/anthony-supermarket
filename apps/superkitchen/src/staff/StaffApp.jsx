import { useEffect, useMemo, useState } from 'react';
import {
  isStaffRole,
  listOrders,
  readStoredSession,
  refreshSession,
  sessionRole,
  signIn,
  signOut,
  signUp,
  updateOrderStatus,
} from './staffAuth.js';
import './staff.css';

const STATUS_LABELS = {
  recibido: 'New',
  preparando: 'Cooking',
  listo: 'Ready',
  completado: 'Completed',
  cancelado: 'Canceled',
};

const NEXT_ACTION = {
  recibido: { status: 'preparando', label: 'Start cooking' },
  preparando: { status: 'listo', label: 'Mark ready' },
  listo: { status: 'completado', label: 'Complete' },
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

export default function StaffApp() {
  const [session, setSession] = useState(() => readStoredSession());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [busyOrder, setBusyOrder] = useState('');

  const role = sessionRole(session);
  const authorized = isStaffRole(role);

  const load = async (quiet = false) => {
    if (!session) {
      setLoading(false);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const data = await listOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      if (e.status === 401) {
        setOrders([]);
        setError('');
      } else {
        setError(e.message || 'Could not load orders.');
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
    if (!session || !authorized) return undefined;
    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [session?.access_token, authorized]);

  const visibleOrders = useMemo(() => {
    if (showHistory) return orders;
    return orders.filter(o => !['completado', 'cancelado'].includes(o.estado));
  }, [orders, showHistory]);

  const counts = useMemo(() => ({
    recibido: orders.filter(o => o.estado === 'recibido').length,
    preparando: orders.filter(o => o.estado === 'preparando').length,
    listo: orders.filter(o => o.estado === 'listo').length,
  }), [orders]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const result = await signUp(email.trim(), password);
        if (result.session) {
          setSession(result.session);
          setMessage('Account created. A manager still needs to approve your staff role.');
        } else {
          setMessage('Account created. Check your email if confirmation is required, then sign in.');
          setMode('signin');
        }
      } else {
        const result = await signIn(email.trim(), password);
        setSession(result);
      }
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
      setMessage(isStaffRole(sessionRole(fresh)) ? 'Staff access confirmed.' : 'Your account is active, but staff access is still awaiting approval.');
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
    if (nextStatus === 'cancelado') {
      const ok = window.confirm(`Cancel order #${order.id}? This action is recorded in the audit log.`);
      if (!ok) return;
    }
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

  if (!session) {
    return (
      <main className="staff-shell auth-shell">
        <section className="staff-auth-card">
          <div className="staff-brand-mark">AK</div>
          <h1>Anthony's Kitchen Staff</h1>
          <p className="staff-muted">Protected kitchen access. Accounts receive no staff privileges until approved.</p>
          <form onSubmit={handleAuth} className="staff-auth-form">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required />
            {error && <p className="staff-error">{error}</p>}
            {message && <p className="staff-message">{message}</p>}
            <button className="staff-primary" disabled={submitting}>{submitting ? 'Working…' : mode === 'signup' ? 'Create staff account' : 'Sign in'}</button>
          </form>
          <button className="staff-link" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
            {mode === 'signin' ? 'Need an account? Request access' : 'Already have an account? Sign in'}
          </button>
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
          <h1>Access pending</h1>
          <p className="staff-muted">Your login is valid, but this account has not been assigned a kitchen, manager, or admin role.</p>
          {message && <p className="staff-message">{message}</p>}
          {error && <p className="staff-error">{error}</p>}
          <button className="staff-primary" onClick={handleRefreshAccess} disabled={submitting}>{submitting ? 'Checking…' : 'Refresh access'}</button>
          <button className="staff-secondary" onClick={handleLogout}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="staff-shell">
      <header className="staff-topbar">
        <div>
          <div className="staff-eyebrow">Anthony's Super Kitchen</div>
          <h1>Kitchen Orders</h1>
        </div>
        <div className="staff-top-actions">
          <span className="staff-role">{role}</span>
          <button className="staff-secondary small" onClick={() => load()}>Refresh</button>
          <button className="staff-secondary small" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <section className="staff-stats" aria-label="Order counts">
        <div><strong>{counts.recibido}</strong><span>New</span></div>
        <div><strong>{counts.preparando}</strong><span>Cooking</span></div>
        <div><strong>{counts.listo}</strong><span>Ready</span></div>
      </section>

      <section className="staff-toolbar">
        <button className={!showHistory ? 'staff-filter active' : 'staff-filter'} onClick={() => setShowHistory(false)}>Active orders</button>
        <button className={showHistory ? 'staff-filter active' : 'staff-filter'} onClick={() => setShowHistory(true)}>All recent</button>
      </section>

      {error && <p className="staff-error staff-banner">{error}</p>}
      {loading ? <p className="staff-muted staff-loading">Loading orders…</p> : null}

      <section className="staff-order-grid">
        {!loading && visibleOrders.length === 0 ? <div className="staff-empty">No orders in this view.</div> : null}
        {visibleOrders.map(order => {
          const next = NEXT_ACTION[order.estado];
          const customer = order.cliente || {};
          return (
            <article className={`staff-order-card status-${order.estado}`} key={order.id}>
              <div className="staff-order-head">
                <div>
                  <span className="staff-order-id">#{order.id}</span>
                  <span className={`staff-status ${order.estado}`}>{STATUS_LABELS[order.estado] || order.estado}</span>
                </div>
                <strong>{money(order.total)}</strong>
              </div>

              <div className="staff-order-meta">
                <span>{order.tipo_entrega === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}</span>
                <span>{customer.nombre || 'Customer'}</span>
                {customer.telefono ? <a href={`tel:${customer.telefono}`}>{customer.telefono}</a> : null}
              </div>

              <ul className="staff-items">
                {(order.items || []).map((item, index) => <li key={`${order.id}-${index}`}>{itemLabel(item)}</li>)}
              </ul>

              {order.notas ? <div className="staff-notes"><strong>Notes:</strong> {order.notas}</div> : null}

              <div className="staff-order-actions">
                {next ? (
                  <button className="staff-primary" disabled={busyOrder === order.id} onClick={() => changeStatus(order, next.status)}>
                    {busyOrder === order.id ? 'Updating…' : next.label}
                  </button>
                ) : null}
                {['recibido', 'preparando', 'listo'].includes(order.estado) ? (
                  <button className="staff-danger" disabled={busyOrder === order.id} onClick={() => changeStatus(order, 'cancelado')}>Cancel</button>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
