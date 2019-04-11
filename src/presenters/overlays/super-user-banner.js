import React from 'react';

import { useCurrentUser } from '../../state/current-user';
import useLocalStorage from '../../state/local-storage';
import { useAPI } from '../../state/api';

const SuperUserBanner = () => {
  const { currentUser, persistentToken } = useCurrentUser();
  const api = useAPI();
  const [showSupportBanner, setShowSupportBanner] = useLocalStorage('showSupportBanner', false);
  const isSupporter = currentUser && currentUser.projects && currentUser.projects.filter((p) => p.id === 'b9f7fbdd-ac07-45f9-84ea-d484533635ff').length > 0;

  if (isSupporter && persistentToken) {
    const superUser = currentUser.features && currentUser.features.find((feature) => feature.name === 'super_user');
    const expirationDate = superUser && new Date(superUser.expiresAt).toUTCString();
    const displayText = `SUPER USER MODE ${superUser ? `ENABLED UNTIL: ${expirationDate}` : 'DISABLED'} `;
    const toggleSuperUser = async () => {
      await api.post(`https://support-toggle.glitch.me/support/${superUser ? 'disable' : 'enable'}`);
      window.location.reload();
    };

    if (superUser || showSupportBanner) {
      return (
        <div style={{ backgroundColor: `${superUser ? 'red' : 'aliceblue'}`, padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          {displayText}
          <button onClick={toggleSuperUser}>Click to {superUser ? 'disable' : 'enable'}</button>
          {!superUser && <button onClick={() => setShowSupportBanner(false)}>Hide</button>}
        </div>
      );
    }
  }

  return null;
};

export default SuperUserBanner;
