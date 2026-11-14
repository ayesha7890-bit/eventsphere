import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api'; 

export default function MyRegistrations() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/registrations/my')
      .then((res) => {
        setApplications(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Applications load nahi ho sakein');
        setLoading(false);
      });
  }, []);

  function getStatusBadge(status) {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return {
        color: '#4ade80',
        background: 'rgba(74, 222, 128, 0.12)',
        border: '1px solid rgba(74, 222, 128, 0.35)'
      };
    }
    if (s === 'rejected') {
      return {
        color: '#f87171',
        background: 'rgba(248, 113, 113, 0.12)',
        border: '1px solid rgba(248, 113, 113, 0.35)'
      };
    }
    return {
      color: '#facc15',
      background: 'rgba(250, 204, 21, 0.12)',
      border: '1px solid rgba(250, 204, 21, 0.35)'
    };
  }

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--muted)' }}>
        Loading your applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--red)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '2.5rem 0', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--line)'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '2rem',
              margin: 0,
              color: 'var(--text)'
            }}
          >
            My Expo Applications
          </h1>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0', fontSize: '.92rem' }}>
            Track your exhibitor registration status and booth assignments
          </p>
        </div>

        <Link
          to="/expos"
          className="btn"
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '.9rem',
            boxShadow: '0 4px 16px rgba(229, 9, 20, 0.25)'
          }}
        >
          + Apply for New Expo
        </Link>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '3.5rem 2rem',
            textAlign: 'center'
          }}
        >
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
            Aap ne abhi tak kisi expo ke liye apply nahi kiya.
          </p>
          <Link to="/expos" className="btn" style={{ padding: '10px 22px', borderRadius: 8 }}>
            Explore Upcoming Expos
          </Link>
        </div>
      ) : (
        /* Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {applications.map((app) => {
            const badgeStyle = getStatusBadge(app.status);
            const isApproved = (app.status || '').toLowerCase() === 'approved';

            return (
              <div
                key={app._id}
                style={{
                  background: 'linear-gradient(160deg, #12121c 0%, #0b0b12 100%)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '1.5rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  {/* Card Top: Expo Title & Status Pill */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: 'Playfair Display, serif',
                          fontSize: '1.3rem',
                          margin: '0 0 6px 0',
                          color: 'var(--text)'
                        }}
                      >
                        {app.expo?.title || 'Expo'}
                      </h3>
                      <div style={{ fontSize: '.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📍 {app.expo?.location || 'Venue TBA'}</span>
                        {app.expo?.date && (
                          <span>• {new Date(app.expo.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        ...badgeStyle,
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: '.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {app.status || 'Pending'}
                    </span>
                  </div>

                  {/* Card Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Company
                      </span>
                      <strong style={{ fontSize: '.92rem', color: 'var(--text)' }}>
                        {app.companyName}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Category
                      </span>
                      <strong style={{ fontSize: '.92rem', color: 'var(--text)' }}>
                        {app.category}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Preferred Booth
                      </span>
                      <strong style={{ fontSize: '.92rem', color: 'var(--text)', textTransform: 'capitalize' }}>
                        {app.preferredBoothSize || 'Standard'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Assigned Booth
                      </span>
                      {app.boothNumber ? (
                        <strong style={{ fontSize: '.95rem', color: '#4ade80' }}>
                          #{app.boothNumber}
                        </strong>
                      ) : (
                        <span style={{ fontSize: '.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                          Not assigned yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {isApproved ? (
                  <Link
                    to={`/expos/${app.expo?._id}/floor-plan`}
                    className="btn"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: '.9rem',
                      textDecoration: 'none'
                    }}
                  >
                    Select / Manage Booth on Floor Plan
                  </Link>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '.82rem',
                      color: 'var(--muted)',
                      padding: '8px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {app.status?.toLowerCase() === 'rejected'
                      ? 'Application was not approved by organizer'
                      : 'Booth selection unlocks once organizer approves'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}