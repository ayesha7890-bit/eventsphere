import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password/' + token, { password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="auth-single">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="gradient-bar" style={{ margin: '0 auto 20px' }}></div>
          <h2>Password updated</h2>
          <p style={{ color: 'var(--muted)' }}>You can now log in with your new password.</p>
          <Link to="/login" className="btn btn-red">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-single">
      <div className="card auth-card">
        <h2>Set a new password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">New password (min 6)</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />

          {error && <p className="error">{error}</p>}

          <button className="btn btn-red" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
            {loading ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}