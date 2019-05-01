/* globals CDN_URL */
const cacheBuster = Math.floor(Math.random() * 1000);

export const DEFAULT_TEAM_AVATAR = 'https://cdn.glitch.com/55f8497b-3334-43ca-851e-6c9780082244%2Fdefault-team-avatar.svg?1503510366819';

export const getLink = ({ url }) => `/@${url}`;

export const getAvatarUrl = ({ id, hasAvatarImage, cache = cacheBuster, size = 'large' }) => {
  const customImage = `${CDN_URL}/team-avatar/${id}/${size}?${cache}`;
  return hasAvatarImage ? customImage : DEFAULT_TEAM_AVATAR;
};

export const getAvatarStyle = ({ id, hasAvatarImage, backgroundColor, cache, size }) => {
  const image = getAvatarUrl({
    id,
    hasAvatarImage,
    cache,
    size,
  });
  if (hasAvatarImage) {
    return {
      backgroundImage: `url('${image}')`,
    };
  }
  return {
    backgroundColor,
    backgroundImage: `url('${image}')`,
  };
};

export const getCoverUrl = ({ id, hasCoverImage, cache = cacheBuster, size = 'large' }) => {
  const customImage = `${CDN_URL}/team-cover/${id}/${size}?${cache}`;
  const defaultImage = 'https://cdn.glitch.com/55f8497b-3334-43ca-851e-6c9780082244%2Fdefault-cover-wide.svg?1503518400625';
  return hasCoverImage ? customImage : defaultImage;
};

export const getProfileStyle = ({ id, hasCoverImage, coverColor, cache, size }) => {
  const image = getCoverUrl({
    id,
    hasCoverImage,
    cache,
    size,
  });
  return {
    backgroundColor: coverColor,
    backgroundImage: `url('${image}')`,
  };
};

export function teamAdmins({ team }) {
  return team.users.filter((user) => team.adminIds.includes(user.id));
}

export function userIsOnTeam({ user, team }) {
  return !!user && team.users.some(({ id }) => user.id === id);
}

export function userCanJoinTeam({ user, team }) {
  team.whitelistedDomain = 'glitch.com'; // FIXME
  if (!user || !user.emails || !team.whitelistedDomain || userIsOnTeam({ user, team })) return false;
  return user.emails.some(({ email, verified }) => verified && email.endsWith(`@${team.whitelistedDomain}`));
}

export function userIsTeamAdmin({ user, team }) {
  return !!user && team.adminIds.includes(user.id);
}

export function userIsOnlyTeamAdmin({ user, team }) {
  return userIsTeamAdmin({ user, team }) && team.adminIds.length === 1;
}