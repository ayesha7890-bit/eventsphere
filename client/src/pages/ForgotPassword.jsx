import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetLink) setResetLink(res.data.resetLink);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-single">
      <div className="card auth-card">
        <h2>Forgot password?</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          Enter your email and we will create a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          {resetLink && (
            <div className="demo-box">
              <small>Demo mode: no email service is connected, so the link is shown here.</small>
              <a href={resetLink}>Open reset link</a>
            </div>
          )}

          <button className="btn btn-red" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
            {loading ? 'Creating link...' : 'Create reset link'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: '.9rem', marginBottom: 0 }}>
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}