import React, { useEffect } from 'react';

import Helmet from 'react-helmet';
import { useDevToggles } from '../includes/dev-toggles';

function useZeldaMusicalCue() {
  useEffect(() => {
    const audio = new Audio('https://cdn.glitch.com/a5a035b7-e3db-4b07-910a-b5c3ca9d8e86%2Fsecret.mp3?1535396729988');
    const maybePromise = audio.play();
    // Chrome returns a promise which we must handle:
    if (maybePromise) {
      maybePromise
        .then(() => {
          // DO-Do Do-do do-dO dO-DO
        })
        .catch(() => {
          // This empty catch block prevents an exception from bubbling up.
          // play() will fail if the user hasn't interacted with the dom yet.
          // s'fine, let it.
        });
    }
  }, []);
}

const Secret = () => {
  const { enabledToggles, toggleData, setEnabledToggles } = useDevToggles();
  useZeldaMusicalCue();

  const isEnabled = (toggleName) => enabledToggles && enabledToggles.includes(toggleName);

  const toggleTheToggle = (name) => {
    let newToggles = null;
    if (isEnabled(name)) {
      newToggles = enabledToggles.filter((enabledToggleName) => enabledToggleName !== name);
    } else {
      newToggles = enabledToggles.concat([name]);
    }
    setEnabledToggles(newToggles);
  };

  return (
    <section className="secretPage">
      <div className="filler" />
      <Helmet title="Glitch - It's a secret to everybody." />
      <ul>
        {toggleData.map(({ name, description }) => (
          <li key={name}>
            <button title={description} onClick={() => toggleTheToggle(name)} className={isEnabled(name) ? 'lit' : 'dark'}>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Secret;
