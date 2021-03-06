import React from 'react';
import PropTypes from 'prop-types';

import NewStuffArticle from 'Components/new-stuff/new-stuff-article';
import NewStuffPrompt from 'Components/new-stuff/new-stuff-prompt';
import NewStuffPup from 'Components/new-stuff/new-stuff-pup';
import CheckboxButton from 'Components/buttons/checkbox-button';
import { useTracker } from '../segment-analytics';
import PopoverContainer from '../pop-overs/popover-container';
import useUserPref from '../includes/user-prefs';
import { useCurrentUser } from '../../state/current-user';

import newStuffLog from '../../curated/new-stuff-log';

const latestId = Math.max(...newStuffLog.map(({ id }) => id));

const NewStuffOverlay = ({ setShowNewStuff, showNewStuff, newStuff }) => (
  <dialog className="pop-over overlay new-stuff-overlay" open>
    <section className="pop-over-info">
      <div className="new-stuff-avatar"><NewStuffPup /></div>
      <div className="overlay-title">New Stuff</div>
      <div>
        <CheckboxButton value={showNewStuff} onChange={setShowNewStuff}>Keep showing me these</CheckboxButton>
      </div>
    </section>
    <section className="pop-over-actions">
      {newStuff.map(({ id, ...props }) => <NewStuffArticle key={id} {...props} />)}
    </section>
  </dialog>
);
NewStuffOverlay.propTypes = {
  setShowNewStuff: PropTypes.func.isRequired,
  showNewStuff: PropTypes.bool.isRequired,
  newStuff: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      link: PropTypes.string,
    }).isRequired,
  ).isRequired,
};

const NewStuff = ({ children, isSignedIn, showNewStuff, setShowNewStuff, newStuffReadId, setNewStuffReadId }) => {
  const [log, setLog] = React.useState(newStuffLog);
  const track = useTracker('Pupdate');

  const renderOuter = ({ visible, setVisible }) => {
    const pupVisible = isSignedIn && showNewStuff && newStuffReadId < latestId;

    const show = () => {
      track();
      setVisible(true);
      const unreadStuff = newStuffLog.filter(({ id }) => id > newStuffReadId);
      setLog(unreadStuff.length ? unreadStuff : newStuffLog);
      setNewStuffReadId(latestId);
    };

    return (
      <>
        {children(show)}
        {pupVisible && <NewStuffPrompt onClick={show} />}
        {visible && <div className="overlay-background" role="presentation" />}
      </>
    );
  };

  return (
    <PopoverContainer outer={renderOuter}>
      {({ visible }) => (visible ? <NewStuffOverlay showNewStuff={showNewStuff} setShowNewStuff={setShowNewStuff} newStuff={log} /> : null)}
    </PopoverContainer>
  );
};
NewStuff.propTypes = {
  children: PropTypes.func.isRequired,
  isSignedIn: PropTypes.bool.isRequired,
  showNewStuff: PropTypes.bool.isRequired,
  newStuffReadId: PropTypes.number.isRequired,
  setNewStuffReadId: PropTypes.func.isRequired,
};

const NewStuffContainer = ({ children }) => {
  const { currentUser } = useCurrentUser();
  const [showNewStuff, setShowNewStuff] = useUserPref('showNewStuff', true);
  const [newStuffReadId, setNewStuffReadId] = useUserPref('newStuffReadId', 0);
  const isSignedIn = !!currentUser && !!currentUser.login;

  return (
    <NewStuff
      {...{
        isSignedIn,
        showNewStuff,
        newStuffReadId,
        setShowNewStuff,
        setNewStuffReadId,
      }}
    >
      {children}
    </NewStuff>
  );
};
NewStuffContainer.propTypes = {
  children: PropTypes.func.isRequired,
};

export default NewStuffContainer;
