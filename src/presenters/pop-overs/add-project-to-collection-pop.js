// add-project-to-collection-pop -> Add a project to a collection via a project item's menu
import React from 'react';
import PropTypes from 'prop-types';
import Pluralize from 'react-pluralize';
import { flatten, orderBy, partition } from 'lodash';
import Loader from 'Components/loader';
import Badge from 'Components/badges/badge';
import SegmentedButtons from 'Components/buttons/segmented-buttons';
import TextInput from 'Components/inputs/text-input';
import { CollectionLink } from 'Components/link';
import { getAllPages } from 'Shared/api';
import { captureException } from '../../utils/sentry';
import useDebouncedValue from '../../hooks/use-debounced-value';

import { useTrackedFunc } from '../segment-analytics';
import { getAvatarUrl } from '../../models/project';
import { useAPI } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';

import CreateCollectionPop from './create-collection-pop';
import CollectionResultItem from '../includes/collection-result-item';

import { NestedPopover, NestedPopoverTitle } from './popover-nested';

const filterTypes = ['Your collections', 'Team collections'];

const NoSearchResultsPlaceholder = () => <p className="info-description">No matching collections found – add to a new one?</p>;

const NoCollectionPlaceholder = () => <p className="info-description">Create collections to organize your favorite projects.</p>;

const AddProjectPopoverTitle = ({ project }) => (
  <NestedPopoverTitle>
    <img src={getAvatarUrl(project.id)} alt="" /> Add {project.domain} to collection
  </NestedPopoverTitle>
);
AddProjectPopoverTitle.propTypes = {
  project: PropTypes.object.isRequired,
};

const AddProjectToCollectionResultItem = React.memo(({ onClick, collection, ...props }) => {
  const onClickTracked = useTrackedFunc(
    onClick,
    'Project Added to Collection',
    {},
    {
      groupId: collection.team ? collection.team.id : 0,
    },
  );
  return <CollectionResultItem onClick={onClickTracked} collection={collection} {...props} />;
});

const AddProjectToCollectionResults = ({ addProjectToCollection, collections, currentUser, project, togglePopover, query }) => {
  const debouncedQuery = useDebouncedValue(query.toLowerCase().trim(), 300);
  const filteredCollections = React.useMemo(() => collections.filter((collection) => collection.name.toLowerCase().includes(debouncedQuery)), [
    debouncedQuery,
    collections,
  ]);
  return (
    <>
      {filteredCollections.length ? (
        <section className="pop-over-actions results-list">
          <ul className="results">
            {filteredCollections.map((collection) => (
              <li key={collection.id}>
                <AddProjectToCollectionResultItem
                  onClick={addProjectToCollection}
                  project={project}
                  collection={collection}
                  togglePopover={togglePopover}
                  currentUser={currentUser}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="pop-over-info">{query ? <NoSearchResultsPlaceholder /> : <NoCollectionPlaceholder />}</section>
      )}
    </>
  );
};

AddProjectToCollectionResults.propTypes = {
  addProjectToCollection: PropTypes.func,
  collections: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  togglePopover: PropTypes.func, // required but added dynamically
  project: PropTypes.object.isRequired,
  query: PropTypes.string,
};

AddProjectToCollectionResults.defaultProps = {
  addProjectToCollection: null,
  currentUser: null,
  togglePopover: null,
  query: '',
};

const AddProjectToCollectionPopContents = ({
  addProjectToCollection,
  collections,
  collectionsWithProject,
  createCollectionPopover,
  currentUser,
  fromProject,
  project,
  togglePopover,
  collectionType,
  setCollectionType,
}) => {
  const [query, setQuery] = React.useState('');

  return (
    <dialog className="pop-over add-project-to-collection-pop wide-pop">
      {/* Only show this nested popover title from project-options */}
      {!fromProject && <AddProjectPopoverTitle project={project} />}

      {currentUser.teams.length > 0 && <UserOrTeamSegmentedButtons activeType={collectionType} setType={setCollectionType} /> }

      {collections && collections.length > 3 && (
        <section className="pop-over-info">
          <TextInput
            autoFocus
            value={query}
            onChange={setQuery}
            placeholder="Filter collections"
            labelText="Filter collections"
            opaque
            type="search"
          />
        </section>
      )}

      {!collections ? (
        <section className="pop-over-actions">
          <Loader />
        </section>
      ) : (
        <AddProjectToCollectionResults {...{ addProjectToCollection, collections, currentUser, project, togglePopover, query }} />
      )}

      {collections && collectionsWithProject.length ? (
        <section className="pop-over-info">
          <strong>{project.domain}</strong> is already in <Pluralize count={collectionsWithProject.length} showCount={false} singular="collection" />{' '}
          {collectionsWithProject
            .slice(0, 3)
            .map((collection) => (
              <CollectionLink key={collection.id} collection={collection}>
                {collection.name}
              </CollectionLink>
            ))
            .reduce((prev, curr) => [prev, ', ', curr])}
          {collectionsWithProject.length > 3 && (
            <>
              , and{' '}
              <div className="more-collections-badge">
                <Badge>{collectionsWithProject.length - 3}</Badge>
              </div>{' '}
              <Pluralize count={collectionsWithProject.length - 3} singular="other" showCount={false} />
            </>
          )}
        </section>
      ) : null}

      <section className="pop-over-actions">
        <button className="create-new-collection button-small button-tertiary" onClick={createCollectionPopover}>
          Add to a new collection
        </button>
      </section>
    </dialog>
  );
};

AddProjectToCollectionPopContents.propTypes = {
  addProjectToCollection: PropTypes.func,
  collections: PropTypes.array,
  currentUser: PropTypes.object,
  togglePopover: PropTypes.func, // required but added dynamically
  project: PropTypes.object.isRequired,
  fromProject: PropTypes.bool,
  collectionType: PropTypes.string.isRequired,
  setCollectionType: PropTypes.func.isRequired,
};

AddProjectToCollectionPopContents.defaultProps = {
  addProjectToCollection: null,
  collections: [],
  currentUser: null,
  togglePopover: null,
  fromProject: false,
};

const UserOrTeamSegmentedButtons = ({ activeType, setType }) => {
  const buttons = filterTypes.map((name) => ({
    name,
    contents: name,
  }));
  return (
    <section className="pop-over-actions">
      <div className="segmented-button-wrap">
        <SegmentedButtons value={activeType} buttons={buttons} onChange={setType} />
      </div>
    </section>
  );
};

const AddProjectToCollectionPop = (props) => {
  const { project, togglePopover, focusFirstElement } = props;

  const api = useAPI();
  const { currentUser } = useCurrentUser();

  const [collectionType, setCollectionType] = React.useState(filterTypes[0]);

  const [maybeCollections, setMaybeCollections] = React.useState(null);
  const [collectionsWithProject, setCollectionsWithProject] = React.useState([]);

  React.useEffect(() => {
    let canceled = false;
    setMaybeCollections(null); // reset maybCollections on reload to show loader

    const orderParams = 'orderKey=url&orderDirection=ASC&limit=100';

    const loadUserCollections = async (user) => {
      const collections = await getAllPages(api, `v1/users/by/id/collections?id=${user.id}&${orderParams}`);
      return collections.map((collection) => ({ ...collection, user }));
    };

    const loadTeamCollections = async (team) => {
      const collections = await getAllPages(api, `v1/teams/by/id/collections?id=${team.id}&${orderParams}`);
      return collections.map((collection) => ({ ...collection, team }));
    };

    const loadCollections = async () => {
      const projectCollectionsRequest = getAllPages(api, `v1/projects/by/id/collections?id=${project.id}&${orderParams}`);
      const userCollectionsRequest = loadUserCollections(currentUser);

      const requests =
        collectionType === filterTypes[0]
          ? [projectCollectionsRequest, userCollectionsRequest]
          : [projectCollectionsRequest, ...currentUser.teams.map((team) => loadTeamCollections(team))];

      const [projectCollections, ...collectionArrays] = await Promise.all(requests);

      const alreadyInCollectionIds = new Set(projectCollections.map((c) => c.id));
      const [collections, _collectionsWithProject] = partition(flatten(collectionArrays), (c) => !alreadyInCollectionIds.has(c.id));

      const orderedCollections = orderBy(collections, (collection) => collection.updatedAt, 'desc');

      if (!canceled) {
        setMaybeCollections(orderedCollections);
        setCollectionsWithProject(_collectionsWithProject);
      }
    };

    loadCollections().catch(captureException);
    return () => {
      canceled = true;
    };
  }, [project.id, currentUser.id, collectionType]);

  return (
    <NestedPopover
      alternateContent={() => (
        <CreateCollectionPop {...props} collections={maybeCollections} togglePopover={togglePopover} focusFirstElement={focusFirstElement} />
      )}
      startAlternateVisible={false}
    >
      {(createCollectionPopover) => (
        <AddProjectToCollectionPopContents
          {...props}
          collections={maybeCollections}
          collectionsWithProject={collectionsWithProject}
          createCollectionPopover={createCollectionPopover}
          collectionType={collectionType}
          setCollectionType={setCollectionType}
        />
      )}
    </NestedPopover>
  );
};

AddProjectToCollectionPop.propTypes = {
  fromProject: PropTypes.bool,
  project: PropTypes.object.isRequired,
  togglePopover: PropTypes.func,
  focusFirstElement: PropTypes.func,
};

AddProjectToCollectionPop.defaultProps = {
  fromProject: false,
  togglePopover: null,
  focusFirstElement: null,
};

export default AddProjectToCollectionPop;
