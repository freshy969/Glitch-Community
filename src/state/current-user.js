import { useEffect } from 'react';
import { createSlice } from 'redux-starter-kit';
import { configureScope, captureException, captureMessage, addBreadcrumb } from '../utils/sentry';
import { readFromStorage, writeToStorage, subscribeToStorageChanges } from './local-storage';
import { getAPIForToken } from './api';
import { useSelector, useActions, afterReducer, matchAlways, matchTypes } from './utils';

// Default values for all of the user fields we need you to have
// We always generate a 'real' anon user, but use this until we do
const defaultUser = {
  id: 0,
  login: null,
  name: null,
  description: '',
  color: '#aaa',
  avatarUrl: null,
  avatarThumbnailUrl: null,
  hasCoverImage: false,
  coverColor: null,
  emails: [],
  features: [],
  projects: [],
  teams: [],
  collections: [],
};

function identifyUser(user) {
  const analytics = { window };
  if (user) {
    addBreadcrumb({
      level: 'info',
      message: `Current user is ${JSON.stringify(user)}`,
    });
  } else {
    addBreadcrumb({
      level: 'info',
      message: 'logged out',
    });
  }
  try {
    if (analytics && analytics.identify && user && user.login) {
      const emailObj = Array.isArray(user.emails) && user.emails.find((email) => email.primary);
      const email = emailObj && emailObj.email;
      analytics.identify(
        user.id,
        {
          name: user.name,
          login: user.login,
          email,
          created_at: user.createdAt,
        },
        { groupId: '0' },
      );
    }
    if (user) {
      configureScope((scope) => {
        scope.setUser({
          id: user.id,
          login: user.login,
        });
      });
    } else {
      configureScope((scope) => {
        scope.setUser({
          id: null,
          login: null,
        });
      });
    }
  } catch (error) {
    console.error(error);
    captureException(error);
  }
}

// Test if two user objects reference the same person
function usersMatch(a, b) {
  if (a && b && a.id === b.id && a.persistentToken === b.persistentToken) {
    return true;
  }
  if (!a && !b) {
    return true;
  }
  return false;
}

async function getAnonUser() {
  const api = getAPIForToken(null);
  const { data } = await api.post('users/anon');
  return data;
}

async function getSharedUser(sharedUser) {
  const api = getAPIForToken(sharedUser ? sharedUser.persistentToken : null);
  try {
    const {
      data: { user },
    } = await api.get('boot?latestProjectOnly=true');
    return user;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return undefined;
    }
    throw error;
  }
}

async function getCachedUser(sharedUser) {
  if (!sharedUser) return undefined;
  if (!sharedUser.id || !sharedUser.persistentToken) return 'error';
  const api = getAPIForToken(sharedUser.persistentToken);
  try {
    const { data } = await api.get(`users/${sharedUser.id}`);
    if (!usersMatch(sharedUser, data)) {
      return 'error';
    }
    return data;
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      // 401 means our token is bad, 404 means the user doesn't exist
      return 'error';
    }
    throw error;
  }
}

async function fixSharedUser(sharedUser) {
  const newSharedUser = await getSharedUser(sharedUser);
  console.log(`Fixed shared cachedUser from ${sharedUser.id} to ${newSharedUser && newSharedUser.id}`);
  addBreadcrumb({
    level: 'info',
    message: `Fixed shared cachedUser. Was ${JSON.stringify(sharedUser)}`,
  });
  addBreadcrumb({
    level: 'info',
    message: `New shared cachedUser: ${JSON.stringify(newSharedUser)}`,
  });
  captureMessage('Invalid cachedUser');
  return newSharedUser;
}

async function load(initState) {
  const nextState = { ...initState };

  // If we're signed out create a new anon user
  if (!nextState.sharedUser) {
    nextState.sharedUser = await getAnonUser();
  }

  // Check if we have to clear the cached user
  if (!usersMatch(nextState.sharedUser, nextState.cachedUser)) {
    nextState.cachedUser = undefined;
  }

  const newCachedUser = await getCachedUser(nextState.sharedUser);
  if (newCachedUser === 'error') {
    // Looks like our sharedUser is bad, make sure it wasn't changed since we read it
    // Anon users get their token and id deleted when they're merged into a user on sign in
    // If it did change then quit out and let componentDidUpdate sort it out

    if (usersMatch(initState.sharedUser, nextState.sharedUser)) {
      // The user wasn't changed, so we need to fix it
      nextState.sharedUser = await fixSharedUser(initState.sharedUser);
    }
  } else {
    // The shared user is good, store it
    nextState.cachedUser = newCachedUser;
  }
  return nextState;
}

const { slice, reducer, actions } = createSlice({
  slice: 'currentUser',
  initialState: {
    // sharedUser syncs with the editor and is authoritative on id and persistentToken
    sharedUser: readFromStorage('cachedUser') || null,
    // cachedUser mirrors GET /users/{id} and is what we actually display
    cachedUser: readFromStorage('community-cachedUser') || null,
    // states: init | loading | ready
    loadStatus: 'init',
  },
  reducers: {
    requestedLoad: (state) => ({
      ...state,
      loadStatus: 'loading',
    }),
    loaded: (state, { payload }) => ({
      ...state,
      ...payload,
      loadStatus: 'ready',
    }),
    loggedIn: (state, { payload }) => ({
      ...state,
      sharedUser: payload,
      cachedUser: undefined,
      loadStatus: 'loading',
    }),
    updated: (state, { payload }) => ({
      ...state,
      cachedUser: {
        ...state.cachedUser,
        ...payload,
      },
      loadStatus: 'ready',
    }),
    storageChanged: (state, { payload }) => ({
      ...state,
      sharedUser: payload,
      cachedUser: undefined,
      loadStatus: 'loading',
    }),
    loggedOut: (state) => ({
      ...state,
      sharedUser: null,
      cachedUser: null,
    }),
  },
});

const selectCurrentUser = (state) => state.currentUser;

const handleLoadRequest = afterReducer(matchTypes(actions.requestedLoad), async (store, action, prevState) => {
  const prevUser = selectCurrentUser(prevState);
  // prevent multiple 'load's from running
  if (prevUser.loadStatus === 'loading') return;

  const result = await load(selectCurrentUser(store.getState()));
  store.dispatch(actions.loaded(result));
});

const trackUserChanges = afterReducer(matchTypes(actions.loaded), (store, action, prevState) => {
  const prevUser = selectCurrentUser(prevState);
  const { cachedUser } = selectCurrentUser(store.getState());
  if (!usersMatch(prevUser.cachedUser, cachedUser)) {
    identifyUser(cachedUser);
  }
});

const persistToStorage = afterReducer(matchAlways, (store, action, prevState) => {
  const prevUser = selectCurrentUser(prevState);
  const { sharedUser, cachedUser } = selectCurrentUser(store.getState());
  if (prevUser.sharedUser !== sharedUser || prevUser.cachedUser !== cachedUser) {
    writeToStorage('cachedUser', sharedUser);
    writeToStorage('community-cachedUser', cachedUser);
  }
});

const updateUserOnStorageChange = (store) => {
  subscribeToStorageChanges('cachedUser', (sharedUser) => store.dispatch(actions.storageChanged(sharedUser)));
  return (next) => (action) => next(action);
};

const loadUserAfterLogin = afterReducer(matchTypes(actions.loggedIn, actions.storageChanged), async (store, action) => {
  const sharedUser = action.payload;
  const cachedUser = await getCachedUser(sharedUser);
  store.dispatch(actions.updated({ cachedUser }));
});

export const currentUserSlice = {
  slice,
  reducer,
  middleware: [handleLoadRequest, trackUserChanges, persistToStorage, updateUserOnStorageChange, loadUserAfterLogin],
};

export function useCurrentUser() {
  const { sharedUser, cachedUser, loadStatus } = useSelector(selectCurrentUser);
  const boundActions = useActions(actions);
  return {
    currentUser: { ...defaultUser, ...sharedUser, ...cachedUser },
    persistentToken: sharedUser && sharedUser.persistentToken,
    fetched: loadStatus === 'ready',
    reload: boundActions.requestedLoad,
    login: boundActions.loggedIn,
    update: boundActions.updated,
    clear: boundActions.loggedOut,
  };
}

export function useCurrentUserInit() {
  const { requestedLoad } = useActions(actions);
  useEffect(() => {
    requestedLoad();
  }, []);
}

export function normalizeUser(user, currentUser) {
  return user.id === (currentUser && currentUser.id) ? currentUser : user;
}

export function normalizeUsers(users, currentUser) {
  return users.map((user) => normalizeUser(user, currentUser));
}

export function normalizeProject({ users, ...project }, currentUser) {
  return { users: users ? normalizeUsers(users, currentUser) : [], ...project };
}

export function normalizeProjects(projects, currentUser) {
  return projects.map((project) => normalizeProject(project, currentUser));
}
