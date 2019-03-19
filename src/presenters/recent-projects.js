import React from 'react';
import PropTypes from 'prop-types';

import { getAvatarStyle, getProfileStyle } from '../models/user';
import { CurrentUserConsumer } from './current-user';
import { UserLink } from './includes/link';

import { CoverContainer } from './includes/profile';
import { Loader } from './includes/loader';
import ProjectsLoader from './projects-loader';
import { ProjectsUL } from './projects-list';
import SignInPop from './pop-overs/sign-in-pop';

const SignInNotice = ({ api }) => (
  <div className="anon-user-sign-up">
    <span>
      <SignInPop api={api} /> to keep your projects.
    </span>
    <div className="note">Anonymous projects expire after 2 weeks</div>
  </div>
);

const SignOut = () => {
  function clickSignout() {
    if (
      // eslint-disable-next-line
      !window.confirm(`You won't be able to sign back in under this same anonymous account.
Are you sure you want to sign out?`)
    ) {
      return;
    }
    // logout here
  }

  return (
    <div className="clear-session">
      <button type="button" onClick={clickSignout} className="button-small has-emoji button-tertiary button-on-secondary-background">
        Clear Session <span className="emoji balloon" />
      </button>
    </div>
  );
};

const RecentProjectsContainer = ({ children, user, api }) => (
  <section className="profile recent-projects">
    <h2>
      <UserLink user={user}>Your Projects →</UserLink>
    </h2>
    {!user.login && <SignInNotice api={api} />}
    <CoverContainer style={getProfileStyle(user)}>
      <div className="profile-avatar">
        <div className="user-avatar-container">
          <UserLink user={user}>
            <div className={`user-avatar ${!user.login ? 'anon-user-avatar' : ''}`} style={getAvatarStyle(user)} alt="" />
          </UserLink>
        </div>
      </div>
      <article className="projects">{children}</article>
      <SignOut />
    </CoverContainer>
  </section>
);
RecentProjectsContainer.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    color: PropTypes.string.isRequired,
    coverColor: PropTypes.string,
    hasCoverImage: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    login: PropTypes.string,
  }).isRequired,
};

const RecentProjects = ({ api }) => (
  <CurrentUserConsumer>
    {(user, fetched) => (
      <RecentProjectsContainer user={user} api={api}>
        {fetched ? (
          <ProjectsLoader api={api} projects={user.projects.slice(0, 3)}>
            {(projects) => <ProjectsUL projects={projects} />}
          </ProjectsLoader>
        ) : (
          <Loader />
        )}
      </RecentProjectsContainer>
    )}
  </CurrentUserConsumer>
);
RecentProjects.propTypes = {
  api: PropTypes.any.isRequired,
};
export default RecentProjects;
