import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import FloorPlan from '../components/FloorPlan';

export default function ChooseBooth() {
  const { expoId } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    return api.get('/exhibitor/booths/expo/' + expoId)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load booths.'));
  }

  useEffect(() => {
    load();
  }, [expoId]);

  async function reserve() {
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/exhibitor/booths/' + selected._id + '/reserve');
      setDone(res.data.message + ': ' + selected.code);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setSelected(null);
    } finally {
      setSaving(false);
      load();
    }
  }

  if (!data) {
    return (
      <div className="pf-page">
        <main className="pf-sheet">
          {error ? <p className="error">{error}</p> : <p style={{ color: 'var(--muted)' }}>Loading...</p>}
        </main>
      </div>
    );
  }

  const { registration, booths } = data;
  const mine = registration
    ? booths.find((b) => b.assignedTo && String(b.assignedTo._id) === String(registration._id))
    : null;

  let body;

  if (!registration) {
    body = (
      <div className="card" style={{ padding: 28 }}>
        <h3>Apply first</h3>
        <p style={{ color: 'var(--muted)' }}>You have not applied for this expo yet.</p>
        <Link to={'/expos/' + expoId + '/apply'} className="btn btn-red">Apply as exhibitor</Link>
      </div>
    );
  } else if (registration.status !== 'approved') {
    body = (
      <div className="card" style={{ padding: 28 }}>
        <h3>Booth selection is locked</h3>
        <p style={{ color: 'var(--muted)' }}>
          Your application is <span className={'badge badge-' + registration.status}>{registration.status}</span>.
          Booth selection unlocks once the organizer approves it.
        </p>
        <Link to="/my-applications" className="btn btn-ghost">Back to my applications</Link>
      </div>
    );
  } else if (mine) {
    body = (
      <>
        <div className="card" style={{ padding: 24 }}>
          <span className="pf-cat">Your booth</span>
          <h2 style={{ margin: '6px 0 0' }}>
            {mine.code} <small style={{ color: 'var(--muted)', fontSize: '1rem' }}>({mine.size})</small>
          </h2>
        </div>
        <FloorPlan booths={booths} mode="view" />
      </>
    );
  } else {
    body = (
      <>
        {done && <p className="success">{done}</p>}
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          Tap a free booth on the plan, then confirm.
        </p>

        <FloorPlan
          booths={booths}
          mode="select"
          selectedId={selected?._id}
          onSelect={(b) => setSelected(b)}
        />

        <div className="pick-bar">
          <span>
            {selected ? 'Selected: ' + selected.code + ' (' + selected.size + ')' : 'No booth selected'}
          </span>
          <button className="btn btn-red" disabled={!selected || saving} onClick={reserve}>
            {saving ? 'Reserving...' : 'Reserve booth'}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="pf-page">
      <main className="pf-sheet">
        <div className="eyebrow">Booth selection</div>
        <h1 className="pf-title">Choose your booth</h1>
        {error && <p className="error">{error}</p>}
        {body}
      </main>
    </div>
  );
}