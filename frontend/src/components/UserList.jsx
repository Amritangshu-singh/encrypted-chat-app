import React, { useState } from 'react';
import UserStatus from './UserStatus';

function UserList({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  onlineUsers,
  loading,
  onLogout,
}) {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name) => (name ? name[0].toUpperCase() : '?');

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div>
          <h2>💬 SecureChat</h2>
          <small style={{ color: '#8b949e', fontSize: '.75rem' }}>
            {currentUser.username}
          </small>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-list">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '1.5rem', color: '#8b949e', textAlign: 'center', fontSize: '.85rem' }}>
            No users found.
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.id}
              className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar">{getInitial(u.username)}</div>
              <div className="user-info">
                <div className="user-name">{u.username}</div>
                <div className="user-last-seen">
                  {onlineUsers[u.id] ? 'Online' : u.email || u.phone}
                </div>
              </div>
              <UserStatus online={!!onlineUsers[u.id]} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserList;
