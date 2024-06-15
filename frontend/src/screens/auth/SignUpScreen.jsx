import React, { useState } from 'react';
import styled from 'styled-components';
import { FormGridWrapper, FormTitle } from '../../styles/form_grid';
import { Container } from '../../styles/styles';
import { staticImages } from '../../utils/images';
import { FormElement, Input } from '../../styles/form';
import PasswordInput from '../../components/auth/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { BaseButtonBlack } from '../../styles/button';
import axios from 'axios';

const SignUpScreenWrapper = styled.section`
  form {
    margin-top: 40px;
    .form-elem-text {
      margin-top: -16px;
      display: block;
    }
  }

  .text-space {
    margin: 0 4px;
  }
`;

const SignUpScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await axios.post('http://localhost:8000/api/v1/users/register', formData);
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <SignUpScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img src={staticImages.form_img2} className="object-fit-cover" alt="" />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign Up</h3>
                <p className="text-base">
                  Sign up for free to access to a vast range of products
                </p>
              </FormTitle>
              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="name" className="form-elem-label">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    name="name"
                    className="form-elem-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <span className="form-elem-error">
                    *Required
                  </span>
                </FormElement>
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
                  <span className="form-elem-error">
                    *Required
                  </span>
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
                  <span className="form-elem-error">
                    *Required
                  </span>
                </FormElement>
                <PasswordInput fieldName="Password" name="password" value={formData.password} onChange={handleChange} />
                <span className="form-elem-text font-medium">
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols
                </span>
                <BaseButtonBlack type="submit" className="form-submit-btn">
                  Sign Up
                </BaseButtonBlack>
              </form>
              <p className="flex flex-wrap account-rel-text">
                Already have an account?
                <Link to="/sign_in" className="font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignUpScreenWrapper>
  );
};

export default SignUpScreen;
