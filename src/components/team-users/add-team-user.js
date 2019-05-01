import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';

import { UserAvatar } from 'Components/images/avatar';
import { UserLink } from 'Components/link';
import { getDisplayName } from 'Models/user';
import { useTracker } from '../../presenters/segment-analytics';
import PopoverWithButton from '../../presenters/pop-overs/popover-with-button';
import AddTeamUserPop from '../../presenters/pop-overs/add-team-user-pop';
import styles from './styles.styl';

const UserToAdd = ({ user }) => (
  <UserLink user={user}>
    <UserAvatar user={user} />
  </UserLink>
);

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

export default AddTeamUser;
