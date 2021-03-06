import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Pluralize from 'react-pluralize';
import { Redirect } from 'react-router-dom';
import { kebabCase, partition } from 'lodash';

import { isDarkColor, getLink, getOwnerLink } from 'Models/collection';

import Button from 'Components/buttons/button';
import Emoji from 'Components/images/emoji';
import Text from 'Components/text/text';
import Image from 'Components/images/image';
import FeaturedProject from 'Components/project/featured-project';
import NotFound from 'Components/errors/not-found';
import { ProfileItem } from 'Components/profile-list';
import ProjectsList from 'Components/containers/projects-list';
import CollectionNameInput from 'Components/fields/collection-name-input';
import DataLoader from 'Components/data-loader';
import MoreCollectionsContainer from 'Components/collections-list/more-collections';

import Layout from '../layout';

import { AnalyticsContext } from '../segment-analytics';
import AuthDescription from '../includes/auth-description';
import CollectionEditor from '../collection-editor';

import EditCollectionColor from '../includes/edit-collection-color';
import AddCollectionProject from '../includes/add-collection-project';
import ReportButton from '../pop-overs/report-abuse-pop';

import CollectionAvatar from '../includes/collection-avatar';

import { useAPI } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';


import { getSingleItem, getAllPages } from '../../../shared/api';

function DeleteCollectionBtn({ collection, deleteCollection }) {
  const [done, setDone] = useState(false);
  if (done) {
    return <Redirect to={getOwnerLink(collection)} />;
  }
  return (
    <Button
      type="dangerZone"
      size="small"
      onClick={() => {
        if (!window.confirm('Are you sure you want to delete your collection?')) {
          return;
        }
        deleteCollection();
        setDone(true);
      }}
    >
      Delete Collection <Emoji name="bomb" />
    </Button>
  );
}

DeleteCollectionBtn.propTypes = {
  collection: PropTypes.shape({
    team: PropTypes.object,
    user: PropTypes.object,
    url: PropTypes.string.isRequired,
  }).isRequired,
  deleteCollection: PropTypes.func.isRequired,
};

const CollectionPageContents = ({
  api,
  collection,
  currentUser,
  deleteCollection,
  currentUserIsAuthor,
  updateNameAndUrl,
  updateDescription,
  addProjectToCollection,
  removeProjectFromCollection,
  updateColor,
  displayNewNote,
  updateNote,
  hideNote,
  featureProject,
  unfeatureProject,
  ...props
}) => {
  const collectionHasProjects = !!collection && !!collection.projects;
  let featuredProject = null;
  let { projects } = collection;
  if (collection.featuredProjectId) {
    [[featuredProject], projects] = partition(collection.projects, (p) => p.id === collection.featuredProjectId);
  }

  const onNameChange = async (name) => {
    const url = kebabCase(name);
    const result = await updateNameAndUrl({ name, url });
    history.replaceState(null, null, getLink({ ...collection, url }));
    return result;
  };

  return (
    <>
      <Helmet title={collection.name} />
      <main className="collection-page">
        <article className="collection-full projects" style={{ backgroundColor: collection.coverColor }}>
          <header className={`collection ${isDarkColor(collection.coverColor) ? 'dark' : ''}`}>
            <div className="collection-image-container">
              <CollectionAvatar color={collection.coverColor} />
            </div>

            <h1 className="collection-name">
              {currentUserIsAuthor ? <CollectionNameInput name={collection.name} onChange={onNameChange} /> : collection.name}
            </h1>

            <div className="collection-owner">
              <ProfileItem hasLink team={collection.team} user={collection.user} />
            </div>

            <div className="collection-description">
              <AuthDescription
                authorized={currentUserIsAuthor}
                description={collection.description}
                update={updateDescription}
                placeholder="Tell us about your collection"
              />
            </div>

            <div className="collection-project-count">
              <Text>
                <Pluralize count={collection.projects.length} singular="Project" />
              </Text>
            </div>

            {currentUserIsAuthor && <EditCollectionColor update={updateColor} initialColor={collection.coverColor} />}
          </header>
          {!collectionHasProjects && currentUserIsAuthor && (
            <div className="empty-collection-hint">
              <Image src="https://cdn.glitch.com/1afc1ac4-170b-48af-b596-78fe15838ad3%2Fpsst-pink.svg?1541086338934" alt="" />
              <Text>You can add any project, created by any user</Text>
            </div>
          )}
          {!collectionHasProjects && !currentUserIsAuthor && (
            <div className="empty-collection-hint">No projects to see in this collection just yet.</div>
          )}
          {collectionHasProjects && (
            <>
              <div className="collection-contents">
                <div className="collection-project-container-header">
                  {currentUserIsAuthor && <AddCollectionProject addProjectToCollection={addProjectToCollection} collection={collection} />}
                </div>
                {featuredProject && (
                  <FeaturedProject
                    isAuthorized={currentUserIsAuthor}
                    currentUser={currentUser}
                    featuredProject={featuredProject}
                    unfeatureProject={unfeatureProject}
                    addProjectToCollection={addProjectToCollection}
                    collection={collection}
                    displayNewNote={displayNewNote}
                    updateNote={updateNote}
                    hideNote={hideNote}
                  />
                )}
                <ProjectsList
                  layout="gridCompact"
                  {...props}
                  projects={projects}
                  collection={collection}
                  noteOptions={{
                    hideNote,
                    updateNote,
                    isAuthorized: currentUserIsAuthor,
                  }}
                  projectOptions={{
                    removeProjectFromCollection,
                    addProjectToCollection,
                    displayNewNote,
                    featureProject,
                    isAuthorized: currentUserIsAuthor,
                  }}
                />
              </div>
            </>
          )}
        </article>
        {!currentUserIsAuthor && <ReportButton reportedType="collection" reportedModel={collection} />}
      </main>
      {currentUserIsAuthor && <DeleteCollectionBtn collection={collection} deleteCollection={deleteCollection} />}
      <MoreCollectionsContainer collection={collection} />
    </>
  );
};

CollectionPageContents.propTypes = {
  addProjectToCollection: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    avatarUrl: PropTypes.string,
    coverColor: PropTypes.string,
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    projects: PropTypes.array.isRequired,
  }).isRequired,
  currentUser: PropTypes.object.isRequired,
  deleteCollection: PropTypes.func.isRequired,
  currentUserIsAuthor: PropTypes.bool.isRequired,
  removeProjectFromCollection: PropTypes.func.isRequired,
  displayNewNote: PropTypes.func,
  updateNote: PropTypes.func,
  hideNote: PropTypes.func,
};

CollectionPageContents.defaultProps = {
  displayNewNote: null,
  updateNote: null,
  hideNote: null,
};

async function loadCollection(api, ownerName, collectionName) {
  try {
    const collection = await getSingleItem(api, `v1/collections/by/fullUrl?fullUrl=${encodeURIComponent(ownerName)}/${collectionName}`, `${ownerName}/${collectionName}`);
    const collectionProjects = await getAllPages(
      api,
      `v1/collections/by/fullUrl/projects?fullUrl=${encodeURIComponent(ownerName)}/${collectionName}&orderKey=updatedAt&orderDirection=ASC&limit=100`,
    );

    if (collection.user) {
      collection.user = await getSingleItem(api, `v1/users/by/id?id=${collection.user.id}`, collection.user.id);
    } else {
      collection.team = await getSingleItem(api, `v1/teams/by/id?id=${collection.team.id}`, collection.team.id);
    }

    // fetch users for each project
    if (collectionProjects) {
      const projectsWithUsers = await Promise.all(
        collectionProjects.map(async (project) => {
          project.users = await getAllPages(api, `v1/projects/by/id/users?id=${project.id}&orderKey=createdAt&orderDirection=ASC&limit=100`);
          return project;
        }),
      );
      collection.projects = projectsWithUsers;
    }

    return collection;
  } catch (error) {
    if (error && error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

const CollectionPage = ({ ownerName, name, ...props }) => {
  const api = useAPI();
  const { currentUser } = useCurrentUser();
  return (
    <Layout>
      <DataLoader get={() => loadCollection(api, ownerName, name)}>
        {(collection) =>
          collection ? (
            <AnalyticsContext
              properties={{ origin: 'collection' }}
              context={{
                groupId: collection.team ? collection.team.id.toString() : '0',
              }}
            >
              <CollectionEditor initialCollection={collection}>
                {(collectionFromEditor, funcs, currentUserIsAuthor) => (
                  <CollectionPageContents
                    api={api}
                    collection={collectionFromEditor}
                    currentUser={currentUser}
                    currentUserIsAuthor={currentUserIsAuthor}
                    {...funcs}
                    {...props}
                  />
                )}
              </CollectionEditor>
            </AnalyticsContext>
          ) : (
            <NotFound name={name} />
          )
        }
      </DataLoader>
    </Layout>
  );
};
export default CollectionPage;
