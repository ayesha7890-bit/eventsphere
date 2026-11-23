
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function ExpoDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [expo, setExpo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [exhibitors, setExhibitors] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [expoRes, exRes, sessRes] = await Promise.all([
          api.get(`/expos/${id}`),
          api.get(`/attendee/exhibitors?expoId=${id}`),
          api.get(`/expos/${id}/sessions`).catch(() => ({ data: [] }))
        ]);

        setExpo(expoRes.data);
        setExhibitors(exRes.data);
        setSessions(sessRes.data);

        if (user?.role === 'attendee') {
          const myRes = await api.get('/attendee/my-events');

          const found = myRes.data.find(
            (e) => e.expo?._id === id
          );

          if (found) {
            setIsRegistered(true);
            setBookmarks(found.bookmarkedSessions || []);
          }
        }
      } catch (err) {
        setMsg(
          err.response?.data?.message ||
          'Expo details load nahi ho sakein'
        );
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
      const res = await api.post(`/attendee/bookmark/${id}`, {
        sessionTitle
      });

      setIsRegistered(true);
      setBookmarks(res.data.bookmarkedSessions);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Bookmark update failed');
    }
  }

  if (loading) {
    return (
      <div className="wrap expo-details-wrap">
        Loading expo details...
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="wrap expo-details-wrap error">
        Expo not found
      </div>
    );
  }

  // Database sessions available hon to woh show honge.
  // Warna expo ka default schedule show hoga.
  const scheduleList =
    sessions.length > 0 ? sessions : (expo.schedule || []);

  const dateDisplay = expo.startDate
    ? `${fmtDate(expo.startDate)}${
        expo.endDate ? ` to ${fmtDate(expo.endDate)}` : ''
      }`
    : expo.date
      ? fmtDate(expo.date)
      : 'Date TBA';

  return (
    <div className="wrap expo-details-wrap">

      {msg && <div className="expo-alert">{msg}</div>}

      {/* Hero Banner Card */}
      <div className="expo-hero-card">

        <div className="expo-hero-info">

          {expo.theme && (
            <span className="expo-theme-pill">
              {expo.theme}
            </span>
          )}

          <h1 className="expo-hero-title">
            {expo.title}
          </h1>

          <p className="expo-hero-desc">
            {expo.description}
          </p>

          <div className="expo-hero-meta">
            <span>📍 {expo.location}</span>
            <span>📅 {dateDisplay}</span>
          </div>

        </div>

        <div>
          {user?.role === 'attendee' && (
            isRegistered ? (
              <span className="expo-registered-badge">
                ✓ Registered for Expo
              </span>
            ) : (
              <button onClick={handleRegister} className="btn">
                Register as Attendee
              </button>
            )
          )}

          {user?.role === 'exhibitor' && (
            <Link to={`/expos/${id}/apply`} className="btn">
              Apply as Exhibitor
            </Link>
          )}
        </div>

      </div>

      {/* Event Schedule Section */}
      <div className="expo-section">

        <h2 className="expo-section-title">
          Event Schedule & Sessions
        </h2>

        {scheduleList.length === 0 ? (
          <div className="expo-empty-box">
            Organizer ne abhi is expo ka schedule publish nahi kiya.
          </div>
        ) : (
          <div className="session-list">

            {scheduleList.map((session, idx) => {

              const title =
                session.title ||
                session.topic ||
                `Session ${idx + 1}`;

              const isSaved = bookmarks.includes(title);

              const timeDisplay = session.startTime
                ? `${new Date(session.startTime).toLocaleDateString(
                    'en-GB',
                    { day: 'numeric', month: 'short' }
                  )}, ${new Date(session.startTime).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  )}${
                    session.endTime
                      ? ` - ${new Date(session.endTime).toLocaleTimeString(
                          [],
                          { hour: '2-digit', minute: '2-digit' }
                        )}`
                      : ''
                  }`
                : (session.time || session.timeSlot || 'Time TBA');

              const roomLocation = session.room || session.location;

              return (
                <div
                  key={session._id || idx}
                  className="session-card"
                >

                  <div>

                    <div className="session-time">
                      🕒 {timeDisplay}
                      {roomLocation ? ` • 📍 ${roomLocation}` : ''}
                    </div>

                    <h4 className="session-title">
                      {title}
                    </h4>

                    {session.description && (
                      <p className="session-desc">
                        {session.description}
                      </p>
                    )}

                    {session.speaker && (
                      <span className="session-speaker">
                        Speaker: <strong>{session.speaker}</strong>
                      </span>
                    )}

                  </div>

                  {user?.role === 'attendee' && (
                    <button
                      onClick={() => toggleBookmark(title)}
                      className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
                    >
                      {isSaved
                        ? '★ Bookmarked'
                        : '☆ Bookmark Session'}
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

        <div className="expo-section-header">

          <h2 className="expo-section-title">
            Participating Exhibitors ({exhibitors.length})
          </h2>

          <Link to="/exhibitors" className="link-red">
            Search All Exhibitors →
          </Link>

        </div>

        {exhibitors.length === 0 ? (
          <div className="expo-empty-box">
            Abhi koi approved exhibitor list nahi hua.
          </div>
        ) : (
          <div className="exhibitor-preview-grid">

            {exhibitors.map((ex) => (

              <div
                key={ex._id}
                className="exhibitor-preview-card"
              >

                <div className="exhibitor-preview-top">

                  <strong>{ex.companyName}</strong>

                  {(ex.assignedBooth?.code || ex.boothNumber) && (
                    <span className="booth-tag">
                      Booth {ex.assignedBooth?.code || `#${ex.boothNumber}`}
                    </span>
                  )}

                </div>

                <span className="session-speaker">
                  {ex.category}
                </span>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}
