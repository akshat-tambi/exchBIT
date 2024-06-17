import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";

// Define the main wrapper for the wishlist screen
const WishListScreenWrapper = styled.main`
  .wishlist {
    gap: 20px;
  }
`;

// Define the wrapper for each wish item
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

  .wish-item-img {
    position: relative;

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
      }
    }
  }

  .wish-item-info {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;

    .wish-item-info-l {
      flex: 1;
      display: flex;
      flex-direction: column;

      .wish-item-title {
        margin-bottom: 10px;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          margin-bottom: 10px;

          span:first-child {
            font-weight: bold;
            margin-right: 5px;
          }
        }
      }
    }

    .wish-item-info-r {
      display: flex;
      align-items: center;

      .wish-item-price {
        font-size: 1.25rem;
        font-weight: bold;
      }

      .wish-cart-btn {
        margin-left: 20px;
        padding: 10px 20px;
        background: rgba(83, 178, 172, 1);
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
      }
    }
  }
`;

// Define the breadcrumb items
const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Wishlist", link: "/wishlist" },
];

// Define the WishListScreen component
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
      const response = await axios.get('/api/v1/users/WishList', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      console.log("wishdata1", response.data.data);
      // Check if response.data is an array
      if (Array.isArray(response.data.data)) {
        setData(response.data.data);
      } else {
        setData([]); // Reset to empty array if not an array
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
        // Remove item from local state
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
                  <WishItemWrapper className="wish-item flex" key={wishlist._id}>
                    <div className="wish-item-img flex items-stretch">
                      <button 
                        type="button" 
                        className="wish-remove-btn"
                        onClick={() => handleRemoveFromWishlist(wishlist._id)}
                      >
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
