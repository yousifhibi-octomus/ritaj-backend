'use client';

import { useState } from 'react';
import styles from './LoginAdmin.module.css';

export default function LoginAdmin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('adminLoggedIn', 'true');
      setError('');
      onLoginSuccess();
    }else if (username === 'test' && password === 'testtest') {
      localStorage.setItem('testerLoggedIn', 'true');
      setError('');
      onLoginSuccess();
    }
    
    else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>Admin Login</h2>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter admin username"
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter password"
              required
            />
          </div>
          
          <button
            type="submit"
            className={styles.button}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}