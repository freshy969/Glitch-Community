import React from 'react';
import PropTypes from 'prop-types';

import { orderBy } from 'lodash';
import { getAvatarUrl as getTeamAvatarUrl } from '../../models/team';
import { getAvatarThumbnailUrl as getUserAvatarUrl } from '../../models/user';
import { TrackClick } from '../analytics';
import { TeamLink, UserLink } from '../includes/link';
import PopoverContainer from './popover-container';
import { NestedPopover } from './popover-nested';
import CreateTeamPop from './create-team-pop';
import TooltipContainer from '../../components/tooltips/tooltip-container';
import PopoverButton from './popover-button';
import Button from '../../components/buttons/button'

// Create Team button

const CreateTeamButton = ({ showCreateTeam, userIsAnon }) => {
  if (userIsAnon) {
    return (
      <>
        <p className="description action-description">
          <Button onClick={showCreateTeam} type="link">
            Sign in
          </Button>{' '}
          to create teams
        </p>
        <PopoverButton text="Create Team" emoji="herb" onClick={showCreateTeam} disabled />
      </>
    );
  }
  return (
    <TrackClick name="Create Team clicked">
      <PopoverButton text="Create Team" emoji="herb" onClick={showCreateTeam} />
    </TrackClick>
  );
};

CreateTeamButton.propTypes = {
  showCreateTeam: PropTypes.func.isRequired,
  userIsAnon: PropTypes.bool.isRequired,
};

// Team List

const TeamList = ({ teams, showCreateTeam, userIsAnon }) => {
  const orderedTeams = orderBy(teams, (team) => team.name.toLowerCase());

  return (
    <section className="pop-over-actions">
      {orderedTeams.map((team) => (
        <div className="button-wrap" key={team.id}>
          <TeamLink key={team.id} team={team} className="button button-small has-emoji button-tertiary">
            {team.name}
            &nbsp;
            <img className="emoji avatar" src={getTeamAvatarUrl({ ...team, size: 'small' })} alt="" width="16px" height="16px" />
          </TeamLink>
        </div>
      ))}
      <CreateTeamButton showCreateTeam={showCreateTeam} userIsAnon={userIsAnon} />
    </section>
  );
};

TeamList.propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      hasAvatarImage: PropTypes.bool.isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  showCreateTeam: PropTypes.func.isRequired,
  userIsAnon: PropTypes.bool.isRequired,
};

// User Options 🧕

const UserOptionsPop = ({ togglePopover, showCreateTeam, user, signOut, showNewStuffOverlay }) => {
  const clickNewStuff = (event) => {
    togglePopover();
    showNewStuffOverlay();
    event.stopPropagation();
  };

  const clickSignout = () => {
    if (!user.login) {
      if (
        // eslint-disable-next-line
        !window.confirm(`You won't be able to sign back in under this same anonymous account.
Are you sure you want to sign out?`)
      ) {
        return;
      }
    }
    togglePopover();
    /* global analytics */
    analytics.track('Logout');
    analytics.reset();
    signOut();
  };

  const userName = user.name || 'Anonymous';
  const userAvatarStyle = { backgroundColor: user.color };

  return (
    <dialog className="pop-over user-options-pop">
      <UserLink user={user} className="user-info">
        <section className="pop-over-actions user-info">
          <img className="avatar" src={getUserAvatarUrl(user)} alt="Your avatar" style={userAvatarStyle} />
          <div className="info-container">
            <p className="name" title={userName}>
              {userName}
            </p>
            {user.login && (
              <p className="user-login" title={user.login}>
                @{user.login}
              </p>
            )}
          </div>
        </section>
      </UserLink>
      <TeamList teams={user.teams} showCreateTeam={showCreateTeam} userIsAnon={!user.login} />
      <section className="pop-over-info">
        <PopoverButton text="New Stuff" emoji="dog-face" onClick={clickNewStuff} />
        <PopoverButton text="Support" emoji="ambulance" link="https://support.glitch.com" />
        <PopoverButton text="Sign Out" emoji="balloon" onClick={clickSignout} />
      </section>
    </dialog>
  );
};

UserOptionsPop.propTypes = {
  togglePopover: PropTypes.func.isRequired,
  showCreateTeam: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  signOut: PropTypes.func.isRequired,
  showNewStuffOverlay: PropTypes.func.isRequired,
};

class CheckForCreateTeamHash extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: window.location.hash === '#create-team' };
  }

  componentDidMount() {
    this.setState({ active: false });
  }

  render() {
    return this.props.children(this.state.active);
  }
}

// Header button and init pop

export default function UserOptionsAndCreateTeamPopContainer(props) {
  const avatarUrl = getUserAvatarUrl(props.user);
  const avatarStyle = { backgroundColor: props.user.color };
  return (
    <CheckForCreateTeamHash>
      {(createTeamOpen) => (
        <PopoverContainer startOpen={createTeamOpen}>
          {({ togglePopover, visible }) => {
            const userOptionsButton = (
              <Button type="dropDown" disabled={!props.user.id} onClick={togglePopover}>
                <img className="user-avatar" src={avatarUrl} style={avatarStyle} width="30px" height="30px" alt="User options" />
                <span className="down-arrow icon" />
              {/*<button className="user" onClick={togglePopover} disabled={!props.user.id} type="button">
                <img className="user-avatar" src={avatarUrl} style={avatarStyle} width="30px" height="30px" alt="User options" />
                <span className="down-arrow icon" />
              </button>*/}
              </Button>
            );

            return (
              <TooltipContainer
                className="button user-options-pop-button"
                target={userOptionsButton}
                tooltip="User options"
                id="user-options-tooltip"
                type="action"
                align={['right']}
              >
                {visible && (
                  <NestedPopover alternateContent={() => <CreateTeamPop {...props} />} startAlternateVisible={createTeamOpen}>
                    {(showCreateTeam) => <UserOptionsPop {...props} {...{ togglePopover, showCreateTeam }} />}
                  </NestedPopover>
                )}
              </TooltipContainer>
            );
          }}
        </PopoverContainer>
      )}
    </CheckForCreateTeamHash>
  );
}

UserOptionsAndCreateTeamPopContainer.propTypes = {
  user: PropTypes.shape({
    avatarThumbnailUrl: PropTypes.string,
    color: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    login: PropTypes.string,
    teams: PropTypes.array.isRequired,
  }).isRequired,
  api: PropTypes.func.isRequired,
};
