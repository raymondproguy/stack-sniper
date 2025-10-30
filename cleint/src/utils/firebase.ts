import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

// Load config from public directory
let auth: ReturnType<typeof getAuth> | null = null;

export const initializeFirebase = async (): Promise<void> => {
  try {
    const response = await fetch('/firebase-config.json');
    const firebaseConfig = await response.json();
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
};

export const getFirebaseAuth = () => {
  if (!auth) throw new Error('Firebase not initialized');
  return auth;
};

export const authMethods = {
  signInWithEmail: (email: string, password: string) => {
    const auth = getFirebaseAuth();
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  signUpWithEmail: (email: string, password: string) => {
    const auth = getFirebaseAuth();
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  signInWithGoogle: () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  
  signInWithGithub: () => {
    const auth = getFirebaseAuth();
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  },
  
  signOut: () => {
    const auth = getFirebaseAuth();
    return signOut(auth);
  },
  
  resetPassword: (email: string) => {
    const auth = getFirebaseAuth();
    return sendPasswordResetEmail(auth, email);
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return auth.onAuthStateChanged(callback);
};
