import React from 'react';
import PropTypes from 'prop-types';

import AddTeamProjectPop from '../pop-overs/add-team-project-pop';
import PopoverWithButton from 'src/components/popovers/popover-with-button';

const AddTeamProject = ({ currentUserIsOnTeam, ...props }) => {
  if (!currentUserIsOnTeam) {
    return null;
  }

  return (
    <section className="add-project-container">
      {/* Add disabled={props.projectLimitIsReached} once billing is ready */}
      <PopoverWithButton
        buttonClass={`add-project has-emoji ${props.extraButtonClass}`}
        buttonText={
          <>
            Add Project <span className="emoji bento-box" role="img" aria-label="" />
          </>
        }
        passToggleToPop
      >
        <AddTeamProjectPop {...props} />
      </PopoverWithButton>
    </section>
  );
};

AddTeamProject.propTypes = {
  currentUserIsOnTeam: PropTypes.bool.isRequired,
  addProject: PropTypes.func.isRequired,
  teamProjects: PropTypes.array.isRequired,
  extraButtonClass: PropTypes.string,
  api: PropTypes.func,
};

AddTeamProject.defaultProps = {
  extraButtonClass: '',
  api: null,
};

export default AddTeamProject;
