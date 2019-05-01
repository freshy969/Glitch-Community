import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Image from 'Components/images/image';
import styles from './styles.styl';

const WhitelistedDomainIcon = ({ domain }) => {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    setSrc(`https://favicon-fetcher.glitch.me/img/${domain}`);
  }, [domain]);
  if (src) {
    return <Image className={styles.whitelistedDomainIcon} alt={domain} src={src} onError={() => setSrc(null)} />;
  }
  return (
    <div className={styles.whitelistedDomainLabel} aria-label={domain}>
      {domain[0].toUpperCase()}
    </div>
  );
};

// Whitelisted domain icon


export const WhitelistEmailDomain = ({ domain, onClick }) => (
  <button onClick={onClick} className="button-unstyled result">
    <WhitelistedDomainIcon domain={domain} />
    <div>Allow anyone with an @{domain} email to join</div>
  </button>
);

WhitelistEmailDomain.propTypes = {
  domain: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};