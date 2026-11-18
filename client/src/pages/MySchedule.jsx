import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function MySchedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendee/my-events')
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="wrap" style={{ padding: '4rem 0', color: 'var(--muted)' }}>Loading your schedule...</div>;

  return (
    <div className="wrap" style={{ padding: '2.5rem 0', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0 0 6px' }}>
          My Events & Bookmarked Sessions
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '.92rem' }}>
          Your registered expos and saved workshop reminders
        </p>
      </div>

      {events.length === 0 ? (
        <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1.2rem' }}>
            Aap ne abhi tak kisi expo mein register nahi kiya.
          </p>
          <Link to="/expos" className="btn" style={{ padding: '10px 20px', borderRadius: 8 }}>
            Browse Expos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {events.map((item) => (
            <div
              key={item._id}
              style={{
                background: 'linear-gradient(160deg, #12121c 0%, #0b0b12 100%)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', margin: '0 0 4px' }}>
                    {item.expo?.title}
                  </h3>
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
                    📍 {item.expo?.location} • 📅 {item.expo?.date ? new Date(item.expo.date).toLocaleDateString() : ''}
                  </span>
                </div>

                <Link
                  to={`/expos/${item.expo?._id}`}
                  className="btn"
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: '.85rem', textDecoration: 'none' }}
                >
                  View Full Schedule
                </Link>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ display: 'block', fontSize: '.82rem', color: '#facc15', marginBottom: 8 }}>
                  ★ BOOKMARKED SESSIONS ({item.bookmarkedSessions?.length || 0})
                </strong>

                {item.bookmarkedSessions?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', lineHeight: 1.8 }}>
                    {item.bookmarkedSessions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
                    No sessions bookmarked yet. Open the expo schedule to bookmark sessions.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}