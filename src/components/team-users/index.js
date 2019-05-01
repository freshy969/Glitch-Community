import React from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';

import TooltipContainer from 'Components/tooltips/tooltip-container';
import { UserAvatar } from 'Components/images/avatar';
import { UserLink } from 'Components/link';
import { getDisplayName } from 'Models/user';
import { currentUserIsOnTeam, currentUserIsTeamAdmin, currentUserCanJoinTeam } from 'Models/team';
import { useTracker } from '../../presenters/segment-analytics';
import { WhitelistedDomainIcon } from '../../presenters/includes/team-elements';
import AddTeamUserPop from '../../presenters/pop-overs/add-team-user-pop';
import PopoverWithButton from '../../presenters/pop-overs/popover-with-button';
import PopoverContainer from '../../presenters/pop-overs/popover-container';
import TeamUserInfoPop from '../../presenters/pop-overs/team-user-info-pop';
import { useCurrentUser } from '../../state/current-user';
import { createAPIHook } from '../../state/api';
import { captureException } from '../../utils/sentry';
import styles from './styles.styl';

// Team Users list (in profile container)

const adminStatusDisplay = (adminIds, user) => {
  if (adminIds.includes(user.id)) {
    return ' (admin)';
  }
  return '';
};

const TeamUsers = ({ users, team, removeUserFromTeam, updateUserPermissions }) => (
  <ul className="users">
    {users.map((user) => (
      <li key={user.id}>
        <PopoverWithButton
          buttonClass="user button-unstyled tooltip-container-button"
          buttonText={<UserAvatar user={user} suffix={adminStatusDisplay(team.adminIds, user)} withinButton />}
        >
          {({ togglePopover }) => (
            <TeamUserInfoPop
              team={team}
              removeUserFromTeam={removeUserFromTeam}
              user={user}
              updateUserPermissions={updateUserPermissions}
              togglePopover={togglePopover}
            />
          )}
        </PopoverWithButton>
      </li>
    ))}
  </ul>
);

TeamUsers.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
    }),
  ).isRequired,
  removeUserFromTeam: PropTypes.func.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
};

// Whitelisted domain icon

const WhitelistedDomain = ({ domain, setDomain }) => {
  const tooltip = `Anyone with an @${domain} email can join`;
  return (
    <PopoverContainer>
      {({ visible, setVisible }) => (
        <details onToggle={(evt) => setVisible(evt.target.open)} open={visible} className="popover-container whitelisted-domain-container">
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
                <button className="button button-small button-tertiary button-on-secondary-background has-emoji" onClick={() => setDomain(null)}>
                  Remove {domain} <span className="emoji bomb" />
                </button>
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

// Add Team User

const AddTeamUser = ({ inviteEmail, inviteUser, setWhitelistedDomain, members, invitedMembers, whitelistedDomain }) => {
  const [invitee, setInvitee] = React.useState('');
  const [newlyInvited, setNewlyInvited] = React.useState([]);

  const alreadyInvitedAndNewInvited = uniqBy(invitedMembers.concat(newlyInvited), (user) => user.id);
  const track = useTracker('Add to Team clicked');

  const onSetWhitelistedDomain = async (togglePopover, domain) => {
    togglePopover();
    await setWhitelistedDomain(domain);
  };

  const onInviteUser = async (togglePopover, user) => {
    togglePopover();
    setInvitee(getDisplayName(user));
    setNewlyInvited((invited) => [...invited, user]);
    try {
      await inviteUser(user);
    } catch (error) {
      setInvitee('');
      setNewlyInvited((invited) => invited.filter((u) => u.id !== user.id));
    }
  };

  const onInviteEmail = async (togglePopover, email) => {
    togglePopover();
    setInvitee(email);
    try {
      await inviteEmail(email);
    } catch (error) {
      setInvitee('');
    }
  };

  const removeNotifyInvited = () => {
    setInvitee('');
  };

  return (
    <span className="add-user-container">
      <ul className="users">
        {alreadyInvitedAndNewInvited.map((user) => (
          <li key={user.id}>
            <UserLink user={user} className="user">
              <UserAvatar user={user} />
            </UserLink>
          </li>
        ))}
      </ul>
      <span className="add-user-wrap">
        <PopoverWithButton buttonClass="button-small button-tertiary add-user" buttonText="Add" onOpen={track}>
          {({ togglePopover }) => (
            <AddTeamUserPop
              members={members}
              whitelistedDomain={whitelistedDomain}
              setWhitelistedDomain={setWhitelistedDomain ? (domain) => onSetWhitelistedDomain(togglePopover, domain) : null}
              inviteUser={inviteUser ? (user) => onInviteUser(togglePopover, user) : null}
              inviteEmail={inviteEmail ? (email) => onInviteEmail(togglePopover, email) : null}
            />
          )}
        </PopoverWithButton>
        {!!invitee && (
          <div className="notification notifySuccess inline-notification" onAnimationEnd={removeNotifyInvited}>
            Invited {invitee}
          </div>
        )}
      </span>
    </span>
  );
};
AddTeamUser.propTypes = {
  inviteEmail: PropTypes.func,
  inviteUser: PropTypes.func,
  setWhitelistedDomain: PropTypes.func,
  invitedMembers: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  whitelistedDomain: PropTypes.string,
};
AddTeamUser.defaultProps = {
  setWhitelistedDomain: null,
  inviteUser: null,
  inviteEmail: null,
  whitelistedDomain: null,
};

// Join Team

export const JoinTeam = ({ onClick }) => (
  <button className="button button-small button-cta join-team-button" onClick={onClick}>
    Join Team
  </button>
);

const useInvitees = createAPIHook(async (api, team, currentUser) => {
  if (!currentUserIsOnTeam({ currentUser, team })) return [];
  try {
    const data = await Promise.all(team.tokens.map(({ userId }) => api.get(`users/${userId}`)));
    return data.map((user) => user.data).filter((user) => !!user);
  } catch (error) {
    if (error && error.response && error.response.status !== 404) {
      captureException(error);
    }
    return [];
  }
});

const TeamUsersContainer = ({ team, updateWhitelistedDomain, inviteEmail, inviteUser, joinTeam, removeUserFromTeam, updateUserPermissions }) => {
  const { currentUser } = useCurrentUser();
  const { value: invitees } = useInvitees(team, currentUser);
  const isAdmin = currentUserIsTeamAdmin({ currentUser, team });
  return (
    <div className={styles.container}>
      <TeamUsers team={team} users={team.users} removeUserFromTeam={removeUserFromTeam} updateUserPermissions={updateUserPermissions} />
      {!!team.whitelistedDomain && <WhitelistedDomain domain={team.whitelistedDomain} setDomain={isAdmin ? updateWhitelistedDomain : null} />}
      {currentUserIsOnTeam({ currentUser, team }) && (
        <AddTeamUser
          inviteEmail={inviteEmail}
          inviteUser={inviteUser}
          setWhitelistedDomain={isAdmin ? updateWhitelistedDomain : null}
          members={team.users.map(({ id }) => id)}
          invitedMembers={invitees || []}
          whitelistedDomain={team.whitelistedDomain}
        />
      )}
      {currentUserCanJoinTeam({ currentUser, team }) && <JoinTeam onClick={joinTeam} />}
    </div>
  );
};
export default TeamUsersContainer;
