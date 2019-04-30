import React from 'react';
import PropTypes from 'prop-types';

import AddTeamProjectPop from '../pop-overs/add-team-project-pop';
import PopoverWithButton from '../pop-overs/popover-with-button';

const AddTeamProject = ({ addProject, teamProjects, extraButtonClass }) => (
  <section className="add-project-container">
    {/* Add disabled={props.projectLimitIsReached} once billing is ready */}
    <PopoverWithButton
      buttonClass={`add-project has-emoji ${extraButtonClass}`}
      buttonText={
        <>
          Add Project <span className="emoji bento-box" role="img" aria-label="" />
        </>
      }
    >
      {({ togglePopover }) => <AddTeamProjectPop addProject={addProject} teamProjects={teamProjects} togglePopover={togglePopover} />}
    </PopoverWithButton>
  </section>
);

AddTeamProject.propTypes = {
  addProject: PropTypes.func.isRequired,
  teamProjects: PropTypes.array.isRequired,
  extraButtonClass: PropTypes.string,
};

AddTeamProject.defaultProps = {
  extraButtonClass: '',
};

export default AddTeamProject;
