// src/components/product/ProductItemUser.js
import { useNavigate} from "react-router-dom";

import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link} from 'react-router-dom';
import styled from 'styled-components';
import { commonCardStyles } from '../../styles/card';
import { defaultTheme } from '../../styles/themes/default';
// import axios from 'axios';

const ProductCardWrapper = styled.div`
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

const ActionButton = styled.button`
  display: inline-block;
  margin: 4px;
  padding: 6px 12px;
  background-color: ${props => props.color || defaultTheme.color_primary};
  color: ${defaultTheme.color_white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.hoverColor || defaultTheme.color_secondary};
  }
`;

const ProductItemUser = ({ product }) => {
  const history = useNavigate();
  const firstMedia = product.media.length > 0 ? product.media[0] : '';

  const handleEdit = async() => {
    await axios.put(`/product/edit/${product._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/products/${product._id}`, {
          withCredentials: true,
        });
        alert('Product deleted successfully.');
        // Optionally, trigger a refresh or update the state to remove the deleted product
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleMarkAsSold = async () => {
    try {
      await axios.patch(`http://localhost:8000/api/v1/products/${product._id}`, {
        status: 'sold',
      }, {
        withCredentials: true,
      });
      alert('Product marked as sold.');
      // Optionally, update the state or UI to reflect this change
    } catch (error) {
      console.error('Error marking product as sold:', error);
      alert('Failed to mark product as sold. Please try again.');
    }
  };

  return (
    <ProductCardWrapper>
      <Link to={`/product/details/${product._id}`}>
        <ProductImage src={firstMedia} alt={product.pName} />
      </Link>
      <WishlistButton type="button">
        <i className="bi bi-heart"></i>
      </WishlistButton>
      <ProductInfo>
        <p className="font-bold">{product.pName}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">
            {product.cat.map(cat => cat.categoryName).join(', ')}
          </span>
          <span className="text-outerspace font-bold">${product.price}</span>
        </div>
        <div className="flex justify-end">
          <ActionButton color="#007bff" hoverColor="#0056b3" onClick={handleEdit}>Edit</ActionButton>
          <ActionButton color="#dc3545" hoverColor="#c82333" onClick={handleDelete}>Delete</ActionButton>
          <ActionButton color="#28a745" hoverColor="#218838" onClick={handleMarkAsSold}>Mark as Sold</ActionButton>
        </div>
      </ProductInfo>
    </ProductCardWrapper>
  );
};

ProductItemUser.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductItemUser;
