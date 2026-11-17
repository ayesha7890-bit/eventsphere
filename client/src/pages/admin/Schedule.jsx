import { useEffect, useState } from 'react';
import api from '../../api/api';

const empty = { title: '', speaker: '', room: '', description: '', startTime: '', endTime: '' };

// ISO date ko datetime-local input ke format mein badalta hai
function toInput(iso) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export default function Schedule() {
  const [expos, setExpos] = useState([]);
  const [expoId, setExpoId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/expos').then((res) => {
      setExpos(res.data);
      if (res.data.length > 0) setExpoId(res.data[0]._id);
    });
  }, []);

  function loadSessions() {
    if (!expoId) return;
    api.get('/admin/sessions?expo=' + expoId).then((res) => setSessions(res.data));
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expoId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, expo: expoId };
      if (editId) await api.put('/admin/sessions/' + editId, body);
      else await api.post('/admin/sessions', body);
      setForm(empty);
      setEditId(null);
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save session');
    }
  }

  function startEdit(s) {
    setEditId(s._id);
    setForm({
      title: s.title,
      speaker: s.speaker || '',
      room: s.room,
      description: s.description || '',
      startTime: toInput(s.startTime),
      endTime: toInput(s.endTime)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(s) {
    if (!window.confirm('Delete session "' + s.title + '"?')) return;
    try {
      await api.delete('/admin/sessions/' + s._id);
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <>
      <h2>Schedule</h2>

      <div className="toolbar">
        <div>
          <label style={{ marginTop: 0 }}>Expo</label>
          <select value={expoId} onChange={(e) => setExpoId(e.target.value)}>
            {expos.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}
          </select>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>{editId ? 'Edit session' : 'Add session'}</h3>
        <div className="form-grid">
          <div>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label>Speaker</label>
            <input name="speaker" value={form.speaker} onChange={handleChange} />
          </div>
          <div>
            <label>Start</label>
            <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required />
          </div>
          <div>
            <label>End</label>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
          </div>
          <div>
            <label>Room / location</label>
            <input name="room" value={form.room} onChange={handleChange} required />
          </div>
          <div>
            <label>Topic / description</label>
            <input name="description" value={form.description} onChange={handleChange} />
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn-red" type="submit" disabled={!expoId}>{editId ? 'Save changes' : 'Add session'}</button>
          {editId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(empty); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="tablebox">
        <table>
          <thead>
            <tr><th>Time</th><th>Session</th><th>Speaker</th><th>Room</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>No sessions yet</td></tr>
            )}
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{fmt(s.startTime)}<div className="sub-line">to {fmt(s.endTime)}</div></td>
                <td>{s.title}<div className="sub-line">{s.description}</div></td>
                <td>{s.speaker}</td>
                <td>{s.room}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>Edit</button>
                    <button className="btn btn-red btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
