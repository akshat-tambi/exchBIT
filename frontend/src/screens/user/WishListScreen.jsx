import { useState, useEffect } from "react";
import axios from "axios";
import styled, { css } from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { Link } from "react-router-dom";

const WishListScreenWrapper = styled.main`
  .wishlist {
    gap: 20px;
  }
`;
const WishItemWrapper = styled.div`
  gap: 30px;
  max-width: 900px;
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  opacity: ${(props) => (props.soldOut ? 0.5 : 1)}; /* Adjust opacity for sold-out items */
  pointer-events: ${(props) => (props.soldOut ? "none" : "auto")}; /* Disable interaction for sold-out items except the remove button */
  
  .wish-remove-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(83, 178, 172, 1);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    z-index: 1; /* Ensure the button is always on top */
    pointer-events: auto; /* Ensure the remove button is always clickable */
    i {
      font-size: 16px;
    }
  }

  .wish-item-img-wrapper {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 8px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: ${(props) => (props.soldOut ? "grayscale(100%)" : "none")}; /* Apply grayscale filter for sold-out items */
    }
  }
`;


const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Wishlist", link: "/wishlist" },
];

const WishListScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishList();
  }, []);

  const fetchWishList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/users/WishList', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log("wishdata1", response.data.data);

      if (Array.isArray(response.data.data)) {
        setData(response.data.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this item from your wishlist?");
    if (confirmRemove) {
      try {
        console.log("Attempting to remove product with ID:", productId);
        await axios.put(`/api/v1/users/WishList/${productId}`, {}, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
          },
        });

        setData(data.filter(item => item._id !== productId));
      } catch (err) {
        setError(err);
      }
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
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading wishlist: {error.message}</p>
            ) : data.length === 0 ? (
              <p>No items!</p>
            ) : (
              <div className="wishlist grid">
              {data.map((wishlist) => (
                <WishItemWrapper className="wish-item flex" key={wishlist._id} soldOut={wishlist.status === true}>
                  <div className="wish-item-img flex items-stretch">
                    <button 
                      type="button" 
                      className="wish-remove-btn"
                      onClick={() => handleRemoveFromWishlist(wishlist._id)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="wish-item-img-wrapper">
                      {wishlist.status !== true ? (
                        <Link to={`/product/details/${wishlist._id}`}>
                          <img
                            src={wishlist.media[0]}
                            className="object-fit-cover"
                            alt={wishlist.pName}
                          />
                        </Link>
                      ) : (
                        <img
                          src={wishlist.media[0]}
                          className="object-fit-cover"
                          alt={wishlist.pName}
                        />
                      )}
                    </div>
                  </div>
                  <div className="wish-item-info flex justify-between">
                    <div className="wish-item-info-l flex flex-col">
                      {wishlist.status !== true ? (
                        <Link to={`/product/details/${wishlist._id}`}>
                          <p className="wish-item-title text-xl font-bold text-outerspace">
                            {wishlist.pName}
                          </p>
                        </Link>
                      ) : (
                        <p className="wish-item-title text-xl font-bold text-outerspace">
                          {wishlist.pName}
                        </p>
                      )}
                    </div>
                    <div className="wish-item-info-r flex items-center">
                      <span className="wish-item-price text-xl text-gray font-bold">
                        price: ₹{wishlist.price}
                      </span>
                    </div>
                  </div>
                </WishItemWrapper>
              ))}
            </div>
              
            )}
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </WishListScreenWrapper>
  );
};

export default WishListScreen;
