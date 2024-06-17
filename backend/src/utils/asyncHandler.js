// const asyncHandler=(requestHandler)=>{
//    return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
//     };
// };

// export {asyncHandler};
// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//       try {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//       } catch (err) {
//         next(err); // Pass any synchronous errors to Express error handling middleware
//       }
//     };
//   };
  
//   export { asyncHandler };
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
  };
  export { asyncHandler };
  