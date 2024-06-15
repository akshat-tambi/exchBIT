import React, { useState } from 'react';
import styled from 'styled-components';
import { FormElement, Input } from '../../styles/form';
import { PropTypes } from 'prop-types';

const PasswordToggleButton = styled.button`
  position: absolute;
  bottom: 100%;
  right: 0;

  .pwd-toggle-text {
    padding-left: 5px;
  }
`;

const PasswordInput = ({ fieldName, name, value, onChange, errorMsg }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <FormElement>
      <label htmlFor={name} className="form-elem-label">
        {fieldName}
      </label>
      <div className="form-elem-block">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder=""
          name={name}
          className="form-elem-control"
          value={value}
          onChange={onChange}
        />
        <PasswordToggleButton
          type="button"
          className="pwd-value-toggle flex items-center"
          onClick={togglePassword}
        >
          {showPassword ? (
            <>
              <i className="bi bi-eye-fill"></i>
              <span className="pwd-toggle-text text-sm">Hide</span>
            </>
          ) : (
            <>
              <i className="bi bi-eye-slash-fill"></i>
              <span className="pwd-toggle-text text-sm">Show</span>
            </>
          )}
        </PasswordToggleButton>
      </div>
      {errorMsg && <span className="form-elem-error text-end font-medium">{errorMsg}</span>}
    </FormElement>
  );
};

PasswordInput.propTypes = {
  fieldName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
};

export default PasswordInput;
