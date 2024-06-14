import React from "react";
import styled from "styled-components";
import Title from "../common/Title";
import { ContentStylings } from "../../styles/styles";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const DetailsContent = styled.div`
  margin-top: 0;
  @media (max-width: ${breakpoints.lg}) {
    margin-top: 40px;
  }
`;

const DescriptionText = styled.p`
  margin-top: 12px; /* Adjust margin as needed */
`;

const ProductDescriptionTab = ({ description }) => {
  return (
    <>
    
    <DetailsContent>
      <DescriptionText>{description}</DescriptionText>
      
      {/* Additional content or specifications can be added here */}
    </DetailsContent>
    </>
  );
};

export default ProductDescriptionTab;
