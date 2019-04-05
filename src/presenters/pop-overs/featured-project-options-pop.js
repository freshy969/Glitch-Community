import React from 'react';
import PropTypes from 'prop-types';
import PopoverContainer from './popover-container';
import PopoverButton from './popover-button';

// Project Options Container
// create as stateful react component
export default function FeaturedProjectOptionsPop({ unfeatureProject }) {
  function animateThenUnfeature(togglePopover) {
    const featuredContainer = document.getElementById('featured-project-embed');
    featuredContainer.classList.add('slide-down');
    togglePopover();
    unfeatureProject();
  }

  return (
    <PopoverContainer>
      {({ togglePopover, visible }) => (
        <div>
          <button className="project-options button-borderless featured-project-options-pop" onClick={togglePopover}>
            <div className="down-arrow" />
          </button>
          {visible && (
            <dialog className="pop-over project-options-pop">
              <section className="pop-over-actions">
                <PopoverButton onClick={() => animateThenUnfeature(togglePopover)} text="Un-feature" emoji="arrow-down" />
              </section>
            </dialog>
          )}
        </div>
      )}
    </PopoverContainer>
  );
}

FeaturedProjectOptionsPop.propTypes = {
  unfeatureProject: PropTypes.func.isRequired,
};
