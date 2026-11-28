import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function Feedback() {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api.get('/admin/feedback')
      .then((res) => setList(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Feedback load nahi hua'));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(item) {
    try {
      await api.patch('/admin/feedback/' + item._id + '/resolve');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  return (
    <>
      <h2>Feedback and support</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>Suggestions and issues sent by users.</p>
      {error && <p className="error">{error}</p>}

      <div className="tablebox">
        <table>
          <thead>
            <tr><th>From</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>No feedback yet</td></tr>
            )}
            {list.map((f) => (
              <tr key={f._id}>
                <td>{f.name}<div className="sub-line">{f.email}</div></td>
                <td style={{ minWidth: 220 }}>{f.message}</td>
                <td>{new Date(f.createdAt).toLocaleDateString('en-GB')}</td>
                <td>
                  <span className={'tag ' + (f.resolved ? 's-approved' : 's-pending')}>
                    {f.resolved ? 'resolved' : 'open'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(f)}>
                    {f.resolved ? 'Reopen' : 'Mark resolved'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
