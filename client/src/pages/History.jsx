import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/history');
        if (data.success) setHistory(data.migrations);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const handleDelete = async (slug) => {
    if (window.confirm("Delete this migration?")) {
      try {
        const { data } = await api.delete(`/history/${slug}`);
        if (data.success) {
          setHistory(prev => prev.filter(h => h.slug !== slug));
          toast.success("Migration deleted");
        }
      } catch (e) {
        toast.error("Failed to delete migration");
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Your Migration History</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No migrations yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Convert your first schema to get started</p>
          <Link to="/convert" className="btn-primary" style={{ display: 'inline-block' }}>Start Converting</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map(m => (
            <div key={m.slug} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', background: 'white', position: 'relative' }}>
              
              <button 
                onClick={() => handleDelete(m.slug)} 
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
              >
                Delete
              </button>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', fontSize: '0.9rem' }}>{m.sourceDb} → Oracle</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <pre style={{ background: 'var(--bg-dark)', color: 'white', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '12px', marginBottom: '1rem' }}>
                {m.preview}...
              </pre>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {m.warningCount > 0 ? (
                  <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' }}>{m.warningCount} warnings</span>
                ) : (
                  <span></span>
                )}
                <Link to={`/migration/${m.slug}`} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}>View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
