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
      // Also save to localStorage as backup
      localStorage.setItem('userState', state);
    } catch (error) {
      console.error('Error saving user state:', error);
    }
  };

  // Load user's selected state
  const loadUserState = async (uid) => {
    try {
      // Try loading from Firestore first
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.selectedState) {
          setUserState(data.selectedState);
          localStorage.setItem('userState', data.selectedState);
          return data.selectedState;
        }
      }
      
      // Fallback to localStorage
      const savedState = localStorage.getItem('userState');
      if (savedState) {
        setUserState(savedState);
        return savedState;
      }
    } catch (error) {
      console.error('Error loading user state:', error);
      // Fallback to localStorage
      const savedState = localStorage.getItem('userState');
      if (savedState) {
        setUserState(savedState);
        return savedState;
      }
    }
    return null;
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserState(user.uid);
      } else {
        setUserState(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

