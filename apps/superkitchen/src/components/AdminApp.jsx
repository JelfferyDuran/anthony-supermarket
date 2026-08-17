import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import StaffLogin from './StaffLogin.jsx';
import KitchenBoard from './KitchenBoard.jsx';
import StoreBoard from './StoreBoard.jsx';

const SESSION_KEY = 'sk-staff-session';

function readSavedSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.access_token || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function AdminApp() {
  const [session, setSession] = useState(readSavedSession);
  const [tab, setTab] = useState('kitchen');

  useEffect(() => {
    if (!session) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT' || !s) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [session]);

  if (!session) {
    return (
      <StaffLogin
        onLogin={(s) => {
          const slim = { access_token: s.access_token, user: { id: s.user.id, email: s.user.email, app_metadata: s.user.app_metadata } };
          localStorage.setItem(SESSION_KEY, JSON.stringify(slim));
          setSession(slim);
        }}
      />
    );
  }

  const role = session.user?.app_metadata?.role || 'unknown';
  const canStore = role === 'manager' || role === 'admin';

  async function logout() {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-brand">
          <img src="logo.jpg" alt="Anthony's Super Kitchen logo" className="brand-logo" />
          <div>
            <h1>Staff Portal</h1>
            <p className="admin-role">Role: <strong>{role}</strong> · {session.user?.email}</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <nav className="admin-tabs">
            <button className={tab === 'kitchen' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('kitchen')}>
              🍳 Kitchen
            </button>
            {canStore && (
              <button className={tab === 'store' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('store')}>
                🏬 Store
              </button>
            )}
          </nav>
          <button className="admin-logout" onClick={logout}>Sign out</button>
        </div>
      </header>
      <main className="admin-main">
        {tab === 'kitchen' && <KitchenBoard token={session.access_token} role={role} />}
        {tab === 'store' && canStore && <StoreBoard token={session.access_token} />}
        {tab === 'store' && !canStore && (
          <div className="admin-error">Your role ({role}) does not have access to store analytics.</div>
        )}
      </main>
    </div>
  );
}
