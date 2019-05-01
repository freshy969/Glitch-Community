import React from 'react';
import TooltipContainer from 'Components/tooltips/tooltip-container';
import Image from 'Components/images/image';
import styles from './styles.styl';

const image = 'https://cdn.glitch.com/55f8497b-3334-43ca-851e-6c9780082244%2Fverified.svg?1501783108220';
const tooltip = 'Verified to be supportive, helpful people';

const VerifiedBadge = () => (
  <TooltipContainer id="verified-team-tooltip" type="info" tooltip={tooltip} target={<Image className={styles.verified} src={image} alt="✓" />} />
);

export default VerifiedBadge;
