import React from 'react';
import PropTypes from 'prop-types';
import { Container, Section } from '../../styles/styles';
import Title from '../common/Title';
import ProductList from '../product/ProductList';

const Catalog = ({ catalogTitle, setLoading }) => {
  const handleProductsLoaded = () => {
    setLoading(false); 
  };

  return (
    <Section>
      <Container>
        <div className="categories-content">
          <Title titleText={catalogTitle} />
          <ProductList setLoading={handleProductsLoaded} />
        </div>
      </Container>
    </Section>
  );
};

Catalog.propTypes = {
  catalogTitle: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export default Catalog;
