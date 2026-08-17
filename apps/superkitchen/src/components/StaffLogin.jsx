import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function StaffLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError || !data.session) {
      setError(authError?.message || 'Sign in failed. Check your credentials.');
      return;
    }
    onLogin(data.session);
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <img src="logo.jpg" alt="Anthony's Super Kitchen logo" className="brand-logo" />
        <h1>Staff Portal</h1>
        <p className="admin-login-sub">Kitchen · Manager · Admin</p>
        <form onSubmit={submit} className="admin-login-form">
          <input
            type="email"
            placeholder="Staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" className="admin-btn" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="admin-login-foot">Staff access only. All actions are audited.</p>
      </div>
    </div>
  );
}
