import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import { partition } from 'lodash';
import TeamNameInput from 'Components/fields/team-name-input';
import TeamUrlInput from 'Components/fields/team-url-input';
import Text from 'Components/text/text';
import Heading from 'Components/text/heading';
import FeaturedProject from 'Components/project/featured-project';
import ProjectsList from 'Components/containers/projects-list';
import Thanks from 'Components/thanks';
import DataLoader from 'Components/data-loader';
import ProfileContainer from 'Components/profile-container';
import Emoji from 'Components/images/emoji';
import TeamUsers from 'Components/team-users';
import { getLink, currentUserIsOnTeam, currentUserIsTeamAdmin } from 'Models/team';

import { AnalyticsContext } from '../segment-analytics';
import { useAPI } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';
import TeamEditor from '../team-editor';
import AuthDescription from '../includes/auth-description';
import ErrorBoundary from '../includes/error-boundary';

// import SampleTeamCollections from '../../curated/sample-team-collections';
import CollectionsList from '../collections-list';
import NameConflictWarning from '../includes/name-conflict';
import AddTeamProject from '../includes/add-team-project';
import DeleteTeam from '../includes/delete-team';

import ProjectsLoader from '../projects-loader';
import TeamAnalytics from '../includes/team-analytics';
import { TeamMarketing, VerifiedBadge } from '../includes/team-elements';
import ReportButton from '../pop-overs/report-abuse-pop';
import styles from './team.styl';

function syncPageToUrl(team) {
  history.replaceState(null, null, getLink(team));
}

const TeamNameUrlFields = ({ team, updateName, updateUrl }) => (
  <>
    <Heading tagName="h1">
      <TeamNameInput name={team.name} onChange={updateName} verified={team.isVerified} />
    </Heading>
    <p className={styles.teamUrl}>
      <TeamUrlInput url={team.url} onChange={(url) => updateUrl(url).then(() => syncPageToUrl({ ...team, url }))} />
    </p>
  </>
);

const TeamPageCollections = ({ collections, team }) => {
  const { currentUser } = useCurrentUser();
  return (
    <CollectionsList
      title="Collections"
      collections={collections.map((collection) => ({ ...collection, team }))}
      maybeTeam={team}
      isAuthorized={currentUserIsOnTeam({ currentUser, team })}
    />
  );
};

const Beta = () => (
  <a href="/teams/" target="_blank" className={styles.beta}>
    <img src="https://cdn.glitch.com/0c3ba0da-dac8-4904-bb5e-e1c7acc378a2%2Fbeta-flag.svg?1541448893958" alt="" />
    <div>
      <Heading tagName="h4">Teams are in beta</Heading>
      <Text>Learn More</Text>
    </div>
  </a>
);

const ProjectPals = () => (
  <aside className="inline-banners add-project-to-empty-team-banner">
    <div className="description-container">
      <img className="project-pals" src="https://cdn.glitch.com/02ae6077-549b-429d-85bc-682e0e3ced5c%2Fcollaborate.svg?1540583258925" alt="" />
      <div className="description">Add projects to share them with your team</div>
    </div>
  </aside>
);

// Team Page

function TeamPage({
  api,
  currentUser,
  team,
  uploadCover,
  clearCover,
  uploadAvatar,
  updateName,
  updateUrl,
  updateDescription,
  unfeatureProject,
  removePin,
  addPin,
  addProject,
  deleteProject,
  leaveTeamProject,
  removeProject,
  joinTeamProject,
  featureProject,
  updateWhitelistedDomain,
  inviteEmail,
  inviteUser,
  joinTeam,
  removeUserFromTeam,
  updateUserPermissions,
}) {
  const pinnedSet = new Set(team.teamPins.map(({ projectId }) => projectId));
  // filter featuredProject out of both pinned & recent projects
  const [pinnedProjects, recentProjects] = partition(team.projects.filter(({ id }) => id !== team.featuredProjectId), ({ id }) => pinnedSet.has(id));

  const addProjectToCollection = (project, collection) => api.patch(`collections/${collection.id}/add/${project.id}`);
  const featuredProject = team.projects.find(({ id }) => id === team.featuredProjectId);
  const isTeamAdmin = currentUserIsTeamAdmin({ currentUser, team });
  const isOnTeam = currentUserIsOnTeam({ currentUser, team });

  const projectOptions = {
    addProjectToCollection,
    deleteProject,
    leaveTeamProject,
  };
  if (currentUserIsOnTeam({ currentUser, team })) {
    Object.assign(projectOptions, {
      removeProjectFromTeam: removeProject,
      joinTeamProject,
      featureProject,
    });
  }

  return (
    <main className={styles.container}>
      <section>
        <Beta />
        <ProfileContainer
          item={team}
          type="team"
          coverActions={{
            'Upload Cover': isTeamAdmin ? uploadCover : null,
            'Clear Cover': isTeamAdmin && team.hasCoverImage ? clearCover : null,
          }}
          avatarActions={{
            'Upload Avatar': isTeamAdmin ? uploadAvatar : null,
          }}
        >
          {isTeamAdmin ? (
            <TeamNameUrlFields team={team} updateName={updateName} updateUrl={updateUrl} />
          ) : (
            <>
              <Heading tagName="h1">
                {team.name} {team.isVerified && <VerifiedBadge />}
              </Heading>
              <p className={styles.teamUrl}>@{team.url}</p>
            </>
          )}
          <div className={styles.usersInformation}>
            <TeamUsers
              team={team}
              updateWhitelistedDomain={updateWhitelistedDomain}
              inviteEmail={inviteEmail}
              inviteUser={inviteUser}
              joinTeam={joinTeam}
              removeUserFromTeam={removeUserFromTeam}
              updateUserPermissions={updateUserPermissions}
            />
          </div>
          <Thanks count={team.users.reduce((total, { thanksCount }) => total + thanksCount, 0)} />
          <AuthDescription authorized={isTeamAdmin} description={team.description} update={updateDescription} placeholder="Tell us about your team" />
        </ProfileContainer>
      </section>

      <ErrorBoundary>
        {isOnTeam && <AddTeamProject addProject={addProject} teamProjects={team.projects} />}
      </ErrorBoundary>

      {featuredProject && (
        <FeaturedProject
          featuredProject={featuredProject}
          isAuthorized={isOnTeam}
          unfeatureProject={unfeatureProject}
          addProjectToCollection={addProjectToCollection}
          currentUser={currentUser}
        />
      )}

      {/* Pinned Projects */}
      {pinnedProjects.length > 0 && (
        <ProjectsList
          title={
            <>
              Pinned Projects <Emoji inTitle name="pushpin" />
            </>
          }
          projects={pinnedProjects}
          isAuthorized={isOnTeam}
          removePin={removePin}
          projectOptions={{
            removePin: isOnTeam ? removePin : undefined,
            ...projectOptions,
          }}
        />
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <ProjectsList
          title="Recent Projects"
          projects={recentProjects}
          isAuthorized={isOnTeam}
          enablePagination
          enableFiltering={recentProjects.length > 6}
          projectOptions={{
            addPin: isOnTeam ? addPin : undefined,
            ...projectOptions,
          }}
        />
      )}

      {team.projects.length === 0 && isOnTeam && <ProjectPals />}

      {/* TEAM COLLECTIONS */}
      <ErrorBoundary>
        <DataLoader
          get={() => api.get(`collections?teamId=${team.id}`)}
          renderLoader={() => <TeamPageCollections collections={team.collections} team={team} />}
        >
          {({ data }) => <TeamPageCollections collections={data} team={team} />}
        </DataLoader>
      </ErrorBoundary>

      {isOnTeam && (
        <ErrorBoundary>
          <TeamAnalytics
            id={team.id}
            currentUserIsOnTeam={isOnTeam}
            projects={team.projects}
            addProject={addProject}
            myProjects={currentUser ? currentUser.projects : []}
          />
        </ErrorBoundary>
      )}

      {isTeamAdmin && <DeleteTeam team={team} users={team.users} />}

      {!isOnTeam && (
        <>
          <ReportButton reportedType="team" reportedModel={team} />
          <TeamMarketing />
        </>
      )}
    </main>
  );
}

TeamPage.propTypes = {
  team: PropTypes.shape({
    _cacheAvatar: PropTypes.number.isRequired,
    _cacheCover: PropTypes.number.isRequired,
    adminIds: PropTypes.array.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    coverColor: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    hasAvatarImage: PropTypes.bool.isRequired,
    hasCoverImage: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    isVerified: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    projects: PropTypes.array.isRequired,
    teamPins: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    whitelistedDomain: PropTypes.string,
    featuredProjectId: PropTypes.string,
  }).isRequired,
  addPin: PropTypes.func.isRequired,
  addProject: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  updateWhitelistedDomain: PropTypes.func.isRequired,
  inviteEmail: PropTypes.func.isRequired,
  inviteUser: PropTypes.func.isRequired,
  api: PropTypes.func.isRequired,
  clearCover: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  removeUserFromTeam: PropTypes.func.isRequired,
  removePin: PropTypes.func.isRequired,
  removeProject: PropTypes.func.isRequired,
  updateName: PropTypes.func.isRequired,
  updateUrl: PropTypes.func.isRequired,
  updateDescription: PropTypes.func.isRequired,
  uploadAvatar: PropTypes.func.isRequired,
  uploadCover: PropTypes.func.isRequired,
  featureProject: PropTypes.func.isRequired,
  unfeatureProject: PropTypes.func.isRequired,
};

const teamConflictsWithUser = (team, currentUser) => {
  if (currentUser && currentUser.login) {
    return currentUser.login.toLowerCase() === team.url;
  }
  return false;
};

const TeamNameConflict = ({ team }) => {
  const { currentUser } = useCurrentUser();
  return teamConflictsWithUser(team, currentUser) && <NameConflictWarning />;
};
const TeamPageEditor = ({ initialTeam, children }) => (
  <TeamEditor initialTeam={initialTeam}>
    {(team, funcs) => (
      <ProjectsLoader projects={team.projects}>
        {(projects, reloadProjects) => {
          // Inject page specific changes to the editor
          // Mainly url updating and calls to reloadProjects

          const removeUserFromTeam = async (user, projectIds) => {
            await funcs.removeUserFromTeam(user, projectIds);
            reloadProjects(...projectIds);
          };

          const joinTeamProject = async (projectId) => {
            await funcs.joinTeamProject(projectId);
            reloadProjects(projectId);
          };

          const leaveTeamProject = async (projectId) => {
            await funcs.leaveTeamProject(projectId);
            reloadProjects(projectId);
          };

          return children(
            { ...team, projects },
            {
              ...funcs,
              removeUserFromTeam,
              joinTeamProject,
              leaveTeamProject,
            },
          );
        }}
      </ProjectsLoader>
    )}
  </TeamEditor>
);
const TeamPageContainer = ({ team, ...props }) => {
  const { currentUser } = useCurrentUser();
  const api = useAPI();
  return (
    <AnalyticsContext properties={{ origin: 'team' }} context={{ groupId: team.id.toString() }}>
      <TeamPageEditor initialTeam={team}>
        {(teamFromEditor, funcs) => (
          <>
            <Helmet title={teamFromEditor.name} />
            <TeamPage api={api} team={teamFromEditor} {...funcs} currentUser={currentUser} {...props} />
            <TeamNameConflict team={teamFromEditor} />
          </>
        )}
      </TeamPageEditor>
    </AnalyticsContext>
  );
};
export default TeamPageContainer;
