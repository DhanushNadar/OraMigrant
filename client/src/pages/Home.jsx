import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Convert MySQL & PostgreSQL schemas to Oracle SQL instantly
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        AI-powered migration with automatic warning detection
      </p>
      
      <Link to="/convert" className="btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem', borderRadius: '8px', display: 'inline-block', marginBottom: '4rem' }}>
        Start Converting
      </Link>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>AI-Powered</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Groq AI converts your schema accurately and adapts dynamically to complex definitions.</p>
        </div>
        <div style={{ flex: '1 1 300px', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Warning Detection</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Catches 15+ incompatibilities automatically before processing complex sequences.</p>
        </div>
        <div style={{ flex: '1 1 300px', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Instant Download</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Get your .sql file in seconds directly saved onto your machine mapped safely.</p>
        </div>
      </div>
    </div>
  );
}
