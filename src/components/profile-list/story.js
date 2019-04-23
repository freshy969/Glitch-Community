import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import ProfileList from './profile-list';

const ProfileListWrap = ({ children }) => <div style={{ width: '25%' }}>{children}</div>;

const team = {
  backgroundColor: 'rgb(116,236,252)',
  coverColor: 'rgb(12,84,124)',
  hasCoverImage: true,
  name: 'Glitch',
  id: 74,
};

const users = {
  modernserf: {
    id: 271885,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/560e4b07-a70b-4f87-b8d4-699d738792d0-large.jpg',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/560e4b07-a70b-4f87-b8d4-699d738792d0-small.jpg',
    login: 'modernserf',
    name: 'Justin Falcone',
    location: 'Brooklyn, NY',
    color: '#ea6996',
    description:
      'programmer & writer\n\n[🐦](https://twitter.com/modernserf) [🐙](https://github.com/modernserf) [🏠](https://justinfalcone.com) [☄](http://pronoun.is/they/.../themselves)',
    hasCoverImage: true,
    coverColor: 'rgb(84,138,53)',
    thanksCount: 1,
    utcOffset: -240,
    featuredProjectId: '22a883dc-a45d-4257-b44c-a43b6b8cabe9',
  },
  pirijan: {
    id: 2,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/2ea4260e-b6aa-4b23-b867-503fdcdf175d-large.png',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/2ea4260e-b6aa-4b23-b867-503fdcdf175d-small.png',
    login: 'pirijan',
    name: 'Pirijan',
    location: 'New York',
    color: '#f2c48c',
    description:
      'I make the interface of Glitch. Here are some [tweets](https://twitter.com/pketh), some [words](http://pketh.org), and some [feels](http://frogfeels.com). (cover by [mushbuh](https://twitter.com/mushbuh/status/940675887116173312))',
    hasCoverImage: true,
    coverColor: 'rgb(4,4,4)',
    thanksCount: 21,
    utcOffset: -240,
    featuredProjectId: null,
  },
  whimsicallyson: {
    id: 9,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/096df579-e72b-44df-8469-cd93f8edae48-large.png',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/096df579-e72b-44df-8469-cd93f8edae48-small.png',
    login: 'whimsicallyson',
    name: 'allyson',
    location: 'Pittsburgh, PA',
    color: '#d8adf7',
    description: 'this is my profile field',
    hasCoverImage: false,
    coverColor: 'rgb(37,15,14)',
    thanksCount: 6,
    utcOffset: -240,
    featuredProjectId: null,
  },
  _gw: {
    id: 11,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/755fa7c0-ae97-4782-9b54-5e49b95e053f-large.png',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/755fa7c0-ae97-4782-9b54-5e49b95e053f-small.png',
    login: '_gw',
    name: 'Gareth',
    location: null,
    color: '#8bf9cf',
    description:
      '1x developer turned evil marketer. working on [glitch](https://glitch.com). curate [devrel.io](https://devrel.io). [🤳🏼.ws](http://🤳🏼.ws)',
    hasCoverImage: true,
    coverColor: 'rgb(156,28,236)',
    thanksCount: 186,
    utcOffset: 60,
    featuredProjectId: 'd2baacc0-73e4-4fb1-8fad-a682accdc36a',
  },
  TimKingtonFC: {
    id: 18,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/5a52db65-0d61-4adc-9109-cd3809fca27e-large.png',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/5a52db65-0d61-4adc-9109-cd3809fca27e-small.png',
    login: 'TimKingtonFC',
    name: 'Tim Kington',
    location: null,
    color: '#aef28c',
    description: 'I work at Glitch.',
    hasCoverImage: true,
    coverColor: 'rgb(81,78,66)',
    thanksCount: 16,
    utcOffset: -240,
    featuredProjectId: null,
  },
  anildash: {
    id: 21,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/cb0f7d08-d1e4-47de-be5c-b75d5f122135-large.png',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/cb0f7d08-d1e4-47de-be5c-b75d5f122135-small.png',
    login: 'anildash',
    name: 'Anil Dash',
    location: 'NYC',
    color: '#f9bbd4',
    description: "I'm the CEO of 🎏 Glitch! And I am fighting for more ethical, humane and just tech. https://anildash.com/",
    hasCoverImage: true,
    coverColor: 'rgb(4,12,10)',
    thanksCount: 18,
    utcOffset: -240,
    featuredProjectId: 'f0e649a1-3610-45f3-885a-217df0379e77',
  },
  Greg: {
    id: 97325,
    avatarUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/78e39bd1-b5b0-4393-8b3a-1b12867d7fb4-large.jpg',
    avatarThumbnailUrl: 'https://s3.amazonaws.com/production-assetsbucket-8ljvyr1xczmb/user-avatar/78e39bd1-b5b0-4393-8b3a-1b12867d7fb4-small.jpg',
    login: 'Greg',
    name: 'Greg Weil',
    location: null,
    color: '#bfeeff',
    description: '_Hi!_',
    hasCoverImage: false,
    coverColor: 'rgb(148,76,52)',
    thanksCount: 11,
    utcOffset: -240,
    featuredProjectId: '89ad7cb1-b44e-4e54-a61b-74eff6677de5',
  },
};

const usersList = Object.values(users);

storiesOf('ProfileList', module)
  .add('loading', () => (
    <ProfileListWrap>
      <ProfileList users={[]} />
    </ProfileListWrap>
  ))
  .add('row', () => (
    <ProfileListWrap>
      <ProfileList layout="row" teams={[team]} users={usersList} />
    </ProfileListWrap>
  ))
  .add('grid', () => (
    <ProfileListWrap>
      <ProfileList layout="grid" teams={[team]} users={usersList} />
    </ProfileListWrap>
  ))
  .add('glitchTeam', () => (
    <ProfileListWrap>
      <ProfileList layout="grid" glitchTeam teams={[team]} users={usersList} />
    </ProfileListWrap>
  ));
