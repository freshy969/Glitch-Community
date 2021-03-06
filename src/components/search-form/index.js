import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { mapValues, flatMap } from 'lodash';
import { getLink as getProjectLink } from 'Models/project';
import { getLink as getUserLink } from 'Models/user';
import { getLink as getTeamLink } from 'Models/team';
import TextInput from '../inputs/text-input';
import { useAlgoliaSearch } from '../../state/search';
import useDevToggle from '../../presenters/includes/dev-toggles';
import PopoverContainer from '../../presenters/pop-overs/popover-container';
import AutocompleteSearch from './autocomplete';
import styles from './search-form.styl';

const createSlice = (handlers) => {
  const actions = mapValues(handlers, (_, type) => (payload) => ({ type, payload }));
  const reducer = (state, action) => {
    if (handlers[action.type]) return handlers[action.type](state, action);
    return state;
  };
  return { actions, reducer };
};

const resultGroups = [
  { id: 'top', label: 'Top Results', getItems: (results) => [...results.starterKit, ...results.topResults] },
  { id: 'team', label: 'Teams' },
  { id: 'user', label: 'Users' },
  { id: 'project', label: 'Projects' },
  { id: 'collection', label: 'Collections' },
];

const MAX_RESULTS_PER_TYPE = 3;

const formatResults = (results) => {
  const notTopResult = (result) => !results.topResults.includes(result);
  const getItemsFor = (group) => {
    if (group.getItems) return group.getItems(results);
    if (!results[group.id]) return [];
    return results[group.id].filter(notTopResult).slice(0, MAX_RESULTS_PER_TYPE);
  };
  return resultGroups.map((group) => ({ ...group, items: getItemsFor(group) })).filter((group) => group.items.length > 0);
};

const resultsWithSelection = (results, selectedResult) => {
  if (!selectedResult) return results;
  return results.map((group) => ({
    ...group,
    items: group.items.map((item) => (item === selectedResult ? { ...item, selected: true } : item)),
  }));
};

const urlForItem = {
  starterKit: (starterKit) => starterKit.url,
  team: getTeamLink,
  user: getUserLink,
  project: getProjectLink,
  collection: (collection) => `/@${collection.fullUrl}`,
  seeAllResults: (_, query) => `/search?q=${query}`,
};

const seeAllResultsSelected = { type: 'seeAllResults' };

const redirectFor = ({ query, selectedResult }) => {
  if (!query) return null;
  if (!selectedResult) return `/search?q=${query}`;
  return urlForItem[selectedResult.type](selectedResult, query);
};

function getOffsetSelectedResult({ results, selectedResult }, offset) {
  const flatResults = flatMap(results, ({ items }) => items);
  if (!selectedResult && offset < 0) {
    return seeAllResultsSelected;
  }
  if (selectedResult === seeAllResultsSelected && offset < 0) {
    return flatResults[flatResults.length + offset];
  }
  if ((!selectedResult || selectedResult === seeAllResultsSelected) && offset > 0) {
    return flatResults[offset - 1];
  }

  const nextIndex = flatResults.indexOf(selectedResult) + offset;
  return flatResults[nextIndex] || seeAllResultsSelected;
}

const { actions, reducer } = createSlice({
  queryChanged: (state, { payload }) => ({
    ...state,
    query: payload,
  }),
  resultsChanged: (state, { payload }) => ({
    ...state,
    selectedResult: null,
    results: formatResults(payload),
  }),
  arrowUp: (state) => ({
    ...state,
    selectedResult: getOffsetSelectedResult(state, -1),
  }),
  arrowDown: (state) => ({
    ...state,
    selectedResult: getOffsetSelectedResult(state, 1),
  }),
  submitted: (state) => ({
    ...state,
    redirect: redirectFor(state),
  }),
});

function AlgoliaSearchController({ visible, setVisible, children, defaultValue, useSearchProvider }) {
  const initialState = {
    selectedResult: null,
    query: defaultValue,
    redirect: null,
    results: [],
  };
  const [{ query, results, selectedResult, redirect }, dispatch] = useReducer(reducer, initialState);
  const algoliaResults = useSearchProvider(query);

  useEffect(() => {
    // use last complete results
    if (algoliaResults.status === 'ready') {
      dispatch(actions.resultsChanged(algoliaResults));
    }
  }, [algoliaResults]);

  useEffect(() => {
    if (redirect) {
      window.location = redirect;
    }
  }, [redirect]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      dispatch(actions.arrowUp());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      dispatch(actions.arrowDown());
    }
  };
  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(actions.submitted());
  };

  return children({
    query,
    onChange: (value) => dispatch(actions.queryChanged(value)),
    onFocus: () => setVisible(true),
    onKeyDown,
    onSubmit,
    redirect,
    autoComplete: 'off',
    autoCompleteResults: query && visible && (
      <div className={styles.popOver}>
        <AutocompleteSearch
          query={query}
          results={resultsWithSelection(results, selectedResult)}
          seeAllResultsSelected={selectedResult === seeAllResultsSelected}
        />
      </div>
    ),
  });
}

function LegacySearchController({ children, defaultValue }) {
  const [query, onChange] = useState(defaultValue);
  const onSubmit = (event) => {
    event.preventDefault();
    if (!query) return;
    window.location = `/search?q=${query}`;
  };

  return children({
    query,
    onChange,
    onSubmit,
    autoComplete: 'on',
    autoCompleteResults: null,
  });
}

function SearchController({ children, defaultValue, showAutocomplete, useSearchProvider }) {
  if (showAutocomplete) {
    return (
      <PopoverContainer>
        {(popoverProps) => (
          <AlgoliaSearchController {...popoverProps} defaultValue={defaultValue} useSearchProvider={useSearchProvider}>
            {children}
          </AlgoliaSearchController>
        )}
      </PopoverContainer>
    );
  }
  return <LegacySearchController defaultValue={defaultValue}>{children}</LegacySearchController>;
}

export const BaseSearchForm = (props) => (
  <SearchController {...props}>
    {({ query, onChange, onFocus, onSubmit, onKeyDown, autoComplete, autoCompleteResults }) => (
      <form
        className={styles.container}
        action="/search"
        method="get"
        role="search"
        onSubmit={onSubmit}
        onFocus={onFocus}
        autoComplete={autoComplete}
        autoCapitalize="off"
      >
        <TextInput
          labelText="Search Glitch"
          name="q"
          onChange={onChange}
          onKeyDown={onKeyDown}
          opaque
          placeholder="bots, apps, users"
          type="search"
          value={query}
        />
        {autoCompleteResults}
      </form>
    )}
  </SearchController>
);

const SearchForm = ({ defaultValue }) => {
  const algoliaFlag = useDevToggle('Algolia Search');
  return <BaseSearchForm defaultValue={defaultValue} showAutocomplete={algoliaFlag} useSearchProvider={useAlgoliaSearch} />;
};

SearchForm.propTypes = {
  defaultValue: PropTypes.string,
};
SearchForm.defaultProps = {
  defaultValue: '',
};

export default SearchForm;
