import React from 'react';

function UserStatus({ online }) {
  return <span className={`status-dot ${online ? 'online' : 'offline'}`} title={online ? 'Online' : 'Offline'} />;
}

export default UserStatus;
