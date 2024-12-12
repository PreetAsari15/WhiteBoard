import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Handle userCredential if needed, e.g., set user in context or redirect
      return userCredential;
    } catch (error) {
      setError(error.message);  // Set the error message for display
      throw error;  // Propagate the error so the caller can handle it
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate email and password
    if (!email || !password) {
      setError('Email and password are required!');
      return;
    }

    try {
      await login(email, password);
      setError(''); // Clear error if login is successful
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
