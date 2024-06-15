import React, { useState, useEffect } from "react";
import { Section } from "../../styles/styles";
import Title from "../common/Title";
import styled from 'styled-components';
import { breakpoints } from '../../styles/themes/default';

import { getAllProducts } from "../../services/productService"; // Importing the service function
import ProductItem from './ProductItem';


const ProductListWrapper = styled.div`
  column-gap: 20px;
  row-gap: 40px;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));

  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;


const ProductSimilar = ({ productId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        const filteredProducts = allProducts.filter(prod => prod._id !== productId);
        const similarProducts = filteredProducts.slice(0, 5);
        setProducts(similarProducts); 
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchProducts(); 
  }, [productId]);

  return (
    <Section>
      <Title titleText={"More Products"} />
      <ProductListWrapper className="grid">
      {products.map((product) => (
        <ProductItem key={product._id} product={product} />
      ))}
    </ProductListWrapper>
    </Section>
  );
};

export default ProductSimilar;
