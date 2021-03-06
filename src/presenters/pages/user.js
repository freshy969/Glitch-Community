import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import { orderBy, partition } from 'lodash';

import Heading from 'Components/text/heading';
import Emoji from 'Components/images/emoji';
import FeaturedProject from 'Components/project/featured-project';
import Thanks from 'Components/thanks';
import UserNameInput from 'Components/fields/user-name-input';
import UserLoginInput from 'Components/fields/user-login-input';
import ProjectsList from 'Components/containers/projects-list';
import { UserProfileContainer } from 'Components/containers/profile';
import CollectionsList from 'Components/collections-list';
import DeletedProjects from 'Components/deleted-projects';

import { getLink } from '../../models/user';

import { AnalyticsContext } from '../segment-analytics';
import { useCurrentUser } from '../../state/current-user';
import AuthDescription from '../includes/auth-description';
import UserEditor from '../user-editor';

import ProjectsLoader from '../projects-loader';
import ReportButton from '../pop-overs/report-abuse-pop';
import styles from './user.styl';

function syncPageToLogin(login) {
  history.replaceState(null, null, getLink({ login }));
}

const NameAndLogin = ({ name, login, isAuthorized, updateName, updateLogin }) => {
  if (!login) {
    return <Heading tagName="h1">Anonymous</Heading>;
  }

  if (!isAuthorized) {
    if (!name) {
      return <Heading tagName="h1">@{login}</Heading>;
    }
    return (
      <>
        <Heading tagName="h1">{name}</Heading>
        <Heading tagName="h2">@{login}</Heading>
      </>
    );
  }
  const editableName = name !== null ? name : '';
  return (
    <>
      <Heading tagName="h1">
        <UserNameInput name={editableName} onChange={updateName} />
      </Heading>
      <Heading tagName="h2">
        <UserLoginInput login={login} onChange={updateLogin} />
      </Heading>
    </>
  );
};
NameAndLogin.propTypes = {
  name: PropTypes.string,
  login: PropTypes.string,
  isAuthorized: PropTypes.bool.isRequired,
  updateName: PropTypes.func.isRequired,
  updateLogin: PropTypes.func.isRequired,
};

NameAndLogin.defaultProps = {
  name: '',
  login: '',
};

// has science gone too far?
const UserPage = ({
  user: {
    // has science gone too far?
    _deletedProjects,
    featuredProjectId,
    ...user
  },
  isAuthorized,
  maybeCurrentUser,
  updateDescription,
  updateName,
  updateLogin,
  uploadCover,
  clearCover,
  uploadAvatar,
  addPin,
  removePin,
  leaveProject,
  deleteProject,
  undeleteProject,
  featureProject,
  unfeatureProject,
  setDeletedProjects,
  addProjectToCollection,
}) => {
  const pinnedSet = new Set(user.pins.map(({ id }) => id));
  // filter featuredProject out of both pinned & recent projects
  const [pinnedProjects, recentProjects] = partition(user.projects.filter(({ id }) => id !== featuredProjectId), ({ id }) => pinnedSet.has(id));
  const featuredProject = user.projects.find(({ id }) => id === featuredProjectId);

  return (
    <main className={styles.container}>
      <section>
        <UserProfileContainer
          item={user}
          coverActions={{
            'Upload Cover': isAuthorized && user.login ? uploadCover : null,
            'Clear Cover': isAuthorized && user.hasCoverImage ? clearCover : null,
          }}
          avatarActions={{
            'Upload Avatar': isAuthorized && user.login ? uploadAvatar : null,
          }}
          teams={user.teams}
        >
          <NameAndLogin
            name={user.name}
            login={user.login}
            {...{ isAuthorized, updateName }}
            updateLogin={(login) => updateLogin(login).then(() => syncPageToLogin(login))}
          />
          <Thanks count={user.thanksCount} />
          <AuthDescription
            authorized={isAuthorized && !!user.login}
            description={user.description}
            update={updateDescription}
            placeholder="Tell us about yourself"
          />
        </UserProfileContainer>
      </section>

      {featuredProject && (
        <FeaturedProject
          featuredProject={featuredProject}
          isAuthorized={isAuthorized}
          unfeatureProject={unfeatureProject}
          addProjectToCollection={addProjectToCollection}
          currentUser={maybeCurrentUser}
        />
      )}

      {/* Pinned Projects */}
      {pinnedProjects.length > 0 && (
        <ProjectsList
          layout="grid"
          title={
            <>
              Pinned Projects <Emoji inTitle name="pushpin" />
            </>
          }
          projects={pinnedProjects}
          projectOptions={{
            removePin,
            featureProject,
            leaveProject,
            deleteProject,
            addProjectToCollection,
            isAuthorized,
          }}
        />
      )}

      {!!user.login && (
        <CollectionsList
          title="Collections"
          collections={user.collections.map((collection) => ({
            ...collection,
            user,
          }))}
          isAuthorized={isAuthorized}
          maybeCurrentUser={maybeCurrentUser}
        />
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <ProjectsList
          layout="grid"
          title="Recent Projects"
          projects={recentProjects}
          enablePagination
          enableFiltering={recentProjects.length > 6}
          projectOptions={{
            addPin,
            featureProject,
            leaveProject,
            deleteProject,
            addProjectToCollection,
            isAuthorized,
          }}
        />
      )}
      {isAuthorized && (
        <article>
          <Heading tagName="h2">
            Deleted Projects
            <Emoji inTitle name="bomb" />
          </Heading>
          <DeletedProjects setDeletedProjects={setDeletedProjects} deletedProjects={_deletedProjects} undelete={undeleteProject} />
        </article>
      )}
      {!isAuthorized && <ReportButton reportedType="user" reportedModel={user} />}
    </main>
  );
};

UserPage.propTypes = {
  clearCover: PropTypes.func.isRequired,
  maybeCurrentUser: PropTypes.object.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  leaveProject: PropTypes.func.isRequired,
  uploadAvatar: PropTypes.func.isRequired,
  uploadCover: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    login: PropTypes.string,
    id: PropTypes.number.isRequired,
    thanksCount: PropTypes.number.isRequired,
    hasCoverImage: PropTypes.bool.isRequired,
    avatarUrl: PropTypes.string,
    color: PropTypes.string.isRequired,
    coverColor: PropTypes.string,
    description: PropTypes.string.isRequired,
    pins: PropTypes.array.isRequired,
    projects: PropTypes.array.isRequired,
    teams: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    _cacheCover: PropTypes.number.isRequired,
    _deletedProjects: PropTypes.array.isRequired,
  }).isRequired,
  addProjectToCollection: PropTypes.func.isRequired,
  featureProject: PropTypes.func.isRequired,
  unfeatureProject: PropTypes.func.isRequired,
};

const UserPageContainer = ({ user }) => {
  const { currentUser: maybeCurrentUser } = useCurrentUser();
  return (
    <AnalyticsContext properties={{ origin: 'user' }}>
      <UserEditor initialUser={user}>
        {(userFromEditor, funcs, isAuthorized) => (
          <>
            <Helmet title={userFromEditor.name || (userFromEditor.login ? `@${userFromEditor.login}` : `User ${userFromEditor.id}`)} />
            <ProjectsLoader projects={orderBy(userFromEditor.projects, (project) => project.updatedAt, ['desc'])}>
              {(projects) => <UserPage {...{ isAuthorized, maybeCurrentUser }} user={{ ...userFromEditor, projects }} {...funcs} />}
            </ProjectsLoader>
          </>
        )}
      </UserEditor>
    </AnalyticsContext>
  );
};
export default UserPageContainer;
