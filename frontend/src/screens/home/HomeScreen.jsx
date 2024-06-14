import styled from "styled-components";
import Categories from "../../components/home/Categories";
import Catalog from "../../components/home/Catalog";

const HomeScreenWrapper = styled.main``;

const HomeScreen = () => {
  return (
    <HomeScreenWrapper>
      <Categories />
      <Catalog catalogTitle={"In The LimeLight"} />
    </HomeScreenWrapper>
  );
};

export default HomeScreen;
