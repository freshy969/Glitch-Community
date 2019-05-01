import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { UserAvatar } from 'Components/images/avatar';
import Button from 'Components/buttons/button';
import { userIsOnTeam, userIsTeamAdmin, userCanJoinTeam } from 'Models/team';

import PopoverWithButton from '../../presenters/pop-overs/popover-with-button';
import TeamUserInfoPop from '../../presenters/pop-overs/team-user-info-pop';
import { useCurrentUser } from '../../state/current-user';
import { createAPIHook } from '../../state/api';
import { captureException } from '../../utils/sentry';

import AddTeamUser from './add-team-user';
import WhitelistedDomain from './whitelisted-domain';
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


const useInvitees = createAPIHook(async (api, team, currentUser) => {
  if (!userIsOnTeam({ user: currentUser, team })) return [];
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
  const isAdmin = userIsTeamAdmin({ user: currentUser, team });
  const isOnTeam = userIsOnTeam({ user: currentUser, team });
  const canJoinTeam = userCanJoinTeam({ user: currentUser, team });
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
