import { useEffect, useState } from 'react';
import api from '../../api/api';
import FloorPlan from '../../components/FloorPlan.jsx';


export default function Booths() {
  const [expos, setExpos] = useState([]);
  const [expoId, setExpoId] = useState('');
  const [booths, setBooths] = useState([]);
  const [codes, setCodes] = useState('');
  const [size, setSize] = useState('medium');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.get('/expos').then((res) => {
      setExpos(res.data);
      if (res.data.length > 0) setExpoId(res.data[0]._id);
    });
  }, []);

  function loadBooths() {
    if (!expoId) return;
    api.get('/admin/booths?expo=' + expoId).then((res) => setBooths(res.data));
  }

  useEffect(() => {
    loadBooths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expoId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setOk('');
    try {
      const res = await api.post('/admin/booths', { expo: expoId, codes, size });
      let text = res.data.created + ' booth(s) added.';
      if (res.data.skipped.length > 0) text += ' Already existed: ' + res.data.skipped.join(', ');
      setOk(text);
      setCodes('');
      loadBooths();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add booths');
    }
  }

  async function handleDelete(b) {
    setError('');
    setOk('');
    try {
      await api.delete('/admin/booths/' + b._id);
      loadBooths();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <>
      <h2>Booths</h2>

      <div className="toolbar">
        <div>
          <label style={{ marginTop: 0 }}>Expo</label>
          <select value={expoId} onChange={(e) => setExpoId(e.target.value)}>
            {expos.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}
          </select>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleAdd}>
        <h3>Add booths</h3>
        <div className="form-grid">
          <div>
            <label>Booth codes (comma separated)</label>
            <input value={codes} onChange={(e) => setCodes(e.target.value)} placeholder="A1, A2, A3, B1" required />
          </div>
          <div>
            <label>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        {ok && <p className="success">{ok}</p>}
        <button className="btn btn-red" type="submit" style={{ marginTop: 16 }} disabled={!expoId}>Add booths</button>
      </form>

           <FloorPlan booths={booths} mode="admin" onDelete={handleDelete} />
    </>
  );
}
