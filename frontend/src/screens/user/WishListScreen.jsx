import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { BaseLinkBlack } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const WishListScreenWrapper = styled.main`
  .wishlist {
    gap: 20px;
  }
`;

const WishItemWrapper = styled.div`
  gap: 30px;
  max-width: 900px;
  position: relative;
  /* Your CSS here */
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Wishlist", link: "/wishlist" },
];

const WishListScreen = () => {
  const [data, setData] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishList();
  }, []);

  const fetchWishList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/users/WishList',{
        withCredentials:true,
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log("wishdata1",response.data.data);
      // Check if response.data is an array
      if (Array.isArray(response.data.data)) {
        setData(response.data.data);
        // console.log(data);
      } else {
        setData([]); // Reset to empty array if not an array
      }
      // setData(response.data)
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishListScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"Wishlist"} />
            <div className="wishlist grid">
              {Array.isArray(data) && data.map((wishlist) => (
                <WishItemWrapper className="wish-item flex" key={wishlist.id}>
                  <div className="wish-item-img flex items-stretch">
                    <button type="button" className="wish-remove-btn">
                      <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="wish-item-img-wrapper">
                      <img
                        src={wishlist.media[0]}
                        className="object-fit-cover"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="wish-item-info flex justify-between">
                    <div className="wish-item-info-l flex flex-col">
                      <p className="wish-item-title text-xl font-bold text-outerspace">
                        {wishlist.pName}
                      </p>
                      <ul className="flex flex-col">
                        <li>
                          <span className="text-lg font-bold">Description:</span>
                          <span className="text-lg text-gray font-medium capitalize">
                            {wishlist.desc}
                          </span>
                        </li>
                        <li>
                          <span className="text-lg font-bold">Status:</span>
                          <span className="text-lg text-gray font-medium capitalize">
                            {wishlist.status ? "Available" : "Unavailable"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="wish-item-info-r flex items-center">
                      <span className="wish-item-price text-xl text-gray font-bold">
                        price: ${wishlist.price}
                      </span>
                      {/* <BaseLinkBlack to="/cart" className="wish-cart-btn">
                        Add to cart
                      </BaseLinkBlack> */}
                    </div>
                  </div>
                </WishItemWrapper>
              ))}
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </WishListScreenWrapper>
  );
};

export default WishListScreen;

