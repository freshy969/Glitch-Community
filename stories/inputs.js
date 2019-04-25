import React from 'react';
import { storiesOf } from '@storybook/react';
import 'Components/global.styl';

import TextInput from 'Components/inputs/text-input';
import TextArea from 'Components/inputs/text-area';
import WrappingTextInput from 'Components/inputs/wrapping-text-input';
import MarkdownInput from 'Components/inputs/markdown-input';

import OptimisticTextInput from 'Components/fields/optimistic-text-input';
import OptimisticMarkdownInput from 'Components/fields/optimistic-markdown-input';
import ProjectDomainInput from 'Components/fields/project-domain-input';
import TeamNameInput from 'Components/fields/team-name-input';
import TeamUrlInput from 'Components/fields/team-url-input';
import UserNameInput from 'Components/fields/user-name-input';
import UserLoginInput from 'Components/fields/user-login-input';

import Note from 'Components/collection/note';

import { pickRandom } from './data';
import { withState } from './util';

const inputStory = storiesOf('Input Fields', module);

const useDirectInputProps = (error) => {
  const [value, setValue] = React.useState('');
  const onChange = (newValue) => {
    setValue(newValue);
  };
  return { error, onChange, value };
};

const GenericTextInputs = () => {
  const [showError, setShowError] = React.useState(false);
  const error = showError ? "Nope, that won't do" : null;
  const singleLineProps = useDirectInputProps(error);
  const multiLineProps = useDirectInputProps(error);
  return (
    <div style={{ maxWidth: '400px' }}>
      <p><TextInput {...singleLineProps} placeholder="A generic text input" /></p>
      <p><TextInput {...singleLineProps} prefix="#" postfix="#" placeholder="A generic input with a prefix and postfix" /></p>
      <p><TextInput {...singleLineProps} type="search" opaque={true} search={true} placeholder="Generic input styled like a search box" /></p>
      <p><WrappingTextInput {...singleLineProps} placeholder="This is a single line text input that wraps" /></p>
      <p><TextArea {...multiLineProps} placeholder="This is a multiline text area" /></p>
      <p><MarkdownInput {...multiLineProps} placeholder="This text area renders as markdown when it isn't focused" /></p>
      <p><label><input type="checkbox" checked={showError} onChange={(evt) => setShowError(evt.target.checked)} /> show an error</label></p>
    </div>
  );
};

inputStory.add('generic', () => <GenericTextInputs />);

const useOptimisticProps = (name) => {
  const [value, setValue] = React.useState('');
  const onChange = async (newValue) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (newValue === 'error') {
      throw 'error is no good!';
    }
    setValue(newValue);
  };
  return { onChange, [name]: value };
};

const ProperTextInputs = () => {
  return (
    <div style={{ maxWidth: '400px' }}>
      <p><OptimisticTextInput {...useOptimisticProps('value')} placeholder="Live field, type error to get an error" /></p>
      <p><OptimisticMarkdownInput {...useOptimisticProps('value')} placeholder="Live markdown, type error to get an error" /></p>
      <p>Project domain <ProjectDomainInput {...useOptimisticProps('domain')} /></p>
      <p>Team name <TeamNameInput {...useOptimisticProps('name')} /></p>
      <p>Team url <TeamUrlInput {...useOptimisticProps('url')} /></p>
      <p>User name <UserNameInput {...useOptimisticProps('name')} /></p>
      <p>User login <UserLoginInput {...useOptimisticProps('login')} /></p>
    </div>
  );
};

inputStory.add('optimistic', () => <ProperTextInputs />);

storiesOf('Note', module)
  .add('when authorized', 
  withState({
    note: "this note you own and thus you can edit if you so desire. As you type updates are called to ping the server with the latest, open the console to see when things fire off",
    isAddingANewNote: true
  }, ({ state, setState }) => (
    <Note
      collection={{
        coverColor: "#bfabf2",
        user: pickRandom("users"),
      }}
      project={state}
      updateNote={async (note) => {
        setState({ note });
        await new Promise((resolve) => setTimeout(resolve(note), 300));
      }}
      hideNote={() => setState({ isAddingANewNote: false })}
      isAuthorized={true}
    />
  )))
  // .add('empty state', () => (
  //   <Note
  //     collection={{
  //       coverColor: "#bfabf2",
  //       user: pickRandom("users"),
  //     }}
  //     project={{
  //       note: "",
  //       isAddingANewNote: true
  //     }}
  //     updateNote={mockUpdateNote}
  //     hideNote={mockHideNote}
  //     isAuthorized={true}
  //   />
  // ))
  // .add('when unauthorized', () => (
  //   <Note
  //     collection={{
  //       coverColor: "#bfabf2",
  //       user: pickRandom("users"),
  //     }}
  //     project={{
  //       note: "this note you do not own, you can not edit it, you can not hide it"
  //     }}
  //     updateNote={mockUpdateNote}
  //     hideNote={mockHideNote}
  //     isAuthorized={false}
  //   />
  // ))
  // .add('dark notes', () => (
  //   <Note
  //     collection={{
  //       coverColor: "#000000",
  //       user: pickRandom("users"),
  //     }}
  //     project={{
  //       note: "text color is lightened for dark backgrounds"
  //     }}
  //     updateNote={mockUpdateNote}
  //     hideNote={mockHideNote}
  //     isAuthorized={true}
  //   />
  // ));