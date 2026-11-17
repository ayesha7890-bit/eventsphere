import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/reports')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Reports load nahi hue'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p style={{ color: 'var(--muted)' }}>Loading...</p>;

  const { totals, registrations, perExpo } = data;
  const stats = [
    ['Expos', totals.expos],
    ['Exhibitors', totals.exhibitors],
    ['Attendees', totals.attendees],
    ['Sessions', totals.sessions],
    ['Booths', totals.booths],
    ['Booths assigned', totals.assignedBooths]
  ];

  return (
    <>
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>Overview of the whole system.</p>

      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div className="card stat" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 36 }}>Applications by status</h3>
      <div className="actions">
        <span className="tag s-pending">Pending {registrations.pending}</span>
        <span className="tag s-approved">Approved {registrations.approved}</span>
        <span className="tag s-rejected">Rejected {registrations.rejected}</span>
      </div>

      <h3 style={{ marginTop: 36 }}>Applications per expo</h3>
      <div className="tablebox">
        <table>
          <thead>
            <tr><th>Expo</th><th>Total applications</th><th>Approved</th></tr>
          </thead>
          <tbody>
            {perExpo.length === 0 && (
              <tr><td colSpan="3" style={{ color: 'var(--muted)' }}>No applications yet</td></tr>
            )}
            {perExpo.map((r) => (
              <tr key={r.title}>
                <td>{r.title}</td><td>{r.total}</td><td>{r.approved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
