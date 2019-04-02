import React from 'react';
import PropTypes from 'prop-types';

import Button from 'Components/buttons/button';
import { TrackClick } from '../analytics';
import TeamsList from '../teams-list';

// Image Buttons

export const ImageButtons = ({ name, uploadImage, clearImage }) => (
  <div className="upload-image-buttons">
    {!!uploadImage && (
      <TrackClick name={`Upload ${name}`}>
        <Button size="small" type="tertiary" onClick={uploadImage}>
          Upload {name}
        </Button>
      </TrackClick>
    )}
    {!!clearImage && (
      <TrackClick name={`Clear ${name}`}>
        <Button size="small" type="tertiary" onClick={clearImage}>
          Clear {name}
        </Button>
      </TrackClick>
    )}
  </div>
);
ImageButtons.propTypes = {
  name: PropTypes.string.isRequired,
  uploadImage: PropTypes.func,
  clearImage: PropTypes.func,
};
ImageButtons.defaultProps = {
  uploadImage: null,
  clearImage: null,
};

// Project Info Container

export const ProjectInfoContainer = ({ style, children, buttons }) => (
  <>
    <div className="avatar-container">
      <div className="user-avatar" style={style} />
      {buttons}
    </div>
    <div className="profile-information">{children}</div>
  </>
);
ProjectInfoContainer.propTypes = {
  style: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  buttons: PropTypes.element,
};
ProjectInfoContainer.defaultProps = {
  buttons: null,
};

// Info Container (generic)

export const InfoContainer = ({ children }) => <div className="profile-info">{children}</div>;
InfoContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

// Cover Container

export const CoverContainer = ({ buttons, children, className, ...props }) => (
  <div className={`cover-container ${className}`} {...props}>
    {children}
    {buttons}
  </div>
);
CoverContainer.propTypes = {
  buttons: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
CoverContainer.defaultProps = {
  className: '',
  buttons: null,
};

// Profile Container

export class ProfileContainer extends React.PureComponent {
  render() {
    const { avatarStyle, avatarButtons, coverStyle, coverButtons, children, teams } = this.props;
    return (
      <CoverContainer style={coverStyle} buttons={coverButtons}>
        <InfoContainer>
          <div className="avatar-container">
            <div className="user-avatar" style={avatarStyle} />
            {avatarButtons}
          </div>
          <div className="profile-information">{children}</div>
        </InfoContainer>
        {!!teams && !!teams.length && (
          <div className="teams-information">
            <TeamsList teams={teams} />
          </div>
        )}
      </CoverContainer>
    );
  }
}
