import React, { useState, useEffect } from 'react';
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
import LoadingScreen from '../../components/loadingScreen/LoadingScreen';
import { useDispatch, useSelector } from 'react-redux';
import { toggle } from "../../redux/slices/loginStatusSlice"; 

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
  const dispatch=useDispatch();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 

    try {
      

      const response = await axios.post('/api/v1/users/logging', formData, {
        withCredentials: true,
      });

      alert(response.data.message);
      dispatch(toggle());
      navigate('/');
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      
      setIsSubmitting(false); 
    }
  };

  return (
    <SignInScreenWrapper>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <FormGridWrapper>
          <Container>
            <div className="form-grid-content">
              <div className="form-grid-left">
                <img src={staticImages.hostel1} className="object-fit-cover" alt="" />
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
                  <BaseButtonBlack type="submit" className="form-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
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
      )}
    </SignInScreenWrapper>
  );
};

export default SignInScreen;
