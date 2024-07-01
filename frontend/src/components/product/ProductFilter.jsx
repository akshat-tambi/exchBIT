import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Section } from '../../styles/styles';
import Title from '../common/Title';
import ProductItem from './ProductItem';
import { getProductsByCategory } from '../../services/productService';
import { useParams } from 'react-router-dom';
import { breakpoints } from '../../styles/themes/default';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import LoadingScreen from '../../components/loadingScreen/LoadingScreen'; 

const FilterPageWrapper = styled.div`
  display: flex;
  padding: 40px 0;
`;

const FilterForm = styled.form`
  flex: 0 0 calc(25% - 20px);
  padding-right: 20px;

  @media (max-width: ${breakpoints.sm}) {
    flex: 0 0 100%;
    padding-right: 0;
    margin-bottom: 20px;
  }
`;

const FilterInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: calc(100% - 22px);
  font-size: 16px;
  margin-bottom: 10px;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
`;

const ProductList = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-left: 20px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: #ccc;
  margin: 0 20px;
`;

const FilterPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({ productName: '', minPrice: '0', maxPrice: '50000' });
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryName]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true); 
      const response = await getProductsByCategory(categoryName);
      if (response.success) {
        setProducts(response.products);
        setFilteredProducts(response.products);
      } else {
        console.error('Failed to fetch ads by category:', response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error('Error fetching ads by category!');
      setError('Error fetching ads by category!');
    } finally {
      setLoading(false); 
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let filtered = products.filter(product => {
      if (filters.productName && !product.pName.toLowerCase().includes(filters.productName.toLowerCase())) {
        return false;
      }
      if (filters.minPrice && parseFloat(product.price) < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && parseFloat(product.price) > parseFloat(filters.maxPrice)) {
        return false;
      }
      return true;
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return <LoadingScreen />; 
  }

  if (error) {
    return <p>{error}</p>; 
  }

  return (
    <Section>
      <Container>
        <Title titleText={categoryName.toUpperCase()} />
        <FilterPageWrapper>
          <FilterForm onSubmit={handleFormSubmit}>
            <FilterInput
              type="text"
              name="productName"
              placeholder="Search by product name"
              value={filters.productName}
              onChange={handleFilterChange}
            />
            <Slider
              min={0}
              max={50000}
              step={10}
              defaultValue={[0, 50000]}
              onChange={([minPrice, maxPrice]) => setFilters({ ...filters, minPrice, maxPrice })}
              range
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '10px' }}>
              <span>₹{filters.minPrice}</span>
              <span>₹{filters.maxPrice}</span>
            </div>
            <FilterButton type="submit">Apply Filters</FilterButton>
          </FilterForm>
          <Divider />
          <ProductList>
            {filteredProducts.map(product => (
              <ProductItem key={product._id} product={product} />
            ))}
          </ProductList>
        </FilterPageWrapper>
      </Container>
    </Section>
  );
};

export default FilterPage;
