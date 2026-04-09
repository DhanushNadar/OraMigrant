import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isLogin ? login : register;
    const res = await action(email, password);
    if (res.success) {
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      setShowModal(false);
      setEmail('');
      setPassword('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <nav style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>MigrateSQL</Link>
          
          <div>
            {!isAuthenticated ? (
              <>
                <button onClick={() => { setIsLogin(true); setShowModal(true); }} style={{ padding: '0.5rem 1rem', background: 'transparent' }}>Login</button>
                <button onClick={() => { setIsLogin(false); setShowModal(true); }} className="btn-primary" style={{ marginLeft: '0.5rem' }}>Register</button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
                <Link to="/history" style={{ textDecoration: 'none' }}>History</Link>
                <button onClick={logout} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', background: 'transparent' }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input 
                type="password" 
                placeholder="Password" 
                required 
                minLength="6"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {isLogin ? 'Login' : 'Register'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', padding: '0.5rem' }}>Cancel</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--primary)' }}
               onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
