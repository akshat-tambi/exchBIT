import React, { useState } from "react";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import axios from "axios"; // Import axios for API requests

const FormScreenWrapper = styled.div`
  .form-content {
    margin-top: 40px;
    max-width: 600px;
    padding: 20px;
    border: 1px solid ${defaultTheme.color_whitesmoke};
    border-radius: 8px;
    background-color: ${defaultTheme.color_white};
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid ${defaultTheme.color_whitesmoke};
    border-radius: 4px;
    box-sizing: border-box;
  }

  .form-button {
    display: block;
    width: 100%;
    padding: 12px;
    margin-top: 20px;
    background-color: #007bff;
    color: ${defaultTheme.color_white};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    text-align: center;
    font-size: 16px;

    &:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }

    &:disabled {
      background-color: ${defaultTheme.color_disabled};
      cursor: not-allowed;
    }
  }

  .form-error {
    color: ${defaultTheme.color_error};
    margin-top: 10px;
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Form", link: "/NewProduct" },
];

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    description: "",
    image: null,
    cat: "", // Changed to string for single category selection
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { productName, price, description, image, cat } = formData;

    if (!productName || !price || !description || !image || !cat) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("pName", productName);
    data.append("price", price);
    data.append("desc", description);
    data.append("media", image);
    data.append("cat", cat); // Single category selection

    try {
      const response = await axios.post(
        "/api/v1/products/NewProduct",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      //console.log("Product created:", response.data);

      setFormData({
        productName: "",
        price: "",
        description: "",
        image: null,
        cat: "", // Reset category after successful submission
      });
      alert("your product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
      setError("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"Post New Ad"} />
            <div className="form-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="productName">
                    Product Name
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="price">
                    Price
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    className="form-input"
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="image">
                    Image
                  </label>
                  <input
                    className="form-input"
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cat">
                    Category
                  </label>
                  <select
                    className="form-input"
                    id="cat"
                    name="cat"
                    value={formData.cat}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="scholastic gear">Scholastic Gear</option>
                    <option value="lab apparel">Lab Apparel</option>
                    <option value="Miscellaneous Items">Miscellaneous Items</option>
                  </select>
                </div>

                <button
                  className="form-button"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Submit
                </button>

                {error && <div className="form-error">{error}</div>}
              </form>
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </FormScreenWrapper>
  );
};

export default CreateProduct;

