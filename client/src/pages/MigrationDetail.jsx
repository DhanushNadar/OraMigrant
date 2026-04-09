import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ReactDiffViewer from 'react-diff-viewer-continued';
import WarningCard from '../components/WarningCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MigrationDetail() {
  const { slug } = useParams();
  const [migration, setMigration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await api.get(`/history/${slug}`);
        if (data.success) {
          setMigration(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Migration not found');
      }
      setLoading(false);
    };
    fetchDoc();
  }, [slug]);

  const handleCopy = () => {
    if (migration?.convertedSql) {
      navigator.clipboard.writeText(migration.convertedSql);
      toast.success("Copied!");
    }
  };

  const handleDownload = () => {
    if (migration?.convertedSql) {
      const blob = new Blob([migration.convertedSql], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oracle_migration_${migration.slug || 'export'}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) return <LoadingSpinner message="Loading migration..." />;
  if (error) return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3>{error}</h3>
      <Link to="/history" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Go Back</Link>
    </div>
  );

  const errors = migration.warnings?.filter(w => w.level === 'error') || [];
  const warnings = migration.warnings?.filter(w => w.level !== 'error') || [];
  const sortedWarnings = [...errors, ...warnings];

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* TOP BAR */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/history" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '500' }}>&larr; Back to History</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopy} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Copy Oracle SQL</button>
          <button onClick={handleDownload} className="btn-primary">Download .sql</button>
        </div>
      </div>

      {/* SECTION 1 - Meta info bar */}
      <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>Source: {migration.sourceDb}</div>
        <div style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>To: Oracle SQL</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{migration.createdAt ? new Date(migration.createdAt).toLocaleString() : 'Just now'}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', marginLeft: 'auto' }}>ID: {migration.slug}</div>
      </div>

      {/* SECTION 2 - Side by side SQL view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Original ({migration.sourceDb})</h3>
          <pre style={{ background: '#1e1e1e', color: 'white', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', margin: 0 }}>
            {migration.originalSql}
          </pre>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Converted Oracle SQL</h3>
          <pre style={{ background: '#1e1e1e', color: 'white', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', margin: 0, borderLeft: '3px solid #22c55e' }}>
            {migration.convertedSql}
          </pre>
        </div>
      </div>

      {/* SECTION 3 - Warnings */}
      <div style={{ marginBottom: '2rem' }}>
        {sortedWarnings.length > 0 ? (
          <>
            <h3 style={{ marginBottom: '1rem' }}>{sortedWarnings.length} issues detected during conversion</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sortedWarnings.map((w, i) => <WarningCard key={i} warning={w} />)}
            </div>
          </>
        ) : (
          <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center' }}>
             <span style={{ marginRight: '8px', fontSize: '1.2rem' }}>✅</span> No compatibility issues detected
          </div>
        )}
      </div>

      {/* SECTION 4 - Notes */}
      {migration.notes?.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Migration Notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {migration.notes.map((note, idx) => (
              <div key={idx} style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', border: '1px solid #e5e7eb', display: 'flex' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--primary)' }}>{idx + 1}.</span> {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
