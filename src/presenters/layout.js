import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';

import Header from 'Components/header';
import Footer from 'Components/footer';
import NewStuffContainer from './overlays/new-stuff';
import ErrorBoundary from './includes/error-boundary';
import Konami from './includes/konami';

const Layout = ({ children, searchQuery }) => (
  <div className="content">
    <Helmet title="Glitch" />
    <NewStuffContainer>
      {(showNewStuffOverlay) => (
        <div className="header-wrap">
          <Header searchQuery={searchQuery} showNewStuffOverlay={showNewStuffOverlay} />
        </div>
      )}
    </NewStuffContainer>
    <ErrorBoundary>{children}</ErrorBoundary>
    <Footer />
    <ErrorBoundary fallback={null}>
      <Konami>
        <Redirect to="/secret" push />
      </Konami>
    </ErrorBoundary>
  </div>
);
Layout.propTypes = {
  children: PropTypes.node.isRequired,
  searchQuery: PropTypes.string,
};
Layout.defaultProps = {
  searchQuery: '',
};

export default Layout;
