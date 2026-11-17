import { useEffect, useState } from 'react';
import api from '../../api/api';

const empty = {
  title: '', description: '', theme: '', location: '',
  startDate: '', endDate: '', status: 'upcoming'
};

function fmt(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageExpos() {
  const [expos, setExpos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  function load() {
    api.get('/expos')
      .then((res) => setExpos(res.data))
      .catch(() => setError('Expos load nahi hue'));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk('');
    try {
      if (editId) {
        await api.put('/admin/expos/' + editId, form);
        setOk('Expo updated');
      } else {
        await api.post('/expos', form);
        setOk('Expo created');
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function startEdit(expo) {
    setEditId(expo._id);
    setOk('');
    setError('');
    setForm({
      title: expo.title,
      description: expo.description,
      theme: expo.theme || '',
      location: expo.location,
      startDate: expo.startDate.slice(0, 10), // date input ko YYYY-MM-DD chahiye
      endDate: expo.endDate.slice(0, 10),
      status: expo.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(empty);
  }

  async function handleDelete(expo) {
    if (!window.confirm('Delete "' + expo.title + '"? Its applications, booths and sessions will be deleted too.')) return;
    try {
      await api.delete('/admin/expos/' + expo._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <>
      <h2>Expos</h2>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>{editId ? 'Edit expo' : 'Create expo'}</h3>
        <div className="form-grid">
          <div>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label>Theme</label>
            <input name="theme" value={form.theme} onChange={handleChange} placeholder="Technology" />
          </div>
          <div>
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label>Start date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label>End date</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
        <label>Description</label>
        <textarea name="description" rows="3" value={form.description} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}
        {ok && <p className="success">{ok}</p>}

        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn-red" type="submit">{editId ? 'Save changes' : 'Create expo'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <div className="tablebox">
        <table>
          <thead>
            <tr><th>Title</th><th>Dates</th><th>Location</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {expos.length === 0 && (
              <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>No expos yet</td></tr>
            )}
            {expos.map((e) => (
              <tr key={e._id}>
                <td>{e.title}<div className="sub-line">{e.theme}</div></td>
                <td>{fmt(e.startDate)} to {fmt(e.endDate)}</td>
                <td>{e.location}</td>
                <td><span className={'badge badge-' + e.status}>{e.status}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(e)}>Edit</button>
                    <button className="btn btn-red btn-sm" onClick={() => handleDelete(e)}>Delete</button>
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
