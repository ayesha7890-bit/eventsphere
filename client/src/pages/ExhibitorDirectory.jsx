import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';



function cleanTags(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .flatMap((item) => {
      if (typeof item === 'string' && item.trim().startsWith('[')) {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    })
    .map((s) => String(s).replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim())
    .filter(Boolean);
}

export default function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();


  // Inquiry Modal ke states
  const [activeEx, setActiveEx] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const categories = ['All', 'Technology', 'Fashion', 'Healthcare', 'Education', 'Finance', 'Food & Beverage', 'Other'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/attendee/exhibitors', { params: { search, category } })
        .then((res) => {
          setExhibitors(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category]);

  async function handleSendInquiry(e) {
    e.preventDefault();
    setSending(true);
    setFeedback('');
    try {
      await api.post('/messages', {
        exhibitorId: activeEx._id,
        subject,
        message
      });
      setFeedback('Inquiry sent! Exhibitor will reply in your Messages tab.');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setActiveEx(null);
        setFeedback('');
      }, 1400);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not send inquiry. Please login first.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="dir-page">
      <div className="dir-hero">
        <h1 className="dir-title">Exhibitor Directory</h1>
        <p className="dir-subtitle">
          Discover innovative companies, explore their products, and locate their booths on the floor.
        </p>
      </div>

      {/* Search & Category Pills */}
      <div className="dir-controls">
        <div className="dir-search-wrap">
          <span className="dir-search-icon">🔍</span>
          <input
            type="text"
            className="dir-search-input"
            placeholder="Search by company name, product, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dir-pills">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`dir-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="dir-empty">Searching exhibitors...</div>
      ) : exhibitors.length === 0 ? (
        <div className="dir-empty">
          Koi exhibitor nahi mila. Doosra keyword ya category try karein.
        </div>
      ) : (
        <div className="dir-grid">
          {exhibitors.map((ex, idx) => {
            const tags = cleanTags(ex.productsServices);
            const initial = (ex.companyName || 'E').charAt(0).toUpperCase();

            return (
              <div
                key={ex._id}
                className="dir-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div>
                  <div className="dir-card-head">
                    <div className="dir-brand">
                      <div className="dir-avatar">{initial}</div>
                      <div>
                        <h3 className="dir-company">{ex.companyName}</h3>
                        <span className="dir-cat">{ex.category}</span>
                      </div>
                    </div>

                    <span className={`dir-booth-badge ${ex.assignedBooth ? 'assigned' : ''}`}>
                      {ex.assignedBooth ? `Booth ${ex.assignedBooth.code}` : 'Booth TBA'}
                    </span>
                  </div>

                  <p className="dir-desc">
                    {ex.companyDescription || 'No company overview provided yet.'}
                  </p>

                  {tags.length > 0 && (
                    <div>
                      <span className="dir-tags-label">PRODUCTS & SERVICES</span>
                      <div className="dir-tags">
                        {tags.map((item, i) => (
                          <span key={i} className="dir-tag">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="dir-card-foot">
                  <span>🎪 {ex.expo?.title || 'Expo'}</span>
                  {user && String(ex.user?._id || ex.user) === String(user.id || user._id) ? (
                    <span className="dir-booth-badge assigned">Your Booth</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-red"
                      onClick={() => {
                        setFeedback('');
                        setActiveEx(ex);
                      }}
                    >
                      Send Inquiry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Inquiry Modal */}
      {activeEx && (
        <div className="modal-backdrop" onClick={() => setActiveEx(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Message {activeEx.companyName}</h3>
                <span className="dir-cat">{activeEx.category}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveEx(null)}
              >
                ✕
              </button>
            </div>

            {feedback && <p className="success">{feedback}</p>}

            <form className="modal-form" onSubmit={handleSendInquiry}>
              <input
                type="text"
                placeholder="Subject (e.g. Product Pricing / Booth Meeting)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <textarea
                placeholder="Write your question or inquiry here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-red" disabled={sending}>
                {sending ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}