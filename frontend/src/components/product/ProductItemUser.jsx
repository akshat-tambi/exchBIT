import { useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { commonCardStyles } from "../../styles/card";
import { defaultTheme } from "../../styles/themes/default";

const ProductCardWrapper = styled.div`
  ${commonCardStyles}
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${defaultTheme.color_white};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${defaultTheme.color_yellow};
    color: ${defaultTheme.color_white};
  }
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ActionButton = styled.button`
  display: inline-block;
  margin: 4px;
  padding: 6px 12px;
  background-color: ${props => props.color || defaultTheme.color_primary};
  color: ${defaultTheme.color_white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.hoverColor || defaultTheme.color_secondary};
  }
`;

const SoldTag = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  background-color: #28a745; /* Green color for sold tag */
  color: ${defaultTheme.color_white};
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
`;

const ProductItemUser = ({ product }) => {
  const firstMedia = product.media.length > 0 ? product.media[0] : "";
  const isSold = product.status === true;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`https://exchbit.onrender.com/api/v1/products/${product._id}`, {
          withCredentials: true,
        });
        alert("Product deleted successfully.");
      } catch (error) {
        console.error("Error deleting ad");
        alert("Failed to delete ad. Please try again later!");
      }
    }
  };
  const ProductWishList=async()=>{
     try {
      const MyWishList=await axios.put(`https://exchbit.onrender.com/api/v1/users/SetWish/${product._id}`,{},{
        withCredentials:true
      });
      alert("this product is updated to WishList")
     } catch (error) {
       console.log("Error in adding product to wishlist!");
       alert("Unable to add this product to wishlist!");
     }
  }
  const handleMarkAsSold = async () => {
    if(isSold){
      alert("Product has been sold!");
      return;
    }
    try {
      await axios.patch(
        `https://exchbit.onrender.com/api/v1/products/${product._id}`,
        {
          status: true,
        },
        {
          withCredentials: true,
        }
      );
      alert("Marked as sold!");
    } catch (error) {
      console.error("Error marking product as sold!");
      alert("Failed to mark product as sold. Please try again later!");
    }
  };

  return (
    <ProductCardWrapper>
      {isSold && <SoldTag>Sold</SoldTag>}
      <Link to={`/product/details/${product._id}`}>
        <ProductImage src={firstMedia} alt={product.pName} />
      </Link>
      {/* <WishlistButton type="button" onClick={ProductWishList}>
        <i className="bi bi-heart"></i>
      </WishlistButton> */}
      <ProductInfo>
        <p className="font-bold">{product.pName}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">
            {product.cat.map((cat) => cat.categoryName).join(", ")}
          </span>
          <span className="text-outerspace font-bold">${product.price}</span>
        </div>
        <div className="flex justify-end">
          <Link to={`/EditUserProduct/${product._id}`}>
            <ActionButton
              color="#007bff"
              hoverColor="#0056b3"
            >
              Edit
            </ActionButton>
          </Link>
          <ActionButton
            color="#dc3545"
            hoverColor="#c82333"
            onClick={handleDelete}
          >
            Delete
          </ActionButton>
          <ActionButton
            color="#28a745"
            hoverColor="#218838"
            onClick={handleMarkAsSold}
          >
            Mark as Sold
          </ActionButton>
        </div>
      </ProductInfo>
    </ProductCardWrapper>
  );
};

ProductItemUser.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductItemUser;
