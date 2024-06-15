import React, { useState } from 'react';
import styled from 'styled-components';
import { FormGridWrapper, FormTitle } from '../../styles/form_grid';
import { Container } from '../../styles/styles';
import { staticImages } from '../../utils/images';
import { FormElement, Input } from '../../styles/form';
import PasswordInput from '../../components/auth/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { BaseButtonBlack } from '../../styles/button';
import { breakpoints, defaultTheme } from '../../styles/themes/default';
import axios from 'axios';

const SignInScreenWrapper = styled.section`
  .form-separator {
    margin: 32px 0;
    column-gap: 18px;

    @media (max-width: ${breakpoints.lg}) {
      margin: 24px 0;
    }

    .separator-text {
      border-radius: 50%;
      min-width: 36px;
      height: 36px;
      background-color: ${defaultTheme.color_purple};
      position: relative;
    }

    .separator-line {
      width: 100%;
      height: 1px;
      background-color: ${defaultTheme.color_platinum};
    }
  }

  .form-elem-text {
    margin-top: -16px;
    display: block;
  }
`;

const SignInScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(formData);
        const response = await axios.post('http://localhost:8000/api/v1/users/logging', formData, {
            withCredentials: true, // Ensure cookies are sent with the request
        });

        alert(response.data.message);
        navigate('/');
    } catch (error) {
        alert(error.response.data.message);
    }
};


  return (
    <SignInScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img src={staticImages.form_img1} className="object-fit-cover" alt="" />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign In</h3>
                <span className="separator-line"></span>
              </FormTitle>
              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="username" className="form-elem-label">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    name="username"
                    className="form-elem-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </FormElement>
                <FormElement>
                  <label htmlFor="email" className="form-elem-label">
                    Email Id
                  </label>
                  <Input
                    type="email"
                    placeholder=""
                    name="email"
                    className="form-elem-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </FormElement>
                <PasswordInput
                  fieldName="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <BaseButtonBlack type="submit" className="form-submit-btn">
                  Sign In
                </BaseButtonBlack>
              </form>
              <p className="flex flex-wrap account-rel-text">
                Don't have an account?
                <Link to="/sign_up" className="font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignInScreenWrapper>
  );
};

export default SignInScreen;
