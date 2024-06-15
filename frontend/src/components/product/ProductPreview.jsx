import React, { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const lightLineColor = "83, 178, 172"; // RGB values for the light line color

const ProductPreviewWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;

  @media (max-width: ${breakpoints.xl}) {
    gap: 16px;
  }

  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: 42px auto;
  }

  @media (max-width: ${breakpoints.xs}) {
    grid-template-columns: 100%;
  }
`;

const PreviewItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: row;
    justify-content: center;
  }
`;

const PreviewItemWrapper = styled.div`
  width: 70px;
  height: 70px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: ${defaultTheme.default_transition};

  @media (max-width: ${breakpoints.sm}) {
    width: 40px;
    height: 40px;
  }

  &:hover {
    .preview-item {
      border: 1px solid rgba(${lightLineColor}, 0.7); /* Light line outline on hover */
    }
  }

  .preview-item {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid transparent; /* Initially no border */
    transition: border-color ${defaultTheme.default_transition};

    @media (hover: none) {
      border: 1px solid transparent; /* No border on devices that don't support hover */
    }
  }
`;

const PreviewDisplay = styled.div`
  width: 100%;
  height: auto;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(${lightLineColor}, 0.3); /* Thin light line outline */
  transition: border-color ${defaultTheme.default_transition};
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 8px; /* Rounded corners for larger preview */
    border: 1px solid transparent; /* Initially no border */
    transition: border-color ${defaultTheme.default_transition};
  }

  @media (max-width: ${breakpoints.sm}) {
    height: 400px;
  }

  @media (max-width: ${breakpoints.xs}) {
    height: 320px;
  }
`;

const ProductPreview = ({ previewImages }) => {
  const [activePreviewImage, setActivePreviewImage] = useState(
    previewImages.length > 0 ? previewImages[0] : ""
  );

  const handlePreviewImageChange = (previewImage) => {
    setActivePreviewImage(previewImage);
  };

  return (
    <ProductPreviewWrapper>
      <PreviewItems>
        {previewImages.map((previewImage, index) => (
          <PreviewItemWrapper
            key={index}
            onClick={() => handlePreviewImageChange(previewImage)}
          >
            <img
              src={previewImage}
              alt={`Preview ${index}`}
              className="preview-item"
            />
          </PreviewItemWrapper>
        ))}
      </PreviewItems>
      <PreviewDisplay>
        <img
          src={activePreviewImage}
          alt="Active Preview"
        />
      </PreviewDisplay>
    </ProductPreviewWrapper>
  );
};

ProductPreview.propTypes = {
  previewImages: PropTypes.arrayOf(PropTypes.string.isRequired),
};

export default ProductPreview;
