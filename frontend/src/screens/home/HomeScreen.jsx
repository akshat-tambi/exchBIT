import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Categories from '../../components/home/Categories';
import Catalog from '../../components/home/Catalog';
import LoadingScreen from '../../components/loadingScreen/LoadingScreen';

const HomeScreenWrapper = styled.main``;

const HomeScreen = () => {
  const [catalogLoading, setCatalogLoading] = useState(true); 

  const handleCatalogLoaded = () => {
    setCatalogLoading(false);
  };

  return (
    <HomeScreenWrapper>
      <Categories />
      <Catalog catalogTitle={"In The LimeLight"} setLoading={handleCatalogLoaded} />
      {catalogLoading && <LoadingScreen />}
    </HomeScreenWrapper>
  );
};

export default HomeScreen;
