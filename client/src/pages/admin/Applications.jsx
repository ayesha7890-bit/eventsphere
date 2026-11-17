import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function Applications() {
  const [list, setList] = useState([]);
  const [booths, setBooths] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  function load() {
    const url = '/admin/registrations' + (filter ? '?status=' + filter : '');
    api.get(url)
      .then((res) => setList(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Applications load nahi hui'));
    api.get('/admin/booths').then((res) => setBooths(res.data)).catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(reg, status) {
    setError('');
    let reason;
    if (status === 'rejected') {
      reason = window.prompt('Reason for rejection?');
      if (!reason) return;
    }
    try {
      await api.patch('/admin/registrations/' + reg._id + '/status', { status, rejectionReason: reason });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  async function assignBooth(reg, boothId) {
    setError('');
    try {
      await api.patch('/admin/registrations/' + reg._id + '/booth', { boothId: boothId || null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Booth assign failed');
    }
  }

  // Is exhibitor ke expo ke wohi booth jo khali hon (ya isi ko mile hon)
  function boothOptions(reg) {
    return booths.filter(
      (b) => b.expo === reg.expo?._id && (!b.assignedTo || b.assignedTo._id === reg._id)
    );
  }

  return (
    <>
      <h2>Exhibitor applications</h2>

      <div className="toolbar">
        <div>
          <label style={{ marginTop: 0 }}>Filter by status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="tablebox">
        <table>
          <thead>
            <tr><th>Company</th><th>Expo</th><th>Category</th><th>Status</th><th>Booth</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>No applications found</td></tr>
            )}
            {list.map((r) => (
              <tr key={r._id}>
                <td>
                  {r.companyName}
                  <div className="sub-line">{r.contactPerson}, {r.contactEmail}</div>
                </td>
                <td>{r.expo?.title}</td>
                <td>{r.category}</td>
                <td>
                  <span className={'tag s-' + r.status}>{r.status}</span>
                  {r.status === 'rejected' && r.rejectionReason && (
                    <div className="sub-line">{r.rejectionReason}</div>
                  )}
                </td>
                <td>
                  {r.status === 'approved' ? (
                    <select
                      value={r.assignedBooth?._id || ''}
                      onChange={(e) => assignBooth(r, e.target.value)}
                      style={{ padding: '6px 10px', minWidth: 120 }}
                    >
                      <option value="">Not assigned</option>
                      {boothOptions(r).map((b) => (
                        <option key={b._id} value={b._id}>{b.code} ({b.size})</option>
                      ))}
                    </select>
                  ) : (
                    <span className="sub-line">Approve first</span>
                  )}
                </td>
                <td>
                  <div className="actions">
                    {r.status !== 'approved' && (
                      <button className="btn btn-sm" onClick={() => setStatus(r, 'approved')}>Approve</button>
                    )}
                    {r.status !== 'rejected' && (
                      <button className="btn btn-red btn-sm" onClick={() => setStatus(r, 'rejected')}>Reject</button>
                    )}
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
