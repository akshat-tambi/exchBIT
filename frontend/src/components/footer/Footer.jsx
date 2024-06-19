import styled from "styled-components";
import { Link } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const FooterWrapper = styled.footer`
  padding-top: 60px;
  padding-bottom: 32px;
  background-color: #333;
  color: #fff;

  @media (max-width: ${breakpoints.lg}) {
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .footer-bottom {
    padding-top: 36px;
    border-top: 1px solid rgba(190, 188, 189, 0.4);

    @media (max-width: ${breakpoints.lg}) {
      padding-top: 20px;
    }
  }
`;

const Footer = () => {
  return (
    <FooterWrapper className="bg-outerspace">
      <center>
        <p className="text-base text-white">
          Copyright &copy; 2024 &nbsp;
          <Link to="/" className="text-white">
            exchBIT
          </Link>
          &nbsp;. All rights reserved.
        </p>
      </center>
    </FooterWrapper>
  );
};

export default Footer;
