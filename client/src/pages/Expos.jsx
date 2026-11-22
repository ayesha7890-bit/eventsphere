import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/api';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function Expos() {
  const { user } = useAuth();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/expos')
      .then((res) => setExpos(res.data))
      .catch(() => setError('Could not load expos. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrap" style={{ padding: '48px 20px' }}>
      <h2 style={{ fontSize: '2rem' }}>Upcoming expos</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Browse events and find the one that fits you.
      </p>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && expos.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No expos yet. Please check back soon.</p>
      )}

      <div className="expo-grid">
        {expos.map((e) => (
          <article className="card expo-card" key={e._id}>
            <span className="kind">{e.theme || 'General'}</span>
            <h3>{e.title}</h3>
            <div className="meta">{formatDate(e.startDate)} to {formatDate(e.endDate)}</div>
            <div className="meta">{e.location}</div>
            <p className="desc">{e.description}</p>
            <span className={'badge badge-' + e.status}>{e.status}</span>
            {user?.role === 'exhibitor' && e.status !== 'completed' && (
  <Link
    to={'/expos/' + e._id + '/apply'}
    className="btn btn-red"
    style={{ marginTop: 10, alignSelf: 'flex-start' }}
  >
    Apply as exhibitor
  </Link>
)}
<div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
  <Link
    to={'/expos/' + e._id}
    className="btn"
    style={{ alignSelf: 'flex-start' }}
  >
    View Details & Schedule
  </Link>

  {user?.role === 'exhibitor' && e.status !== 'completed' && (
    <Link
      to={'/expos/' + e._id + '/apply'}
      className="btn btn-red"
      style={{ alignSelf: 'flex-start' }}
    >
      Apply as exhibitor
    </Link>
  )}
</div>
          </article>
        ))}
      </div>
    </div>
  );
}