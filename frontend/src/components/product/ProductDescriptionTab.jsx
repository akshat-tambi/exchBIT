import React from "react";
import styled from "styled-components";
import { breakpoints } from "../../styles/themes/default";

const DetailsContent = styled.div`
  margin-top: 0;
  @media (max-width: ${breakpoints.lg}) {
    margin-top: 40px;
  }
`;

const DescriptionBox = styled.div`
  background-color: #f2f2f2; 
  padding: 20px;
  border-radius: 8px;
  height: 270px; 
  overflow-y: auto; 
`;

const DescriptionText = styled.p`
  margin-top: 0; 
  margin-bottom: 12px; 
`;

const ProductDescriptionTab = ({ description }) => {
  return (
    <>
      <DetailsContent>
        <DescriptionBox>
          <DescriptionText>{description}</DescriptionText>
        </DescriptionBox>
      </DetailsContent>
    </>
  );
};

export default ProductDescriptionTab;
