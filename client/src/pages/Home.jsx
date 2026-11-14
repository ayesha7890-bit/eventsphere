import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Expos from './Expos';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="gradient-bar"></div>

          <h1>The expo, run beautifully.</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 480, fontSize: '1.05rem' }}>
            Organizers, exhibitors and visitors in one place. Reserve a booth,
            shape the schedule and meet the right people.
          </p>

          {user ? (
            <p style={{ color: 'var(--pur-l)', marginTop: 24 }}>Welcome, {user.name}.</p>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to="/register" className="btn btn-red">Get started</Link>
              <Link to="/login" className="btn">Login</Link>
            </div>
          )}
        </div>
      </header>

      <Expos />
    </>
  );
}