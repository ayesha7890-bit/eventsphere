import { useEffect, useState } from 'react';
import api from '../api/api';

export default function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="wrap" style={{ padding: '2.5rem 0', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0 0 6px' }}>
          Exhibitor Directory
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '.92rem' }}>
          Search exhibitors by company name, products, or category and locate their booths
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: '2rem',
          background: '#11111a',
          padding: '1rem',
          borderRadius: 12,
          border: '1px solid var(--line)'
        }}
      >
        <input
          type="text"
          placeholder="Search company, products, or services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 240,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: '#09090F',
            color: 'var(--text)'
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: '#09090F',
            color: 'var(--text)',
            minWidth: 180
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' }}>Searching exhibitors...</div>
      ) : exhibitors.length === 0 ? (
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--muted)'
          }}
        >
          Koi exhibitor nahi mila. Doosra keyword ya category try karein.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {exhibitors.map((ex) => (
            <div
              key={ex._id}
              style={{
                background: 'linear-gradient(160deg, #12121c 0%, #0b0b12 100%)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', margin: '0 0 4px' }}>
                      {ex.companyName}
                    </h3>
                    <span style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 600 }}>
                      {ex.category}
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '.75rem',
                      fontWeight: 700,
                      background: ex.boothNumber ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255,255,255,0.06)',
                      color: ex.boothNumber ? '#4ade80' : 'var(--muted)',
                      border: ex.boothNumber ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid var(--line)'
                    }}
                  >
                    {ex.boothNumber ? `Booth #${ex.boothNumber}` : 'Booth TBA'}
                  </span>
                </div>

                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
                  {ex.companyDescription || 'No description provided.'}
                </p>

                {ex.productsServices?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                      PRODUCTS & SERVICES
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ex.productsServices.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '.75rem',
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: 12,
                  marginTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '.82rem',
                  color: 'var(--muted)'
                }}
              >
                <span>🎪 {ex.expo?.title || 'Expo'}</span>
                {ex.contactEmail && (
                  <a
                    href={`mailto:${ex.contactEmail}?subject=Inquiry via EventSphere`}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '.8rem', borderRadius: 6, textDecoration: 'none' }}
                  >
                    Contact Exhibitor
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}