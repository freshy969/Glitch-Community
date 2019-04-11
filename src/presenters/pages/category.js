import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import Image from 'Components/images/image';
import Heading from 'Components/text/heading';
import { ProjectsUL } from 'Components/containers/projects-list';
import Layout from '../layout';

import { AnalyticsContext } from '../segment-analytics';
import { DataLoader } from '../includes/loader';
import ProjectsLoader from '../projects-loader';
import MoreIdeas from '../more-ideas';

import CollectionEditor from '../collection-editor';
import { useAPI } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';


const CategoryPageWrap = ({ addProjectToCollection, category, currentUser, ...props }) => (
  <>
    <Helmet title={category.name} />
    <main className="collection-page">
      <article className="projects collection-full" style={{ backgroundColor: category.backgroundColor }}>
        <header className="collection">
          <Heading tagName="h1">{category.name}</Heading>
          <div className="collection-image-container">
            <Image src={category.avatarUrl} />
          </div>

          <p className="description">{category.description}</p>
        </header>

        <ProjectsLoader projects={category.projects}>
          {(projects) => (
            <div className="collection-contents">
              <div className="collection-project-container-header">
                <Heading tagName="h3">Projects ({category.projects.length})</Heading>
              </div>

              {currentUser.login ? (
                <ProjectsUL
                  {...{
                    projects,
                    currentUser,
                    addProjectToCollection,
                  }}
                  category
                  projectOptions={{
                    addProjectToCollection,
                  }}
                  {...props}
                />
              ) : (
                <ProjectsUL
                  {...{
                    projects,
                    currentUser,
                    addProjectToCollection,
                  }}
                  category
                  projectOptions={{}}
                  {...props}
                />
              )}
            </div>
          )}
        </ProjectsLoader>
      </article>
    </main>
    <MoreIdeas />
  </>
);

CategoryPageWrap.propTypes = {
  category: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    projects: PropTypes.array.isRequired,
  }).isRequired,
  addProjectToCollection: PropTypes.func.isRequired,
};

async function loadCategory(api, id) {
  const { data } = await api.get(`categories/${id}`);
  return data;
}

const CategoryPage = ({ category, ...props }) => {
  const api = useAPI();
  const { currentUser } = useCurrentUser();
  return (
    <Layout>
      <AnalyticsContext properties={{ origin: 'category' }}>
        <DataLoader get={() => loadCategory(api, category.id)}>
          {(loadedCategory) => (
            <CollectionEditor initialCollection={loadedCategory}>
              {(categoryFromEditor, funcs) => (
                <CategoryPageWrap category={categoryFromEditor} userIsAuthor={false} currentUser={currentUser} {...funcs} {...props} />
              )}
            </CollectionEditor>
          )}
        </DataLoader>
      </AnalyticsContext>
    </Layout>
  );
};
CategoryPage.propTypes = {
  category: PropTypes.object.isRequired,
};

export default CategoryPage;
