import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function fmtSession(s) {
  const start = new Date(s.startTime).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  const end = new Date(s.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return start + ' to ' + end;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExpoDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [expo, setExpo] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [expoRes, exRes, sesRes] = await Promise.all([
          api.get(`/expos/${id}`),
          api.get(`/attendee/exhibitors?expoId=${id}`),
          api.get(`/expos/${id}/sessions`)
        ]);
        setExpo(expoRes.data);
        setExhibitors(exRes.data);
        setSessions(sesRes.data);

        if (user?.role === 'attendee') {
          const myRes = await api.get('/attendee/my-events');
          const found = myRes.data.find((e) => e.expo?._id === id);
          if (found) {
            setIsRegistered(true);
            setBookmarks(found.bookmarkedSessions || []);
          }
        }
      } catch (err) {
        setMsg(err.response?.data?.message || 'Expo details load nahi ho sakein');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  async function handleRegister() {
    try {
      const res = await api.post(`/attendee/register/${id}`);
      setIsRegistered(true);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  }

  async function toggleBookmark(sessionTitle) {
    try {
      const res = await api.post(`/attendee/bookmark/${id}`, { sessionTitle });
      setIsRegistered(true);
      setBookmarks(res.data.bookmarkedSessions);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Bookmark update failed');
    }
  }

  if (loading) return <div className="wrap" style={{ padding: '4rem 0', color: 'var(--muted)' }}>Loading expo details...</div>;
  if (!expo) return <div className="wrap" style={{ padding: '4rem 0', color: 'var(--red)' }}>Expo not found</div>;

  const scheduleList = sessions;

  return (
    <div className="wrap" style={{ padding: '2.5rem 0', maxWidth: 1100, margin: '0 auto' }}>
      {msg && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '1.5rem',
            borderRadius: 8,
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.35)',
            color: '#4ade80',
            fontSize: '.9rem'
          }}
        >
          {msg}
        </div>
      )}

      {/* Hero Banner Card */}
      <div
        style={{
          background: 'linear-gradient(145deg, #141422 0%, #0b0b12 100%)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {expo.theme && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--red)',
                background: 'rgba(229, 9, 20, 0.12)',
                padding: '4px 12px',
                borderRadius: 20,
                marginBottom: 10,
                fontWeight: 600
              }}
            >
              {expo.theme}
            </span>
          )}
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', margin: '0 0 10px' }}>
            {expo.title}
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
            {expo.description}
          </p>
          <div style={{ display: 'flex', gap: 20, fontSize: '.9rem', color: 'var(--text)' }}>
            <span>📍 {expo.location}</span>
            <span>📅 {fmtDate(expo.startDate)} to {fmtDate(expo.endDate)}</span>
          </div>
        </div>

        {/* Action Button based on Role */}
        <div>
          {user?.role === 'attendee' && (
            isRegistered ? (
              <span
                style={{
                  display: 'inline-block',
                  padding: '12px 22px',
                  borderRadius: 8,
                  background: 'rgba(74, 222, 128, 0.15)',
                  border: '1px solid #4ade80',
                  color: '#4ade80',
                  fontWeight: 700
                }}
              >
                ✓ Registered for Expo
              </span>
            ) : (
              <button
                onClick={handleRegister}
                className="btn"
                style={{ padding: '12px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Register as Attendee
              </button>
            )
          )}

          {user?.role === 'exhibitor' && (
            <Link to={`/expos/${id}/apply`} className="btn" style={{ padding: '12px 24px', borderRadius: 8 }}>
              Apply as Exhibitor
            </Link>
          )}
        </div>
      </div>

      {/* Event Schedule Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: '1rem' }}>
          Event Schedule & Sessions
        </h2>

        {scheduleList.length === 0 ? (
          <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '1.5rem', color: 'var(--muted)' }}>
            Organizer ne abhi is expo ka schedule publish nahi kiya.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {scheduleList.map((session) => {
              const title = session.title;
              const isSaved = bookmarks.includes(title);

              return (
                <div
                  key={session._id}
                  style={{
                    background: '#11111a',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
                      🕒 {fmtSession(session)} {session.room ? `• 📍 ${session.room}` : ''}
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{title}</h4>
                    {session.speaker && (
                      <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
                        Speaker: <strong style={{ color: 'var(--text)' }}>{session.speaker}</strong>
                      </span>
                    )}
                  </div>

                  {user?.role === 'attendee' && (
                    <button
                      onClick={() => toggleBookmark(title)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '.85rem',
                        background: isSaved ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: isSaved ? '1px solid #facc15' : '1px solid var(--line)',
                        color: isSaved ? '#facc15' : 'var(--text)'
                      }}
                    >
                      {isSaved ? '★ Bookmarked' : '☆ Bookmark Session'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Participating Exhibitors Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', margin: 0 }}>
            Participating Exhibitors ({exhibitors.length})
          </h2>
          <Link to="/exhibitors" style={{ color: 'var(--red)', fontSize: '.9rem' }}>
            Search All Exhibitors →
          </Link>
        </div>

        {exhibitors.length === 0 ? (
          <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '1.5rem', color: 'var(--muted)' }}>
            Abhi koi approved exhibitor list nahi hua.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {exhibitors.map((ex) => (
              <div
                key={ex._id}
                style={{
                  background: '#11111a',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '1.2rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{ex.companyName}</strong>
                  {ex.assignedBooth && (
                    <span style={{ fontSize: '.75rem', color: '#4ade80', fontWeight: 700 }}>
                      Booth {ex.assignedBooth.code}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{ex.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}