import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Breadcrumb from "../../components/common/Breadcrumb";
import ProductPreview from "../../components/product/ProductPreview";
import ProductDescriptionTab from "../../components/product/ProductDescriptionTab";
import ProductDescriptionMedia from "../../components/product/ProductDescriptionMedia";
import Title from "../../components/common/Title";
import ProductSimilar from "../../components/product/ProductSimilar";
import { getProductById } from "../../services/productService";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useParams } from "react-router-dom";
import { currencyFormat } from "../../utils/helper";

const DetailsScreenWrapper = styled.main`
  margin: 40px 20px; /* Adjusted margin */
`;

const DetailsContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 40px;

  @media (max-width: ${breakpoints.xl}) {
    gap: 24px;
    grid-template-columns: 3fr 1px 2fr;
  }

  @media (max-width: ${breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${defaultTheme.color_silver};
`;

const ProductDetailsWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px;

  .prod-title {
    margin-bottom: 20px; /* Increased margin */
  }

  .rating-and-comments {
    column-gap: 16px;
    margin-bottom: 20px;
  }

  .prod-rating {
    column-gap: 10px;
  }

  .prod-comments {
    column-gap: 10px;
  }
`;

const ProductSizeWrapper = styled.div`
  .prod-size-top {
    gap: 20px;
  }

  .prod-size-list {
    gap: 12px;
    margin-top: 16px;
  }

  .prod-size-item {
    position: relative;
    height: 38px;
    width: 38px;
    cursor: pointer;

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 38px;
      height: 38px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        color: ${defaultTheme.color_white};
        background-color: ${defaultTheme.color_outerspace};
        border-color: ${defaultTheme.color_outerspace};
      }
    }

    span {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1.5px solid ${defaultTheme.color_silver};
      text-transform: uppercase;
    }
  }
`;




const ProductColorWrapper = styled.div`
  margin-top: 32px;

  .prod-colors-top {
    margin-bottom: 16px;
  }

  .prod-colors-list {
    column-gap: 12px;
  }

  .prod-colors-item {
    position: relative;
    width: 22px;
    height: 22px;
    transition: ${defaultTheme.default_transition};

    &:hover {
      scale: 0.9;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        outline: 1px solid ${defaultTheme.color_gray};
        outline-offset: 3px;
      }
    }

    .prod-colorbox {
      border-radius: 100%;
      width: 22px;
      height: 22px;
      display: inline-block;
    }
  }
`;

const ProductDetailsScreen = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <DetailsScreenWrapper>
      <Title className="prod-title" titleText={product.pName}></Title>
      <Breadcrumb items={product.breadcrumbItems} />
      <DetailsContent>
        <ProductPreview previewImages={product.media} />
        <VerticalDivider />
        <div>
        <ProductDescriptionTab description={product.desc} />
        <div>
          <button className="prod-add-btn">
            <span className="bi bi-cart2" />
            <span className="prod-add-btn-text">Add to cart</span>
          </button>
          <span className="text-xl text-outerspace font-bold">
            {currencyFormat(product.price)}
          </span>
        </div>
        </div>
      </DetailsContent>
      <ProductSimilar>
        <ProductSimilar products={product.similarProducts} />
      </ProductSimilar>
    </DetailsScreenWrapper>
  );
  
};

export default ProductDetailsScreen;
