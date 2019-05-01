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

export const WhitelistedDomain = ({ domain, setDomain }) => {
  const tooltip = `Anyone with an @${domain} email can join`;
  return (
    <PopoverContainer>
      {({ visible, setVisible }) => (
        <details
          onToggle={(evt) => setVisible(evt.target.open)}
          open={visible}
          className={classnames('popover-container', styles.whitelistedDomainContainer)}
        >
          <summary>
            <TooltipContainer
              id="whitelisted-domain-tooltip"
              type="action"
              tooltip={visible ? null : tooltip}
              target={
                <div>
                  <WhitelistedDomainIcon domain={domain} />
                </div>
              }
            />
          </summary>
          <dialog className="pop-over">
            <section className="pop-over-info">
              <p className="info-description">{tooltip}</p>
            </section>
            {!!setDomain && (
              <section className="pop-over-actions danger-zone">
                <Button type="dangerZone" onClick={() => setDomain(null)}>
                  Remove {domain} <Emoji name="bomb" />
                </Button>
              </section>
            )}
          </dialog>
        </details>
      )}
    </PopoverContainer>
  );
};

WhitelistedDomain.propTypes = {
  domain: PropTypes.string.isRequired,
  setDomain: PropTypes.func,
};

WhitelistedDomain.defaultProps = {
  setDomain: null,
};


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