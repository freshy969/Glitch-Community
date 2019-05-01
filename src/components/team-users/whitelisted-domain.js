import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import TooltipContainer from 'Components/tooltips/tooltip-container';
import Button from 'Components/buttons/button';
import Emoji from 'Components/images/emoji';
import WhitelistedDomainIcon from 'Components/whitelisted-domain';
import PopoverContainer from '../../presenters/pop-overs/popover-container';

import styles from './styles.styl';

const WhitelistedDomain = ({ domain, setDomain }) => {
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

export default WhitelistedDomain;
