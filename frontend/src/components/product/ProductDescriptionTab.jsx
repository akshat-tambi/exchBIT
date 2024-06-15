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
  background-color: #f2f2f2; /* Slightly darker color */
  padding: 20px;
  border-radius: 8px;
  height: 270px; /* Fixed height */
  overflow-y: auto; /* Enable vertical scrolling if content exceeds height */
`;

const DescriptionText = styled.p`
  margin-top: 0; /* Remove default margin */
  margin-bottom: 12px; /* Adjust margin as needed */
`;

const ProductDescriptionTab = ({ description }) => {
  return (
    <>
      <DetailsContent>
        <DescriptionBox>
          <DescriptionText>{description}</DescriptionText>
        </DescriptionBox>
        {/* Additional content or specifications can be added here */}
      </DetailsContent>
    </>
  );
};

export default ProductDescriptionTab;
