// FILE: src/auth/AuthContext.jsx
// ✅ COMPLETE FIXED VERSION - Exports what App.jsx expects

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Return safe defaults if no context (prevents crash)
  if (!context) {
    return {
      user: null,
      userProfile: null,
      loading: true,
      isLoggedIn: false,
      logout: () => {},
      login: () => {},
      signup: () => {}
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Load user profile
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signup = async (email, password, username) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email,
        username,
        name: username,
        createdAt: new Date().toISOString(),
        isPremium: false,
        isOrgAdmin: false,
        organizationId: null,
        pet: {
          type: 'teddy',
          name: 'Teddy',
          mood: 'happy',
          level: 1,
          experience: 0
        },
        stats: {
          postsCreated: 0,
          journalEntries: 0,
          supportGiven: 0,
          daysActive: 0
        },
        preferences: {
          theme: 'kawaii',
          language: 'en',
          notifications: true
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Export what App.jsx expects!
  const value = {
    user,              // Firebase user object
    userProfile,       // Firestore user data
    loading,           // Still loading auth state
    isLoggedIn: !!user, // Boolean for easy check
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
