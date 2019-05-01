import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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

WhitelistedDomainIcon.propTypes = {
  domain: PropTypes.string.isRequired,
};

export default WhitelistedDomainIcon;
