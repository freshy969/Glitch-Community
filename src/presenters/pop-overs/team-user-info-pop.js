import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getAvatarThumbnailUrl, getDisplayName } from 'Models/user';
import TooltipContainer from 'Components/tooltips/tooltip-container';
import { UserLink } from 'Components/link';
import Thanks from 'Components/thanks';

import { useTrackedFunc } from '../segment-analytics';
import { NestedPopover } from './popover-nested';
import { useNotifications } from '../notifications';
import TeamUserRemovePop from './team-user-remove-pop';
import { useAPI } from '../../state/api';

const MEMBER_ACCESS_LEVEL = 20;
const ADMIN_ACCESS_LEVEL = 30;

// Remove from Team 👋

const RemoveFromTeam = ({ onClick }) => {
  const onClickTracked = useTrackedFunc(onClick, 'Remove from Team clicked');
  return (
    <section className="pop-over-actions danger-zone">
      <button className="button-small has-emoji button-tertiary button-on-secondary-background" onClick={onClickTracked}>
        Remove from Team <span className="emoji wave" role="img" aria-label="" />
      </button>
    </section>
  );
};

// Admin Actions Section ⏫⏬

const AdminActions = ({ user, userIsTeamAdmin, updateUserPermissions }) => {
  const onClickRemoveAdmin = useTrackedFunc(() => updateUserPermissions(user.id, MEMBER_ACCESS_LEVEL), 'Remove Admin Status clicked');
  const onClickMakeAdmin = useTrackedFunc(() => updateUserPermissions(user.id, ADMIN_ACCESS_LEVEL), 'Make an Admin clicked');
  return (
    <section className="pop-over-actions admin-actions">
      <p className="action-description">Admins can update team info, billing, and remove users</p>
      {userIsTeamAdmin ? (
        <button className="button-small button-tertiary has-emoji" onClick={onClickRemoveAdmin}>
          Remove Admin Status <span className="emoji fast-down" />
        </button>
      ) : (
        <button className="button-small button-tertiary has-emoji" onClick={onClickMakeAdmin}>
          Make an Admin <span className="emoji fast-up" />
        </button>
      )}
    </section>
  );
};

AdminActions.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  userIsTeamAdmin: PropTypes.bool.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
};

// Thanks 💖

const ThanksCount = ({ count }) => (
  <section className="pop-over-info">
    <Thanks count={count} />
  </section>
);

// Team User Info 😍

const TeamUserInfo = ({
  currentUser,
  currentUserIsTeamAdmin,
  showRemove,
  userTeamProjects,
  removeUser,
  user,
  userIsTheOnlyMember,
  userIsTheOnlyAdmin,
  userIsTeamAdmin,
  updateUserPermissions,
}) => {
  const userAvatarStyle = { backgroundColor: user.color };

  const currentUserHasRemovePriveleges = currentUserIsTeamAdmin || (currentUser && currentUser.id === user.id);
  const canRemoveUser = !(userIsTheOnlyMember || userIsTheOnlyAdmin);
  const canCurrentUserRemoveUser = canRemoveUser && currentUserHasRemovePriveleges;

  // if user is a member of no projects, skip the confirm step
  function onRemove() {
    if (userTeamProjects.status === 'ready' && userTeamProjects.data.length === 0) {
      removeUser();
    } else {
      showRemove();
    }
  }

  return (
    <dialog className="pop-over team-user-info-pop">
      <section className="pop-over-info user-info">
        <UserLink user={user}>
          <img className="avatar" src={getAvatarThumbnailUrl(user)} alt={user.login} style={userAvatarStyle} />
        </UserLink>
        <div className="info-container">
          <p className="name" title={user.name}>
            {user.name || 'Anonymous'}
          </p>
          {user.login && (
            <p className="user-login" title={user.login}>
              @{user.login}
            </p>
          )}
          {userIsTeamAdmin && (
            <div className="status-badge">
              <TooltipContainer
                id={`admin-badge-tooltip-${user.login}`}
                type="info"
                target={<span className="status admin">Team Admin</span>}
                tooltip="Can edit team info and billing"
              />
            </div>
          )}
        </div>
      </section>
      {user.thanksCount > 0 && <ThanksCount count={user.thanksCount} />}
      {currentUserIsTeamAdmin && !userIsTheOnlyAdmin && (
        <AdminActions
          user={user}
          userIsTeamAdmin={userIsTeamAdmin}
          updateUserPermissions={updateUserPermissions}
        />
      )}
      {canCurrentUserRemoveUser && <RemoveFromTeam onClick={onRemove} />}
    </dialog>
  );
};

// Team User Remove 💣

// Team User Info or Remove
// uses removeTeamUserVisible state to toggle between showing user info and remove views

const TeamUserInfoAndRemovePop = (props) => {
  const api = useAPI();
  const { createNotification } = useNotifications();
  const [userTeamProjects, setUserTeamProjects] = useState({ status: 'loading', data: null });
  useEffect(() => {
    api.get(`users/${props.user.id}`).then(({ data }) => {
      setUserTeamProjects({
        status: 'ready',
        data: data.projects.filter((userProj) => props.team.projects.some((teamProj) => teamProj.id === userProj.id)),
      });
    });
  }, [props.user.id]);

  function removeUser(selectedProjects = []) {
    createNotification(`${getDisplayName(props.user)} removed from Team`);
    props.removeUserFromTeam(props.user.id, Array.from(selectedProjects));
  }

  const propsWithUserRemoval = { ...props, removeUser, userTeamProjects };

  return (
    <NestedPopover alternateContent={() => <TeamUserRemovePop {...propsWithUserRemoval} />}>
      {(showRemove) => <TeamUserInfo {...propsWithUserRemoval} showRemove={showRemove} />}
    </NestedPopover>
  );
};

TeamUserInfoAndRemovePop.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    login: PropTypes.string,
    thanksCount: PropTypes.number.isRequired,
    color: PropTypes.string,
  }).isRequired,
  currentUserIsOnTeam: PropTypes.bool.isRequired,
  currentUserIsTeamAdmin: PropTypes.bool.isRequired,
  removeUserFromTeam: PropTypes.func.isRequired,
  userIsTeamAdmin: PropTypes.bool.isRequired,
  userIsTheOnlyMember: PropTypes.bool.isRequired,
  teamId: PropTypes.number.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
  team: PropTypes.shape({
    projects: PropTypes.array.isRequired,
  }).isRequired,
};

export default TeamUserInfoAndRemovePop;
