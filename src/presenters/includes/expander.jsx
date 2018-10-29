import React from 'react';
import PropTypes from 'prop-types';

export default class Expander extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startedExpanding: false,
      doneExpanding: false,
      scrollHeight: Infinity,
    };
    this.ref = React.createRef();
    this.updateHeight = this.updateHeight.bind(this);
  }
  
  componentDidMount() {
    this.updateHeight();
    this.ref.current.addEventListener('load', this.updateHeight, {capture: true});
    window.addEventListener('resize', this.updateHeight, {passive: true});
  }
  
  componentWillUnmount() {
    this.ref.current.removeEventListener('load', this.updateHeight, {capture: true});
    window.removeEventListener('resize', this.updateHeight, {passive: true});
  }
  
  componentDidUpdate() {
    this.updateHeight();
  }
  
  updateHeight() {
    const scrollHeight = this.ref.current.scrollHeight;
    if (scrollHeight !== this.state.scrollHeight) {
      this.setState({scrollHeight});
    }
  }
  
  expand() {
    this.updateHeight();
    this.setState({startedExpanding: true});
  }
  
  onExpandEnd(evt) {
    if (evt.propertyName === 'max-height') {
      this.setState({doneExpanding: true});
    }
  }
  
  render() {
    const {startedExpanding, doneExpanding, scrollHeight} = this.state;
    const maxHeight = startedExpanding ? scrollHeight : this.props.height;
    const style = !doneExpanding ? {maxHeight} : null;
    return (
      <div
        ref={this.ref} className="expander" style={style}
        onTransitionEnd={this.onExpandEnd.bind(this)}
      >
        {this.props.children}
        {!doneExpanding && scrollHeight > this.props.height && (
          <div className="expander-mask">
            {!startedExpanding && (
              <button
                onClick={this.expand.bind(this)}
                className="expander-button button-small button-tertiary"
              >
                Show More
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}

Expander.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.number.isRequired,
};