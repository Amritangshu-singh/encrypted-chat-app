import React, { useState } from 'react';
import { generateKeyPair, storePrivateKey } from '../utils/encryption';
import { registerUser, loginUser } from '../utils/api';

function Register({ setIsAuthenticated, setCurrentUser }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [contactType, setContactType] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { publicKey, secretKey } = generateKeyPair();

      const payload = {
        username: form.username.trim(),
        password: form.password,
        publicKey,
        ...(contactType === 'email'
          ? { email: form.email.trim() }
          : { phone: form.phone.trim() }),
      };

      const { data } = await registerUser(payload);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      storePrivateKey(data.user.id, secretKey);

      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        password: form.password,
        ...(contactType === 'email'
          ? { email: form.email.trim() }
          : { phone: form.phone.trim() }),
      };

      const { data } = await loginUser(payload);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 SecureChat</h1>
        <p className="subtitle">End-to-end encrypted messaging</p>

        {error && <div className="error-msg">{error}</div>}

        {mode === 'register' ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="tab-row">
              <button
                type="button"
                className={`tab-btn ${contactType === 'email' ? 'active' : ''}`}
                onClick={() => setContactType('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`tab-btn ${contactType === 'phone' ? 'active' : ''}`}
                onClick={() => setContactType('phone')}
              >
                Phone
              </button>
            </div>

            {contactType === 'email' ? (
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="tab-row">
              <button
                type="button"
                className={`tab-btn ${contactType === 'email' ? 'active' : ''}`}
                onClick={() => setContactType('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`tab-btn ${contactType === 'phone' ? 'active' : ''}`}
                onClick={() => setContactType('phone')}
              >
                Phone
              </button>
            </div>

            {contactType === 'email' ? (
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register');
            setError('');
          }}
        >
          {mode === 'register'
            ? 'Already have an account? Sign in'
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default Register;
