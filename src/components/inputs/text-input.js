import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { pickBy } from 'lodash';

import InputErrorMessage from './input-error-message';
import InputErrorIcon from './input-error-icon';
import useUniqueId from '../../hooks/use-unique-id';

import styles from './text-input.styl';
import { visuallyHidden } from '../global.styl';

const TYPES = ['email', 'password', 'search', 'text'];

const InputPart = ({ children, className }) => (
  <span className={classNames(styles.inputPart, className)}>{children}</span>
);

const TextInput = ({
  autoFocus,
  className,
  disabled,
  error,
  labelText,
  maxLength,
  name,
  onChange,
  opaque,
  placeholder,
  postfix,
  prefix,
  type,
  value,
  ...props
}) => {
  const uniqueId = useUniqueId();
  const outerClassName = classNames(className, styles.outer);
  const borderClassName = classNames(styles.inputBorder, {
    [styles.underline]: !opaque,
    [styles.opaque]: opaque,
  });
  const inputClassName = classNames(styles.inputPart, styles.input, {
    [styles.search]: type === 'search',
  });
  const eventProps = pickBy(props, (_, key) => key.startsWith('on'));
  return (
    <label className={outerClassName} htmlFor={uniqueId}>
      <span className={visuallyHidden}>{labelText}</span>
      <span className={borderClassName}>
        {!!prefix && <InputPart>{prefix}</InputPart>}
        <input
          {...eventProps}
          autoFocus={autoFocus} // eslint-disable-line jsx-a11y/no-autofocus
          className={inputClassName}
          disabled={disabled}
          id={uniqueId}
          maxLength={maxLength}
          name={name}
          onChange={(evt) => onChange(evt.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {!!error && (
          <InputPart className={styles.errorIcon}>
            <InputErrorIcon />
          </InputPart>
        )}
        {!!postfix && <InputPart>{postfix}</InputPart>}
      </span>
      {!!error && <InputErrorMessage>{error}</InputErrorMessage>}
    </label>
  );
};

TextInput.propTypes = {
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.node,
  labelText: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  opaque: PropTypes.bool,
  placeholder: PropTypes.string,
  postfix: PropTypes.node,
  prefix: PropTypes.node,
  type: PropTypes.oneOf(TYPES),
  value: PropTypes.string.isRequired,
};

TextInput.defaultProps = {
  autoFocus: false,
  className: '',
  disabled: false,
  error: null,
  maxLength: undefined,
  name: undefined,
  opaque: false,
  placeholder: undefined,
  postfix: null,
  prefix: null,
  type: 'text',
};

export default TextInput;
