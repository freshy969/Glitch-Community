import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import classnames from 'classnames';

import TooltipContainer from 'Components/tooltips/tooltip-container';
import { UserAvatar } from 'Components/images/avatar';
import { UserLink } from 'Components/link';
import Button from 'Components/buttons/button';
import Emoji from 'Components/images/emoji';
import WhitelistedDomainIcon from 'Components/whitelisted-domain';
import { getDisplayName } from 'Models/user';
import { currentUserIsOnTeam, currentUserIsTeamAdmin, currentUserCanJoinTeam } from 'Models/team';
import { useTracker } from '../../presenters/segment-analytics';
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

const TeamUser = ({ user, team, removeUserFromTeam, updateUserPermissions }) => (
  <PopoverWithButton
    buttonClass="button-unstyled tooltip-container-button"
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
);

TeamUser.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  removeUserFromTeam: PropTypes.func.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
};

const UserToAdd = ({ user }) => (
  <UserLink user={user}>
    <UserAvatar user={user} />
  </UserLink>
);

// Whitelisted Domains

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


// Add Team User

const AddTeamUser = ({ inviteEmail, inviteUser, setWhitelistedDomain, members, invitedMembers, whitelistedDomain }) => {
  const [invitee, setInvitee] = useState('');
  const [newlyInvited, setNewlyInvited] = useState([]);

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

  // add-user-container add-user-wrap

  return (
    <>
      {alreadyInvitedAndNewInvited.map((user) => (
        <li key={user.id}>
          <UserToAdd users={user} />
        </li>
      ))}
      <li className={styles.addUserWrap}>
        <PopoverWithButton buttonClass="button-small button-tertiary" buttonText="Add" onOpen={track}>
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
      </li>
    </>
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
  const isOnTeam = currentUserIsOnTeam({ currentUser, team });
  const canJoinTeam = currentUserCanJoinTeam({ currentUser, team });
  return (
    <ul className={styles.container}>
      {team.users.map((user, i) => (
        <li key={user.id} className={classnames(styles.teamUserWrap, i === team.users.length - 1 && styles.lastTeamUser)}>
          <TeamUser team={team} user={user} removeUserFromTeam={removeUserFromTeam} updateUserPermissions={updateUserPermissions} />
        </li>
      ))}

      {!!team.whitelistedDomain && (
        <li>
          <WhitelistedDomain domain={team.whitelistedDomain} setDomain={isAdmin ? updateWhitelistedDomain : null} />
        </li>
      )}
      {isOnTeam && (
        <AddTeamUser
          inviteEmail={inviteEmail}
          inviteUser={inviteUser}
          setWhitelistedDomain={isAdmin ? updateWhitelistedDomain : null}
          members={team.users.map(({ id }) => id)}
          invitedMembers={invitees || []}
          whitelistedDomain={team.whitelistedDomain}
        />
      )}
      {canJoinTeam && (
        <li>
          <Button size="small" type="cta" onClick={joinTeam}>
            Join Team
          </Button>
        </li>
      )}
    </ul>
  );
};
export default TeamUsersContainer;
