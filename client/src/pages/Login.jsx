import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 440, padding: '60px 20px' }}>
      <div className="card">
        <h2>Welcome back</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Log in to your account.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} 
          onChange={handleChange} required />
<div style={{ textAlign: 'right', marginTop: 8 }}>
  <Link to="/forgot-password" style={{ fontSize: '.85rem' }}>Forgot password?</Link>
</div>
          {error && <p className="error">{error}</p>}

          <button className="btn btn-red" style={{ width: '100%', marginTop: 20 }}
           disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: '.9rem' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}