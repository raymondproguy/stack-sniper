import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, getFirebaseAuth } from './utils/firebase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Loading from './pages/Loading';
import Dashboard from './pages/Dashboard';
import './styles/main.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
        setFirebaseInitialized(true);
        
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading || !firebaseInitialized) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--gradient-bg)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
          <p>Initializing StackSniper...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/app" /> : <Auth />} 
          />
          <Route 
            path="/loading" 
            element={user ? <Loading /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/app" 
            element={user ? <Dashboard /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
