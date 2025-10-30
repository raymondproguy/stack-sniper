import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authMethods, getFirebaseAuth } from '../utils/firebase';
import '../styles/main.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authMethods.signInWithEmail(email, password);
      } else {
        await authMethods.signUpWithEmail(email, password);
      }
      
      // Store token
      const user = getFirebaseAuth().currentUser;
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('firebase_token', token);
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
      }
      
      navigate('/loading');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');

    try {
      let result;
      if (provider === 'google') {
        result = await authMethods.signInWithGoogle();
      } else {
        result = await authMethods.signInWithGithub();
      }
      
      const user = result.user;
      const token = await user.getIdToken();
      localStorage.setItem('firebase_token', token);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));
      
      navigate('/loading');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gradient-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px',
        background: 'var(--bg-primary)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px var(--shadow-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Welcome to StackSniper</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to start debugging smarter</p>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className="btn"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            style={{ 
              background: 'var(--bg-primary)',
              border: '2px solid var(--border-color)',
              color: 'var(--text-primary)',
              justifyContent: 'center'
            }}
          >
            <i className="fab fa-google"></i>
            Continue with Google
          </button>
          
          <button 
            className="btn"
            onClick={() => handleOAuth('github')}
            disabled={loading}
            style={{ 
              background: 'var(--bg-primary)',
              border: '2px solid var(--border-color)',
              color: 'var(--text-primary)',
              justifyContent: 'center'
            }}
          >
            <i className="fab fa-github"></i>
            Continue with GitHub
          </button>
        </div>

        <div style={{ 
          textAlign: 'center', 
          margin: '1.5rem 0', 
          color: 'var(--text-secondary)',
          position: 'relative'
        }}>
          <span style={{ background: 'var(--bg-primary)', padding: '0 1rem' }}>or continue with email</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleAuth}>
          {error && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid var(--danger-color)',
              color: 'var(--danger-color)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem', 
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
