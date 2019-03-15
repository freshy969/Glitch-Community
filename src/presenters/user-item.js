import PropTypes from 'prop-types';
import React from 'react';

import { TruncatedMarkdown } from './includes/markdown';
import { Thanks } from './includes/thanks';
import WrappingLink from './includes/wrapping-link';

import { ANON_AVATAR_URL, getAvatarUrl, getLink, getProfileStyle } from '../models/user';

function addDefaultSrc(event) {
  event.target.src = ANON_AVATAR_URL; // eslint-disable-line
}

export default function UserItem({ user }) {
  const style = getProfileStyle({ ...user, size: 'medium' });
  return (
    <WrappingLink href={getLink(user)} className="item button-area">
      <>
        <div className="cover" style={style} />
        <div className="content">
          <img onError={addDefaultSrc} className="avatar" src={getAvatarUrl(user)} alt="" />
          <div className="information">
            {user.name ? (
              <>
                <div className="button">{user.name}</div>
                <p className="name">@{user.login}</p>
              </>
            ) : (
              <div className="button">@{user.login}</div>
            )}
            {!!user.description && (
              <p className="description">
                <TruncatedMarkdown length={96}>{user.description}</TruncatedMarkdown>
              </p>
            )}
            {user.thanksCount > 0 && <Thanks count={user.thanksCount} />}
          </div>
        </div>
      </>
    </WrappingLink>
  );
}

UserItem.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    coverColor: PropTypes.string,
    description: PropTypes.string,
    hasCoverImage: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    login: PropTypes.string.isRequired,
    name: PropTypes.string,
    thanksCount: PropTypes.number.isRequired,
  }).isRequired,
};
