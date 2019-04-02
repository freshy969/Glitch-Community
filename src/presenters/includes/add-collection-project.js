import React from 'react';
import PropTypes from 'prop-types';

import { getAllPages } from 'Shared/api';
import AddCollectionProjectPop from '../pop-overs/add-collection-project-pop';
import PopoverWithButton from '../pop-overs/popover-with-button';
import { createAPIHook } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';

const useTeamProjects = createAPIHook(async (api, teamId) => {
  if (teamId > 0) {
    const projects = await getAllPages(api, `/v1/teams/by/id/projects?limit=100&orderKey=updatedAt&orderDirection=ASC&id=${teamId}`);
    return projects;
  }
  return null;
});

function AddCollectionProject({ collection, addProjectToCollection }) {
  const teamResponse = useTeamProjects(collection.teamId);
  const { currentUser } = useCurrentUser();

  let initialProjects = [];
  if (teamResponse.status === 'ready' && teamResponse.value) {
    initialProjects = teamResponse.value;
  } else {
    initialProjects = currentUser.projects;
  }

  return (
    <PopoverWithButton buttonClass="add-project" buttonText="Add Project">
      {({ togglePopover }) => (
        <AddCollectionProjectPop
          collection={collection}
          initialProjects={initialProjects.slice(0, 20)}
          addProjectToCollection={addProjectToCollection}
          togglePopover={togglePopover}
        />
      )}
    </PopoverWithButton>
  );
}

AddCollectionProject.propTypes = {
  collection: PropTypes.object.isRequired,
  addProjectToCollection: PropTypes.func.isRequired,
};

export default AddCollectionProject;
