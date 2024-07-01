import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { commonCardStyles } from '../../styles/card';
import { breakpoints, defaultTheme } from '../../styles/themes/default';

const ProductCardWrapper = styled(Link)`
  ${commonCardStyles}
  position: relative; 

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 200px; 
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${defaultTheme.color_white};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 

  &:hover {
    background-color: ${defaultTheme.color_yellow};
    color: ${defaultTheme.color_white};
  }
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductItem = ({ product }) => {
  const firstMedia = product.media.length > 0 ? product.media[0] : '';

  return (
    <ProductCardWrapper to={`/product/details/${product._id}`}>
      <ProductImage src={firstMedia} alt={product.pName} />
      {/* <WishlistButton type="button">
        <i className="bi bi-heart"></i>
      </WishlistButton> */}
      <ProductInfo>
        <p className="font-bold">{product.pName}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">
            {product.cat.map((cat) => cat.categoryName).join(', ')}
          </span>
          <span className="text-outerspace font-bold">₹{product.price}</span>
        </div>
      </ProductInfo>
    </ProductCardWrapper>
  );
};

ProductItem.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductItem;
