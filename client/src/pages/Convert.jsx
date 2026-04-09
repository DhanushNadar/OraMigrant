import { useState } from 'react';
import { Link } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import ReactDiffViewer from 'react-diff-viewer-continued';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WarningCard from '../components/WarningCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Convert() {
  const { isAuthenticated } = useAuth();
  const [inputSql, setInputSql] = useState('');
  const [sourceDb, setSourceDb] = useState('mysql');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/convert', { sql: inputSql, sourceDb });
      if (data.success) {
        setResult(data);
        toast.success("Conversion complete!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleToggleDb = (db) => {
    setSourceDb(db);
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (result?.convertedSql) {
      navigator.clipboard.writeText(result.convertedSql);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (result?.convertedSql) {
      const blob = new Blob([result.convertedSql], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oracle_migration_${result.slug || 'export'}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* SECTION A: Input Area */}
      <div style={{ marginBottom: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div>
            <button onClick={() => handleToggleDb('mysql')} style={{ padding: '0.5rem 1rem', background: sourceDb === 'mysql' ? '#534AB7' : '#e5e7eb', color: sourceDb === 'mysql' ? 'white' : 'black', borderRadius: '4px 0 0 4px', border: 'none', cursor: 'pointer' }}>MySQL</button>
            <button onClick={() => handleToggleDb('postgresql')} style={{ padding: '0.5rem 1rem', background: sourceDb === 'postgresql' ? '#534AB7' : '#e5e7eb', color: sourceDb === 'postgresql' ? 'white' : 'black', borderRadius: '0 4px 4px 0', border: 'none', cursor: 'pointer' }}>PostgreSQL</button>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleConvert} 
            disabled={loading || !inputSql.trim()}
          >
            {loading ? 'Converting...' : 'Convert to Oracle'}
          </button>
        </div>
        
        {loading ? (
           <LoadingSpinner />
        ) : (
          <div>
            <CodeMirror
              value={inputSql}
              height="280px"
              extensions={[sql()]}
              onChange={(val) => setInputSql(val)}
              placeholder="Paste your MySQL or PostgreSQL schema here..."
              style={{ fontSize: '14px' }}
            />
            <div style={{ fontSize: '12px', textAlign: 'right', marginTop: '4px', color: inputSql.length > 8000 ? '#ef4444' : '#6b7280', padding: '0 8px', paddingBottom: '8px' }}>
              {inputSql.length} characters
            </div>
          </div>
        )}
      </div>

      {error && !loading && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderLeft: '4px solid #ef4444', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#b91c1c' }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: '#dc2626', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}>Try again</button>
        </div>
      )}

      {/* SECTION B: Results Area */}
      {result && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Conversion Result</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Copy Oracle SQL</button>
              <button onClick={handleDownload} className="btn-primary" style={{ border: 'none' }}>Download .sql</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', padding: '4px 10px', borderRadius: '99px', background: result.warnings?.length > 0 ? '#fef3c7' : '#dcfce7', color: result.warnings?.length > 0 ? '#b45309' : '#166534' }}>{result.warnings?.length || 0} warnings</span>
            <span style={{ fontWeight: 'bold', fontSize: '13px', padding: '4px 10px', borderRadius: '99px', background: result.warnings?.filter(w => w.level === 'error').length > 0 ? '#fee2e2' : '#dcfce7', color: result.warnings?.filter(w => w.level === 'error').length > 0 ? '#b91c1c' : '#166534' }}>{result.warnings?.filter(w => w.level === 'error').length || 0} errors</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{sourceDb} &rarr; Oracle</span>
            <Link to={`/migration/${result.slug}`} style={{ fontFamily: 'monospace', fontSize: '13px', marginLeft: 'auto', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', color: 'var(--primary)', textDecoration: 'none' }}>{result.slug}</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <h3 style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', margin: 0, fontSize: '16px' }}>Original ({sourceDb})</h3>
              <pre style={{ padding: '16px', margin: 0, background: '#1e1e1e', color: 'white', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto', borderRadius: '0' }}>
                {result.originalSql}
              </pre>
            </div>
            
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <h3 style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', margin: 0, fontSize: '16px' }}>Converted (Oracle SQL)</h3>
              <div style={{ overflowX: 'auto' }}>
                <ReactDiffViewer
                  oldValue={result.originalSql}
                  newValue={result.convertedSql}
                  splitView={false}
                  showDiffOnly={false}
                  useDarkTheme={false}
                />
              </div>
            </div>
          </div>

          {result.warnings?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>{result.warnings.length} warnings detected</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.warnings.map((w, i) => <WarningCard key={i} warning={w} />)}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
             <Link to={`/migration/${result.slug}`} style={{ fontSize: '15px', fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>View full migration details &rarr;</Link>
          </div>

          {result.notes?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', marginTop: 0 }}>Notes</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {result.notes.map((n, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{n}</li>)}
              </ul>
            </div>
          )}

          <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            {!isAuthenticated ? (
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Login to save this migration to your history.{' '}
                <span onClick={() => { document.querySelector('nav button').click(); window.scrollTo(0, 0); }} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
              </p>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Saved to your history. <Link to="/history" style={{ fontWeight: '500' }}>View History &rarr;</Link>
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
