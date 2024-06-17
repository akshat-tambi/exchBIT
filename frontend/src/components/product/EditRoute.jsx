// import React, { useState } from 'react';
// import styled from 'styled-components';
// import EditProductForm from './EditProductForm';

// // Wrapper for the form with styles similar to ProductCardWrapper
// const FormWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   min-height: 100vh;
//   background-color: #f0f0f0;
//   padding: 20px;
// `;

// const FormContainer = styled.form`
//   background: #ffffff;
//   padding: 20px;
//   border-radius: 8px;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//   max-width: 400px;
//   width: 100%;
// `;

// const Title = styled.h2`
//   margin-bottom: 20px;
//   font-size: 24px;
//   text-align: center;
// `;

// const Label = styled.label`
//   display: block;
//   margin-bottom: 8px;
//   font-weight: bold;
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 10px;
//   margin-bottom: 15px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   box-sizing: border-box;
// `;

// const Textarea = styled.textarea`
//   width: 100%;
//   padding: 10px;
//   margin-bottom: 15px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   box-sizing: border-box;
//   min-height: 80px;
// `;

// const Select = styled.select`
//   width: 100%;
//   padding: 10px;
//   margin-bottom: 15px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   box-sizing: border-box;
// `;

// const Button = styled.button`
//   width: 100%;
//   padding: 10px;
//   background: #007bff;
//   border: none;
//   border-radius: 4px;
//   color: #fff;
//   font-size: 16px;
//   cursor: pointer;
//   transition: background-color 0.3s;
//   margin-top: 10px;

//   &:hover {
//     background: #0056b3;
//   }
// `;


// const EditRoute=()=>{
//     <EditProductForm />
// }
// // const EditProductForm = ({product}) => {
// //   const [productName, setProductName] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [price, setPrice] = useState('');
// //   const [image, setImage] = useState(null);
// //   const [category, setCategory] = useState('electronics');
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleSubmit = async(e) => {
// //     e.preventDefault();
// //     // Handle form submission

// //     setIsSubmitting(true);

// //     //Prepare the form data
// //     // const formData = new FormData();
// //     // formData.append('pName', productName);
// //     // formData.append('description', description);
// //     // formData.append('price', price);
// //     // formData.append('category', category);
// //     // if (image) {
// //     //   formData.append('image', image);
// //     // }
// //     const formData=new FormData();
// //     formData.append('pName',productName);
// //     formData.append('desc',description);
// //     formData.append('price',price);
// //     formData.append('cat',category);
// //     if(image){
// //         formData.append('media',image);
// //     }

// //     const response=await axios.put(`http://localhost:8000/api/v1/products/${product._id}`,formData,{
// //         headers:{
// //             'Content-Type':'multipart/form-data'
// //         },
// //         withCredentials:true
// //     })
// //     alert("Product Updated successfully");
// //     console.log("edit Response",response.data);
// //   };


// //   return (
// //     <FormWrapper>
// //       <FormContainer onSubmit={handleSubmit}>
// //         <Title>Edit Product</Title>

// //         <Label htmlFor="productName">Product Name:</Label>
// //         <Input
// //           type="text"
// //           id="productName"
// //           value={productName}
// //           onChange={(e) => setProductName(e.target.value)}
// //           required
// //         />

// //         <Label htmlFor="description">Description:</Label>
// //         <Textarea
// //           id="description"
// //           value={description}
// //           onChange={(e) => setDescription(e.target.value)}
// //           required
// //         />

// //         <Label htmlFor="price">Price ($):</Label>
// //         <Input
// //           type="number"
// //           id="price"
// //           value={price}
// //           onChange={(e) => setPrice(e.target.value)}
// //           required
// //         />

// //         <Label htmlFor="image">Image:</Label>
// //         <Input
// //           type="file"
// //           id="image"
// //           onChange={(e) => setImage(e.target.files[0])}
// //           required
// //         />

// //         <Label htmlFor="category">Category:</Label>
// //         <Select
// //           id="category"
// //           value={category}
// //           onChange={(e) => setCategory(e.target.value)}
// //           required
// //         >
// //           <option value="electronics">Electronics</option>
// //           <option value="fashion">Fashion</option>
// //           <option value="scholastic-gear">Scholastic Gear</option>
// //           <option value="lab-apparel">Lab Apparel</option>
// //           <option value="general-essentials">Miscellaneous Items</option>
// //         </Select>

// //         <Button type="submit">Submit</Button>
// //       </FormContainer>
// //     </FormWrapper>
// //   );
// // };

// // export default EditProductForm;
