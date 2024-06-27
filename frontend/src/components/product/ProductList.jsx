import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { breakpoints } from '../../styles/themes/default';
import ProductItem from './ProductItem';
import { getAllProducts } from '../../services/productService';

const ProductListWrapper = styled.div`
  column-gap: 20px;
  row-gap: 40px;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));

  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData.data);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching ads:', error.message);
        setError('Failed to fetch ads. Please try again later!'); // Set error state
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
        <ProductItem key={product._id} product={product} />
      ))}
    </ProductListWrapper>
  );
};

export default ProductList;
