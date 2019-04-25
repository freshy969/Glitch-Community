import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';

import Header from 'Components/header';
import NewStuffContainer from './new-stuff';
import Footer from './footer';
import ErrorBoundary from './includes/error-boundary';
import Konami from './includes/konami';

const Layout = ({ children, searchQuery }) => (
  <div className="content">
    <Helmet title="Glitch" />
    <NewStuffContainer>
      {(showNewStuffOverlay) => <Header searchQuery={searchQuery} showNewStuffOverlay={showNewStuffOverlay} />}
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
