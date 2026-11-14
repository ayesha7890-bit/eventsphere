import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const categories = ['Software', 'Hardware', 'Food', 'Education', 'Fashion', 'Automotive', 'Healthcare', 'Other'];

const emptyForm = {
  companyName: '', companyLogo: '', companyDescription: '', category: '',
  productsServices: '', website: '', contactPerson: '', contactEmail: '',
  contactPhone: '', address: ''
};

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
      productsServices: (profile.productsServices || []).join(', '),
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
    setSaving(true);
    try {
      const res = await api.put('/profile/me', {
        ...form,
        productsServices: form.productsServices.split(',').map((s) => s.trim()).filter(Boolean)
      });
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
    return <div className="profile-page"><p style={{ color: 'var(--muted)' }}>Loading...</p></div>;
  }

  /* ---------- Edit mode ---------- */
  if (editing) {
    return (
      <div className="profile-wrap">
        <div className="profile-page">
          <div className="gradient-bar"></div>
          <h1 className="apply-title">{profile ? 'Edit profile' : 'Create your profile'}</h1>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>
            Visitors and organizers will see this information about your company.
          </p>

          <form className="card profile-form" onSubmit={handleSubmit}>
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

            <label htmlFor="productsServices">Products or services (commas)</label>
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
        </div>
      </div>
    );
  }

  /* ---------- View mode ---------- */
  return (
    <div className="profile-wrap">
      <div className="profile-page">
        {saved && <p className="success" style={{ marginTop: 0 }}>Profile saved.</p>}
        {error && <p className="error">{error}</p>}

        <div className="card profile-card">
          <div className="profile-cover"></div>
          <div className="profile-body">
            <div className="profile-top">
              <div className="avatar">
                {profile.companyLogo ? (
                  <img src={profile.companyLogo} alt={profile.companyName + ' logo'} />
                ) : (
                  profile.companyName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="kind">{profile.category}</span>
                <h2>{profile.companyName}</h2>
              </div>
              <div className="profile-actions">
                <button className="btn" onClick={startEdit}>Edit profile</button>
              </div>
            </div>

            <h4 className="p-label">About</h4>
            <p className="p-text">{profile.companyDescription}</p>

            <h4 className="p-label">Products and services</h4>
            <div className="chips">
              {(profile.productsServices || []).map((p) => (
                <span className="chip" key={p}>{p}</span>
              ))}
            </div>

            <h4 className="p-label">Contact</h4>
            <dl className="detail-grid">
              <div><dt>Contact person</dt><dd>{profile.contactPerson}</dd></div>
              <div><dt>Email</dt><dd>{profile.contactEmail}</dd></div>
              <div><dt>Phone</dt><dd>{profile.contactPhone}</dd></div>
              {profile.website && <div><dt>Website</dt><dd>{profile.website}</dd></div>}
              {profile.address && <div><dt>Address</dt><dd>{profile.address}</dd></div>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}