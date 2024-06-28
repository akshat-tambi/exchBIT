import axios from 'axios';
const BASE_URL = 'https://exchbit.onrender.com/api/v1/products';

export const getAllProducts = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${productId}`);
    console.log(response.data);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    throw error;
  }
};

export const getProductsByCategory = async (categoryName) => {
  try {
    const response = await axios.get(`${BASE_URL}/category/${categoryName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error.message);
    throw error;
  }
};
