import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Breadcrumb from "../../components/common/Breadcrumb";
import ProductPreview from "../../components/product/ProductPreview";
import ProductDescriptionTab from "../../components/product/ProductDescriptionTab";
import ProductSimilar from "../../components/product/ProductSimilar";
import Title from "../../components/common/Title";
import { getProductById } from "../../services/productService";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useParams } from "react-router-dom";
import { currencyFormat } from "../../utils/helper";
import axios from 'axios';
import { useNavigate} from "react-router-dom";

const DetailsContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 40px;
  padding-left: 20px; /* Add left padding */
  
  @media (max-width: ${breakpoints.xl}) {
    gap: 24px;
    grid-template-columns: 3fr 1px 2fr;
  }

  @media (max-width: ${breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${defaultTheme.color_silver};
`;

const ProductDetailsWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px;

  .prod-title {
    margin-bottom: 20px; /* Increased margin */
  }

  .rating-and-comments {
    column-gap: 16px;
    margin-bottom: 20px;
  }

  .prod-rating {
    column-gap: 10px;
  }

  .prod-comments {
    column-gap: 10px;
  }
`;

const ProductSizeWrapper = styled.div`
  .prod-size-top {
    gap: 20px;
  }

  .prod-size-list {
    gap: 12px;
    margin-top: 16px;
  }

  .prod-size-item {
    position: relative;
    height: 38px;
    width: 38px;
    cursor: pointer;

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 38px;
      height: 38px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        color: ${defaultTheme.color_white};
        background-color: ${defaultTheme.color_outerspace};
        border-color: ${defaultTheme.color_outerspace};
      }
    }

    span {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1.5px solid ${defaultTheme.color_silver};
      text-transform: uppercase;
    }
  }
`;

const ProductColorWrapper = styled.div`
  margin-top: 32px;

  .prod-colors-top {
    margin-bottom: 16px;
  }

  .prod-colors-list {
    column-gap: 12px;
  }

  .prod-colors-item {
    position: relative;
    width: 22px;
    height: 22px;
    transition: ${defaultTheme.default_transition};

    &:hover {
      scale: 0.9;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        outline: 1px solid ${defaultTheme.color_gray};
        outline-offset: 3px;
      }
    }

    .prod-colorbox {
      border-radius: 100%;
      width: 22px;
      height: 22px;
      display: inline-block;
    }
  }
`;

const AddToCartButton = styled.button`
  background-color: rgba(83, 178, 172, 1); /* Direct RGB values */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 160px;  
  height:40px;
  .bi-cart2 {
    margin-right: 8px; /* Adjust icon margin */
  }
`;
const AddToWishList=styled.button`
   background-color: rgba(83, 178, 172, 1); /* Direct RGB values */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const DetailsScreenWrapper = styled.div`
  padding-top: 20px; /* Add padding from above */
  padding-right: 20px; /* Add padding from the right */
  padding-left: 20px; /* Add padding from the left */
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Take remaining space */
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px; /* Add margin from above */
`;

const PriceText = styled.span`
  font-size: 18px; /* Example font size */
  font-weight: bold;
`;

const ProductDetailsScreen = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);


  const handleAddToCart = async () => {
    try {
        const response = await axios.post("/api/v1/users/protectedRoute", {}, {
            withCredentials: true, 
        });

        const userId = response.data.data;

        if (!userId) {
            console.log("Error in authentication");
            alert("Error in authentication, please log in again.");
            return;
        }

        const ws = new WebSocket("ws://localhost:8000");

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "INITIATE_CHAT", productId, userId }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "CHAT_INITIATED") {
                const { chatId } = message;
                navigate(`/chat/${chatId}`, { replace: true });
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            alert("An error occurred with the WebSocket connection. Please try again later.");
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
    } catch (error) {
        console.error("Error in handleAddToCart:", error);
        alert("An error occurred. Please try again later.");
    }
};

const ProductWishList=async()=>{
  try {
   const MyWishList=await axios.put(`/api/v1/users/SetWish/${product._id}`,{},{
    withCredentials:true
   });
   alert("this product is updated to WishList")
  } catch (error) {
    console.log("Error in adding product to wishlidt",error);
    alert("error in adding the product to the wishlist");
  }
}

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <DetailsScreenWrapper>
      <Title className="prod-title" titleText={product.pName} />
      <Breadcrumb items={product.breadcrumbItems} />
      <DetailsContent>
        
        <ProductPreview previewImages={product.media} />
        <VerticalDivider />
        <ProductInfo>
          <b>Description</b>
          <ProductDescriptionTab description={product.desc} />
          <ProductFooter>
            <div>
              <PriceText>Price: {currencyFormat(product.price)}</PriceText>
            </div>
            <div>
              <AddToCartButton className="prod-add-btn" onClick={handleAddToCart}>
              <center><span className="bi bi-chat-left-text" >    </span>
              <span className="prod-add-btn-text">Chat with seller</span></center>
            </AddToCartButton>
            <br />
            <AddToCartButton className="prod-add-btn" onClick={ProductWishList}>
            <center><span className="bi bi-heart" >  </span>
            <span className="prod-add-btn-text">Add To WishList</span></center>
            </AddToCartButton>
            </div>
          </ProductFooter>
        </ProductInfo>
      </DetailsContent>
      <ProductSimilar productId={productId} />
      
    </DetailsScreenWrapper>
  );
};

export default ProductDetailsScreen;
