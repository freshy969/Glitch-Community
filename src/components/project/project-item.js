import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Markdown from 'Components/text/markdown';
import Button from 'Components/buttons/button';
import Image from 'Components/images/image';
import UsersList from 'Components/user/users-list';
import { FALLBACK_AVATAR_URL, getAvatarUrl } from 'Models/project';
import { ProjectLink } from '../../presenters/includes/link';
import ProjectOptionsPop from '../../presenters/pop-overs/project-options-pop';
import styles from './project-item.styl';

const PrivateIcon = () => <span className="project-badge private-project-badge" aria-label="private" />;

const ProfileAvatar = ({ project }) => <Image className={styles.avatar} src={getAvatarUrl(project.id)} defaultSrc={FALLBACK_AVATAR_URL} alt="" />;

const getLinkBodyStyles = (project) =>
  classnames(styles.linkBody, {
    [styles.private]: project.private,
  });

const ProjectItem = ({ project, projectOptions }) => (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.userListContainer}>
        <UsersList avatarsOnly layout="row" glitchTeam={project.showAsGlitchTeam} users={project.users} teams={project.teams} />
      </div>
      <div className={styles.projectOptionsContainer}>
        <ProjectOptionsPop project={project} projectOptions={projectOptions} />
      </div>
    </header>
    <ProjectLink className={getLinkBodyStyles(project)} project={project}>
      <div className={styles.projectHeader}>
        <div className={styles.avatarWrap}>
          <ProfileAvatar project={project} />
        </div>
        <div className={styles.nameWrap}>
          <Button decorative>
            {project.private && <PrivateIcon />} <span className={styles.projectDomain}>{project.domain}</span>
          </Button>
        </div>
      </div>
      <div className={styles.description}>
        <Markdown length={80}>{project.description || ' '}</Markdown>
      </div>
    </ProjectLink>
  </div>
);

ProjectItem.propTypes = {
  project: PropTypes.shape({
    description: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    private: PropTypes.bool,
    showAsGlitchTeam: PropTypes.bool.isRequired,
    users: PropTypes.array,
    teams: PropTypes.array,
  }).isRequired,
  projectOptions: PropTypes.object,
};

ProjectItem.defaultProps = {
  projectOptions: {},
};

export default ProjectItem;
