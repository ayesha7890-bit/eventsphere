import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/api';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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
    <div className="wrap expos-page">
      <div className="expos-header">
        <h2>Upcoming Expos</h2>
        <p>Browse curated exhibitions, explore 3D floor plans, and book your spot.</p>
      </div>

      {loading && <p className="muted">Loading expos...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && expos.length === 0 && (
        <p className="muted">No expos yet. Please check back soon.</p>
      )}

      <div className="expo-grid">
        {expos.map((e) => (
          <article className="expo-card" key={e._id}>
            <div>
              <div className="expo-card-top">
                <span className="expo-card-theme">{e.theme || 'General'}</span>
                <span className={'badge badge-' + e.status}>{e.status}</span>
              </div>

              <h3 className="expo-card-title">{e.title}</h3>

              <div className="expo-card-info">
                <span>📅 {formatDate(e.startDate)} — {formatDate(e.endDate)}</span>
                <span>📍 {e.location}</span>
              </div>

              <p className="expo-card-desc">{e.description}</p>
            </div>

            <div className="expo-card-actions">
              <Link to={'/expos/' + e._id} className="btn">
                Explore & Schedule
              </Link>

              {user?.role === 'exhibitor' && e.status !== 'completed' && (
                <Link to={'/expos/' + e._id + '/apply'} className="btn btn-red">
                  Apply Now
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}