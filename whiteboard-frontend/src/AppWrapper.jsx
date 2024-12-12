import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import App from './App';
import Login from './Login';

const AppWrapper = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return user ? <App /> : <Login />;
};

export default AppWrapper;
