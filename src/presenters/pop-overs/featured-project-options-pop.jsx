import React from 'react';
import PropTypes from 'prop-types';
import PopoverContainer from './popover-container.jsx';
import {CurrentUserConsumer} from '../current-user.jsx';
import PopoverButton from './popover-button';

// Project Options Pop
const FeaturedProjectOptionsPop = ({featuredProjectId, ...props} ) => {
  
  function animateThenUnfeature(){
    console.log('animateThenUnfeature');
    // animation stuff
    const featuredContainer = document.getElementById('featured-project-embed');
    featuredContainer.classList.add('slide-down');
    props.togglePopover();
    props.unfeatureProject(featuredProjectId);
    // should do some updating here
  }
  
  return(
    <dialog className="pop-over project-options-pop">
      <section className="pop-over-actions">
        <PopoverButton onClick={animateThenUnfeature} text="Unfeature" emoji="arrow-down"/>
      </section>
    </dialog>
  );
};

FeaturedProjectOptionsPop.propTypes = {
  api: PropTypes.any,
  currentUser: PropTypes.object,
  togglePopover: PropTypes.func.isRequired,
  project: PropTypes.object,
};


// Project Options Container
// create as stateful react component
export default function FeaturedProjectOptions({projectOptions={}, featuredProjectId,}, {...props}) {

  return (
    <PopoverContainer>
      {({togglePopover, visible}) => (
        <CurrentUserConsumer>
          {user => (
            <div>
              <button className="project-options button-borderless opens-pop-over" onClick={togglePopover}> 
                <div className="down-arrow" />
              </button>
              { visible && <FeaturedProjectOptionsPop {...props} {...projectOptions} featuredProjectId={featuredProjectId} togglePopover={togglePopover}/> }
            </div>
          )}
        </CurrentUserConsumer>
      )}
    </PopoverContainer>     
  );
}

FeaturedProjectOptions.propTypes = {
  api: PropTypes.func,
  project: PropTypes.object,
};

