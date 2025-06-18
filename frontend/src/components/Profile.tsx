import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, isAuthenticated, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'email' | 'password' | 'myevents'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4000/users/profile',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateUserData(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4000/users/change-email',
        { newEmail: email, currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateUserData(response.data.user);
      setMessage('Email updated successfully!');
      setCurrentPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4000/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p className="profile-subtitle">Manage your account settings</p>
      </div>

      {/* Messages */}
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <nav className="profile-nav">
            <button
              className={`profile-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <span className="nav-icon">👤</span>
              Profile Info
            </button>
            <button
              className={`profile-nav-btn ${activeSection === 'email' ? 'active' : ''}`}
              onClick={() => setActiveSection('email')}
            >
              <span className="nav-icon">📧</span>
              Change Email
            </button>
            <button
              className={`profile-nav-btn ${activeSection === 'password' ? 'active' : ''}`}
              onClick={() => setActiveSection('password')}
            >
              <span className="nav-icon">🔐</span>
              Change Password
            </button>
            <button
              className={`profile-nav-btn ${activeSection === 'myevents' ? 'active' : ''}`}
              onClick={() => setActiveSection('myevents')}
            >
              <span className="nav-icon">📅</span>
              My Events
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="profile-content">

      {/* Profile Info Section */}
      {activeSection === 'profile' && (
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentEmail">Current Email</label>
              <input
                type="email"
                id="currentEmail"
                value={user.email}
                disabled
                className="disabled-input"
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Change Email Section */}
      {activeSection === 'email' && (
        <div className="profile-section">
          <h2>Change Email</h2>
          <form onSubmit={handleChangeEmail} className="profile-form">
            <div className="form-group">
              <label htmlFor="newEmail">New Email</label>
              <input
                type="email"
                id="newEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentPasswordEmail">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPasswordEmail"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={loading}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Section */}
      {activeSection === 'password' && (
        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPasswordChange">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPasswordChange"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={loading}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="newPasswordChange">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPasswordChange"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={loading}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPasswordChange">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPasswordChange"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={loading}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* My Events Section */}
      {activeSection === 'myevents' && (
        <div className="profile-section">
          <h2>My Events</h2>
          <div className="my-events-content">
            <p className="empty-state">You haven't created any events yet.</p>
            <p className="empty-state-subtitle">Your created events will appear here.</p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 