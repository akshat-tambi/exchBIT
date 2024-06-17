// src/components/product/ProductList.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { breakpoints } from '../../styles/themes/default';
import ProductItem from './ProductItem';
import { getAllProducts } from '../../services/productService';
import ProductItemUser from './ProductItemUser';

const ProductListWrapper = styled.div`
  column-gap: 20px;
  row-gap: 40px;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));

  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const ProductListUser = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await axios.get("/api/v1/products/user",{
            withCredentials:true
        });
        console.log(productsData.products)
        setProducts(productsData.data.products);
      } catch (error) {
        console.error('Error fetching products:', error.message);
        setError('Failed to fetch products. Please try again later.'); 
      }
    };
    fetchProducts(); 
  }, []);

  if (error) {
    return <p>{error}</p>; 
  }

  return (
    <ProductListWrapper className="grid">
      {products.map((product) => (
        <ProductItemUser key={product._id} product={product} />
      ))}
    </ProductListWrapper>
  );
};

export default ProductListUser;
