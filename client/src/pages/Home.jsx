import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api'; // Apni api file ka exact path check kar lein (e.g., '../api')
import Expos from './Expos';

export default function Home() {
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [fbSent, setFbSent] = useState('');

  useEffect(() => {
    api.get('/attendee/exhibitors')
      .then((res) => setExhibitors(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  function handleFeedbackSubmit(e) {
    e.preventDefault();
    setFbSent('Thank you! Your feedback has been submitted to the EventSphere team.');
    setFeedback({ name: '', email: '', message: '' });
  }

  return (
    <>
      {/* 1. AAPKA ORIGINAL HERO SECTION */}
      <header className="hero">
        <div className="wrap">
          <div className="gradient-bar"></div>

          <h1>The expo, run beautifully.</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 480, fontSize: '1.05rem' }}>
            Organizers, exhibitors and visitors in one place. Reserve a booth,
            shape the schedule and meet the right people.
          </p>

          {user ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <p style={{ color: 'var(--pur-l)', margin: 0 }}>Welcome, {user.name}.</p>
              {user.role === 'attendee' && (
                <Link to="/my-schedule" className="btn">My Schedule</Link>
              )}
              {user.role === 'exhibitor' && (
                <Link to="/my-applications" className="btn">My Applications</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to="/register" className="btn btn-red">Get started</Link>
              <Link to="/login" className="btn">Login</Link>
            </div>
          )}
        </div>
      </header>

      {/* 2. AAPKA ORIGINAL EXPOS COMPONENT */}
      <Expos />

      {/* 3. FEATURED EXHIBITORS SECTION */}
      {exhibitors.length > 0 && (
        <section className="wrap" style={{ padding: '3rem 20px', borderTop: '1px solid var(--line)', marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h2>Featured exhibitors</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Discover innovative companies showcasing at our expos.</p>
            </div>
            <Link to="/exhibitors" style={{ fontSize: '.92rem', fontWeight: 500 }}>
              Explore all exhibitors →
            </Link>
          </div>

          <div className="expo-grid">
            {exhibitors.map((ex) => (
              <div key={ex._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="kind">{ex.category}</span>
                    {ex.assignedBooth && (
                      <span style={{ fontSize: '.78rem', color: 'var(--ok)', fontWeight: 600 }}>
                        Booth {ex.assignedBooth.code}
                      </span>
                    )}
                  </div>
                  <h3>{ex.companyName}</h3>
                  <p className="desc">{ex.companyDescription || 'Showcasing latest products and solutions.'}</p>
                </div>
                <div className="meta" style={{ marginTop: 12 }}>🎪 {ex.expo?.title}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. BUILT FOR EVERY ROLE */}
      <section className="wrap" style={{ padding: '3rem 20px', borderTop: '1px solid var(--line)', marginTop: 20 }}>
        <div style={{ marginBottom: 24 }}>
          <h2>Built for every role</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Whether you are hosting, exhibiting, or visiting — everything stays synced in real time.
          </p>
        </div>

        <div className="expo-grid">
          <div className="card">
            <span className="kind">01 • Visitors</span>
            <h3 style={{ marginTop: 6 }}>For Attendees</h3>
            <p className="desc">
              Explore upcoming expos, bookmark keynote sessions, search exhibitors by category, and connect directly.
            </p>
          </div>

          <div className="card">
            <span className="kind">02 • Brands</span>
            <h3 style={{ marginTop: 6 }}>For Exhibitors</h3>
            <p className="desc">
              Apply for expos online, manage your brand profile, reserve booths on the floor plan, and showcase products.
            </p>
          </div>

          <div className="card">
            <span className="kind">03 • Real-Time</span>
            <h3 style={{ marginTop: 6 }}>Live Schedules</h3>
            <p className="desc">
              Stay updated with real-time booth allocations, speaker lineups, and instant schedule updates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEEDBACK & SUPPORT SECTION */}
      <section className="wrap" style={{ padding: '3rem 20px 4rem', borderTop: '1px solid var(--line)' }}>
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
            boxShadow: '0 0 60px rgba(124, 58, 237, 0.12)'
          }}
        >
          <div>
            <span className="kind">Support & Suggestions</span>
            <h2 style={{ marginTop: 6 }}>Have feedback or a question?</h2>
            <p style={{ color: 'var(--muted)' }}>
              Share your suggestions or report an issue with our event support team. We are here to make your expo experience seamless.
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Write your feedback or inquiry..."
              required
              style={{ marginTop: 12 }}
              value={feedback.message}
              onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
            />
            <button type="submit" className="btn" style={{ marginTop: 12 }}>
              Send Feedback
            </button>
            {fbSent && <p className="success">{fbSent}</p>}
          </form>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '2rem 0', background: 'rgba(9, 9, 15, 0.7)' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <strong style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
              Event<b style={{ color: 'var(--red)' }}>Sphere</b>
            </strong>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '4px 0 0' }}>
              © {new Date().getFullYear()} EventSphere Management. All rights reserved.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: '.88rem' }}>
            <Link to="/expos">Expos</Link>
            <Link to="/exhibitors">Exhibitors</Link>
            {!user && <Link to="/login">Login</Link>}
            {!user && <Link to="/register">Register</Link>}
          </div>
        </div>
      </footer>
    </>
  );
}