'use client';

import React, { useEffect, useState } from 'react';
import { X, UserCheck, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserListModal({ isOpen, onClose }: UserListModalProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/users`);
      if (!res.ok) {
        throw new Error('Failed to fetch user list from server');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to NestJS API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck style={{ color: '#818cf8' }} size={22} />
            <h2 className="modal-title">Registered Users Database</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {users.length} registered {users.length === 1 ? 'record' : 'records'} in PostgreSQL
          </span>
          <button 
            className="secondary-btn" 
            onClick={fetchUsers} 
            disabled={loading}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', marginTop: 0 }}
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error-color)', borderRadius: '10px', color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="users-list">
          {loading && users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              Loading database records...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No users registered yet. Submit the registration form to add your first user!
            </div>
          ) : (
            users.map((user) => {
              const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
              const formattedDate = new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={user.id} className="user-item">
                  <div className="user-avatar">{initial}</div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="user-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {formattedDate}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
