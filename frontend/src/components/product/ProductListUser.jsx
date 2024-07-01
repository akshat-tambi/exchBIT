import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { breakpoints } from '../../styles/themes/default';
import ProductItemUser from './ProductItemUser';
import LoadingScreen from '../../components/loadingScreen/LoadingScreen';

const ProductListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 40px 20px;
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  
  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const Heading = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-top: 20px; 
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ddd; 
  width: 100%; 
  margin: 20px auto; 
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 1.2rem;
`;

const NoAdsMessage = styled.p`
  color: gray;
  font-size: 1.2rem;
`;

const ProductListUser = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/v1/products/user', {
          withCredentials: true,
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching ads!', error.message);
        setError('Failed to fetch ads! Please try again later!');
      } finally {
        setLoading(false); 
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Heading>Your Ads</Heading>
      <Divider />
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && products.length === 0 && <NoAdsMessage>No ads!</NoAdsMessage>}
      {products.length > 0 && (
        <ProductListWrapper>
          {products.map((product) => (
            <ProductItemUser key={product._id} product={product} />
          ))}
        </ProductListWrapper>
      )}
    </>
  );
};

export default ProductListUser;
