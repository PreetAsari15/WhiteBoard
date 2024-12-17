import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get Firebase ID Token
      const idToken = await user.getIdToken();

      // Send the ID token to the backend
      const response = await fetch('http://localhost:3000/firebase-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      navigate('/login'); // Navigate to canvas after login
      console.log('Custom JWT:', data.token); // Save this in localStorage or cookies
    } catch (error) {
      console.error('Signup Error:', error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get Firebase ID Token
      const idToken = await user.getIdToken();

      // Send the ID token to the backend
      const response = await fetch('http://localhost:3000/firebase-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      navigate('/canvas'); // Navigate to canvas after login
      console.log('Custom JWT:', data.token); // Save this in localStorage or cookies
    } catch (error) {
      console.error('Login Error:', error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/'); // Navigate to login after logout
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
