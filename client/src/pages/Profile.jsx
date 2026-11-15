import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const categories = ['Software', 'Hardware', 'Food', 'Education', 'Fashion', 'Automotive', 'Healthcare', 'Other'];

const emptyForm = {
  companyName: '', companyLogo: '', companyDescription: '', category: '',
  productsServices: '', website: '', contactPerson: '', contactEmail: '',
  contactPhone: '', address: ''
};

// Brackets aur quotes hata kar saaf list banata hai
function cleanList(items) {
  const text = Array.isArray(items) ? items.join(',') : items || '';
  return text
    .replace(/[\[\]"“”]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile/me')
      .then((res) => {
        setProfile(res.data);
        if (!res.data) {
          setForm({ ...emptyForm, contactPerson: user.name, contactEmail: user.email });
          setEditing(true);
        }
      })
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  function startEdit() {
    setForm({
      companyName: profile.companyName || '',
      companyLogo: profile.companyLogo || '',
      companyDescription: profile.companyDescription || '',
      category: profile.category || '',
      productsServices: cleanList(profile.productsServices).join(', '),
      website: profile.website || '',
      contactPerson: profile.contactPerson || '',
      contactEmail: profile.contactEmail || '',
      contactPhone: profile.contactPhone || '',
      address: profile.address || ''
    });
    setSaved(false);
    setError('');
    setEditing(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const list = cleanList(form.productsServices);
    if (list.length === 0) {
      setError('Please add at least one product or service');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/profile/me', { ...form, productsServices: list });
      setProfile(res.data);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pf-page">
        <main className="pf-sheet"><p style={{ color: 'var(--muted)' }}>Loading...</p></main>
      </div>
    );
  }

  /* ---------- Edit mode ---------- */
  if (editing) {
    return (
      <div className="pf-page">
        <main className="pf-sheet">
          <div className="eyebrow">{profile ? 'Edit profile' : 'Create your profile'}</div>
          <h1 className="pf-title">Tell us about your company</h1>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>
            Visitors and organizers will see this information.
          </p>

          <form className="card pf-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="companyName">Company name</label>
                <input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <label htmlFor="companyLogo">Logo link (optional)</label>
            <input id="companyLogo" name="companyLogo" value={form.companyLogo} onChange={handleChange} placeholder="https://" />

            <label htmlFor="companyDescription">About your company</label>
            <textarea id="companyDescription" name="companyDescription" rows="3" value={form.companyDescription} onChange={handleChange} required />

            <label htmlFor="productsServices">Products or services (separate with commas)</label>
            <input id="productsServices" name="productsServices" value={form.productsServices} onChange={handleChange} placeholder="Web apps, Mobile apps, UI design" required />

            <label htmlFor="website">Website (optional)</label>
            <input id="website" name="website" value={form.website} onChange={handleChange} placeholder="https://" />

            <div className="form-grid">
              <div>
                <label htmlFor="contactPerson">Contact person</label>
                <input id="contactPerson" name="contactPerson" value={form.contactPerson} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="contactEmail">Contact email</label>
                <input id="contactEmail" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="contactPhone">Contact phone</label>
                <input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="address">Address (optional)</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} />
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="actions">
              {profile ? (
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              ) : (
                <span></span>
              )}
              <button className="btn btn-red" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  /* ---------- View mode ---------- */
  const products = cleanList(profile.productsServices);

  return (
    <div className="pf-page">
      <main className="pf-sheet">
        {saved && <p className="success" style={{ marginTop: 0 }}>Profile saved.</p>}
        {error && <p className="error">{error}</p>}

        <div className="eyebrow">Exhibitor profile</div>

        <div className="pf-cols">
          <aside className="pf-side">
            <div className="mono">
              {profile.companyLogo ? (
                <img src={profile.companyLogo} alt={profile.companyName + ' logo'} />
              ) : (
                profile.companyName.charAt(0).toUpperCase()
              )}
            </div>
            <h1>{profile.companyName}</h1>
            <span className="pf-cat">{profile.category}</span>
            <button className="btn btn-ghost" onClick={startEdit}>Edit profile</button>
          </aside>

          <div>
            <section className="pf-sec">
              <h2>About</h2>
              <p className="pf-about">{profile.companyDescription}</p>
            </section>

            <section className="pf-sec">
              <h2>Products and services</h2>
              <ul className="pf-items">
                {products.map((p, i) => (
                  <li key={p + i}>
                    <i>{String(i + 1).padStart(2, '0')}</i>
                    {p}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pf-sec">
              <h2>Contact</h2>
              <dl className="pf-rows">
                <div><dt>Contact person</dt><dd>{profile.contactPerson}</dd></div>
                <div><dt>Email</dt><dd>{profile.contactEmail}</dd></div>
                <div><dt>Phone</dt><dd>{profile.contactPhone}</dd></div>
                {profile.website && (
                  <div><dt>Website</dt><dd>{profile.website}</dd></div>
                )}
                {profile.address && (
                  <div><dt>Address</dt><dd>{profile.address}</dd></div>
                )}
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}