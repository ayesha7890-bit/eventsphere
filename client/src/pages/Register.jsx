import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const roles = [
  { value: 'attendee', title: 'Attendee', text: 'Visit expos and join sessions' },
  { value: 'exhibitor', title: 'Exhibitor', text: 'Showcase your company' }
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'attendee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="gradient-bar"></div>
        <h1>Join the expo.</h1>
        <p>One account for organizers, exhibitors and visitors.</p>
        <ul className="perks">
          <li>Discover upcoming expos</li>
          <li>Reserve your booth on the floor plan</li>
          <li>Build your own session schedule</li>
        </ul>
      </aside>

      <div className="card auth-card">
        <h2>Create account</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 8px', fontSize: '.92rem' }}>
          Choose how you will use EventSphere.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="role-pick">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                className="role-btn"
                aria-pressed={form.role === r.value}
                onClick={() => setForm({ ...form, role: r.value })}
              >
                <b>{r.title}</b>
                <small>{r.text}</small>
              </button>
            ))}
          </div>

          <div className="form-grid">
            <div>
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="password">Password (min 6)</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn btn-red" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: '.9rem', marginBottom: 0 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}