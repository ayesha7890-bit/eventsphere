import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const categories = ['Software', 'Hardware', 'Food', 'Education', 'Fashion', 'Automotive', 'Healthcare', 'Other'];

const sizes = [
  { value: 'small', title: 'Small', text: 'Compact stall' },
  { value: 'medium', title: 'Medium', text: 'Standard stall' },
  { value: 'large', title: 'Large', text: 'Extra space' }
];

const stepNames = ['Company', 'Contact', 'Booth'];

export default function ExhibitorApply() {
  const { id } = useParams();
  const { user } = useAuth();
  const formRef = useRef(null);

  const [expo, setExpo] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '',
    companyDescription: '',
    category: '',
    productsServices: '',
    website: '',
    contactPerson: user.name,
    contactEmail: user.email,
    contactPhone: '',
    address: '',
    preferredBoothSize: 'medium',
    staffCount: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get('/expos/' + id)
      .then((res) => setExpo(res.data))
      .catch(() => setError('Expo not found'));
  }, [id]);
  useEffect(() => {
  api.get('/profile/me')
    .then((res) => {
      const p = res.data;
      if (!p) return;
      setForm((f) => ({
        ...f,
        companyName: p.companyName || '',
        companyDescription: p.companyDescription || '',
        category: p.category || '',
        productsServices: (p.productsServices || []).join(', '),
        website: p.website || '',
        contactPerson: p.contactPerson || f.contactPerson,
        contactEmail: p.contactEmail || f.contactEmail,
        contactPhone: p.contactPhone || '',
        address: p.address || ''
      }));
    })
    .catch(() => {});
}, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function productList() {
    return form.productsServices.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Sirf maujooda step ki zaroori fields check karta hai
  function currentStepValid() {
    const fields = formRef.current.querySelectorAll(
      '.apply-sec.on input, .apply-sec.on select, .apply-sec.on textarea'
    );
    for (const el of fields) {
      if (!el.reportValidity()) return false;
    }
    return true;
  }

  function next() {
    setError('');
    if (!currentStepValid()) return;
    if (step === 1 && productList().length === 0) {
      setError('Please add at least one product or service');
      return;
    }
    setStep(step + 1);
  }

  function back() {
    setError('');
    setStep(step - 1);
  }

  // Upar ke numbers par click
  function goTo(n) {
    setError('');
    if (n < step) {
      setStep(n);
      return;
    }
    if (n === step + 1) {
      next();
      return;
    }
    if (n > step + 1) {
      setError('Please complete the steps in order');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step < 3) {
      next();
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/registrations', {
        ...form,
        expo: id,
        productsServices: productList(),
        staffCount: form.staffCount ? Number(form.staffCount) : undefined
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="apply-wrap">
        <div className="apply-page">
          <div className="card apply-card" style={{ textAlign: 'center', padding: 36 }}>
            <div className="gradient-bar" style={{ margin: '0 auto 20px' }}></div>
            <h2>Application sent</h2>
            <p style={{ color: 'var(--muted)' }}>
              Your registration for {expo?.title} is now{' '}
              <span className="badge badge-ongoing">pending</span>.
              The organizer will review it.
            </p>
            <Link to="/" className="btn btn-red">Back to expos</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-wrap">
      <div className="apply-page">
        <h1 className="apply-title">Exhibitor registration</h1>
        <div className="expo-chip">
          {expo ? (
            <>
              <b>{expo.title}</b> <span>{expo.location}</span>
            </>
          ) : (
            'Loading expo...'
          )}
        </div>

        <form className="card apply-card" onSubmit={handleSubmit} ref={formRef} noValidate>
          <div className="progress">
            {stepNames.map((n, i) => (
              <button
                type="button"
                key={n}
                onClick={() => goTo(i + 1)}
                className={'pstep' + (step === i + 1 ? ' now' : '') + (step > i + 1 ? ' done' : '')}
              >
                <span className="step">{step > i + 1 ? '✓' : i + 1}</span>
                <small>{n}</small>
              </button>
            ))}
          </div>

          {/* Step 1: Company */}
          <section className={'apply-sec' + (step === 1 ? ' on' : '')}>
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

            <label htmlFor="companyDescription">About your company</label>
            <textarea id="companyDescription" name="companyDescription" rows="2" value={form.companyDescription} onChange={handleChange} required />

            <div className="form-grid">
              <div>
                <label htmlFor="productsServices">Products or services (commas)</label>
                <input id="productsServices" name="productsServices" value={form.productsServices} onChange={handleChange} placeholder="Web apps, Mobile apps" required />
              </div>
              <div>
                <label htmlFor="website">Website (optional)</label>
                <input id="website" name="website" value={form.website} onChange={handleChange} placeholder="https://" />
              </div>
            </div>
          </section>

          {/* Step 2: Contact */}
          <section className={'apply-sec' + (step === 2 ? ' on' : '')}>
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
                <label htmlFor="staffCount">Staff at the stall (optional)</label>
                <input id="staffCount" name="staffCount" type="number" min="1" value={form.staffCount} onChange={handleChange} />
              </div>
            </div>

            <label htmlFor="address">Address (optional)</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} />
          </section>

          {/* Step 3: Booth */}
          <section className={'apply-sec' + (step === 3 ? ' on' : '')}>
            <p style={{ color: 'var(--muted)', margin: '0 0 4px', fontSize: '.92rem' }}>
              Choose your preferred booth size. The organizer will confirm your final booth.
            </p>
            <div className="size-pick">
              {sizes.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  className="role-btn"
                  aria-pressed={form.preferredBoothSize === s.value}
                  onClick={() => setForm({ ...form, preferredBoothSize: s.value })}
                >
                  <b>{s.title}</b>
                  <small>{s.text}</small>
                </button>
              ))}
            </div>
          </section>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            {step > 1 ? (
              <button type="button" className="btn btn-ghost" onClick={back}>Back</button>
            ) : (
              <span></span>
            )}

            {step < 3 ? (
              <button type="button" className="btn btn-red" onClick={next}>Next</button>
            ) : (
              <button type="submit" className="btn btn-red" disabled={loading}>
                {loading ? 'Sending...' : 'Submit application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}