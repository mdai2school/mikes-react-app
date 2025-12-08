import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userState, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Save user's selected state
  const saveUserState = async (state) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        selectedState: state,
        email: currentUser.email,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      setUserState(state);
      // Also save to localStorage as backup (with uid key)
      if (currentUser?.uid) {
        localStorage.setItem(`userState_${currentUser.uid}`, state);
      }
      localStorage.setItem('userState', state);
    } catch (error) {
      console.error('Error saving user state:', error);
    }
  };

  // Load user's selected state
  const loadUserState = async (uid) => {
    try {
      // Try localStorage first for faster loading
      const savedState = localStorage.getItem(`userState_${uid}`);
      if (savedState) {
        setUserState(savedState);
      }
      
      // Then try loading from Firestore (async, doesn't block)
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.selectedState) {
          setUserState(data.selectedState);
          localStorage.setItem(`userState_${uid}`, data.selectedState);
          return data.selectedState;
        }
      }
      
      // Fallback to localStorage without uid key
      if (!savedState) {
        const fallbackState = localStorage.getItem('userState');
        if (fallbackState) {
          setUserState(fallbackState);
          return fallbackState;
        }
      }
    } catch (error) {
      console.error('Error loading user state:', error);
      // Fallback to localStorage
      const savedState = localStorage.getItem(`userState_${uid}`) || localStorage.getItem('userState');
      if (savedState) {
        setUserState(savedState);
        return savedState;
      }
    }
    return null;
  };

  // Monitor auth state changes
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      setCurrentUser(user);
      
      if (user) {
        // Set loading false immediately so user sees the app
        setLoading(false);
        // Load user state asynchronously (non-blocking)
        loadUserState(user.uid).catch(console.error);
      } else {
        setUserState(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userState,
    signup,
    login,
    loginWithGoogle,
    logout,
    saveUserState,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

