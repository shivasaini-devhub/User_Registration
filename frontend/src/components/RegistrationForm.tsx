'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { UserListModal } from './UserListModal';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function RegistrationForm() {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate Password Strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return '#ef4444'; // Red
    if (score === 2) return '#f59e0b'; // Amber
    if (score === 3) return '#6366f1'; // Indigo
    return '#10b981'; // Green
  };

  const getStrengthLabel = (score: number) => {
    if (!password) return '';
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle NestJS validation array errors or thrown exceptions
        if (Array.isArray(data.message)) {
          setServerError(data.message.join(', '));
        } else {
          setServerError(data.message || 'Registration failed. Please check details.');
        }
        return;
      }

      // Success
      setRegisteredUser(data.user);
    } catch (err: any) {
      setServerError('Unable to reach backend server. Make sure NestJS is running on port 5000.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setServerError(null);
    setRegisteredUser(null);
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        {registeredUser ? (
          /* SUCCESS VIEW */
          <div className="success-card">
            <div className="success-icon-wrap">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="card-title">Registration Successful!</h2>
            <p className="card-subtitle">
              Your account has been created and saved to the PostgreSQL database via Prisma ORM.
            </p>

            <div className="user-badge-box">
              <div className="user-badge-row">
                <span className="user-badge-label">Full Name</span>
                <span className="user-badge-val">{registeredUser.name}</span>
              </div>
              <div className="user-badge-row">
                <span className="user-badge-label">Email Address</span>
                <span className="user-badge-val">{registeredUser.email}</span>
              </div>
              <div className="user-badge-row">
                <span className="user-badge-label">User ID (UUID)</span>
                <span className="user-badge-val" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {registeredUser.id}
                </span>
              </div>
            </div>

            <button className="submit-btn" onClick={() => setIsModalOpen(true)}>
              <Database size={18} />
              View Database Records
            </button>

            <button className="secondary-btn" onClick={handleReset}>
              Register Another Account
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <>
            <div className="card-header">
              <div className="brand-badge">
                <ShieldCheck size={14} />
                Next.js + NestJS + Prisma
              </div>
              <h1 className="card-title">Create Account</h1>
              <p className="card-subtitle">
                Enter your information below to create your account.
              </p>
            </div>

            {serverError && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                <div>{serverError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                  />
                  <User className="input-icon" size={18} />
                </div>
                {errors.name && (
                  <div className="error-msg">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                  />
                  <Mail className="input-icon" size={18} />
                </div>
                {errors.email && (
                  <div className="error-msg">
                    <AlertCircle size={14} />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="password">Password</label>
                  {password && (
                    <span className="strength-text" style={{ color: getStrengthColor(strength) }}>
                      {getStrengthLabel(strength)}
                    </span>
                  )}
                </div>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'has-error' : ''}`}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                  />
                  <Lock className="input-icon" size={18} />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="strength-bar-container">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="strength-segment"
                        style={{
                          backgroundColor: step <= strength ? getStrengthColor(strength) : undefined,
                        }}
                      />
                    ))}
                  </div>
                )}

                {errors.password && (
                  <div className="error-msg">
                    <AlertCircle size={14} />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                  />
                  <Lock className="input-icon" size={18} />
                </div>
                {errors.confirmPassword && (
                  <div className="error-msg">
                    <AlertCircle size={14} />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    Register Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="footer-text">
              Want to see active database records?{' '}
              <span className="footer-link" onClick={() => setIsModalOpen(true)}>
                View Registered Users
              </span>
            </div>
          </>
        )}
      </div>

      <UserListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
