import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Emoji from 'Components/images/emoji';
import styles from './button.styl';
import { Link } from '../../presenters/includes/link';

const cx = classNames.bind(styles);

export const TYPES = ['tertiary', 'cta', 'dangerZone', 'dropDown'];
export const SIZES = ['small'];

/**
 * Button Component
 */

const Button = ({ onClick, href, disabled, type, size, matchBackground, hover, children, active }) => {
  const className = cx({
    btn: true,
    cta: type === 'cta',
    small: size === 'small' || type === 'dangerZone', // we want to demphasize dangerous actions, so we make them small
    tertiary: ['tertiary', 'dangerZone'].includes(type),
    dangerZone: type === 'dangerZone',
    unstyled: type === 'dropDown',
    hasEmoji: React.Children.toArray(children).some((child) => child.type && child.type === Emoji),
    matchBackground: matchBackground === true,
    active,
    hover,
  });

  return href
    ? <Link to={href} className={className}>{children}</Link>
    : <button onClick={onClick} className={className} disabled={disabled}>{children}</button>;
};

Button.propTypes = {
  /** element(s) to display in the button */
  children: PropTypes.node.isRequired,
  /** callback when button clicked */
  onClick: (props, propName, componentName) => {
    if (!props.onClick && !props.href) {
      return new Error(`One of props 'onClick' or 'href' was not specified in '${componentName}'.`);
    }
    return null;
  },
  /** OR link when button clicked */
  href: (props, propName, componentName) => {
    if (!props.onClick && !props.href) {
      return new Error(`One of props 'href' or 'onClick' was not specified in '${componentName}'.`);
    }
    return null;
  },
  /** button disabled */
  disabled: PropTypes.bool,
  /** type of button */
  type: PropTypes.oneOf(TYPES),
  /** size of button */
  size: PropTypes.oneOf(SIZES),
  /** whether or not the button's hover state should be active */
  hover: PropTypes.bool,
  /** whether or not the button should match its background */
  matchBackground: PropTypes.bool,
  /** whether the button is active or not */
  active: PropTypes.bool,
};

Button.defaultProps = {
  onClick: null,
  href: null,
  disabled: false,
  type: null,
  size: null,
  hover: false,
  matchBackground: false,
  active: false,
};

export default Button;
