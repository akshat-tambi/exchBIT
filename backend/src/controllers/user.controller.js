import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens= async(userid)=>{
    try {
       const user=await User.findById(userid);

       console.log(user);
       
       const accessToken=user.jwtAccessToken();
       const refreshToken= user.jwtRefreshToken();

      console.log("access ",accessToken);
      console.log("refresh ",refreshToken);

      user.refreshToken=refreshToken;

      await user.save({validateBeforeSave:false});

      return {accessToken , refreshToken};
       
        
    } catch (error) {
        throw new ApiError(409,"token gen error!")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //data entry from frontend
    const {name,username,password,email}=req.body;

    // validation if it is not empty
    if(!name || !username || !password || !email){
        throw new ApiError(400,"all fields required");
    }

    //if username already exist resond user already exist
    const exist=await User.findOne({
        $or:[{email},{username}]
    })
    console.log(exist);
    if(exist){
        throw new ApiError(400,"Account already exists!");
    }

    //if user doesnt exist update it in database
    const user=await User.create({
        username,
        password,
        email
    });

    const check=await User.findById(user._id).select("-password -refreshToken");

    if(!check){
        throw new ApiError(500,"Not Registered!");
    }

    //return to database
    return res.status(201).json(
       new ApiResponse(201,check,"Reg. success!")
    )
});

const LoginUser=asyncHandler(async(req,res)=>{
   //take user detail from frontend
   const {username,password,email}=req.body

   //check if data is filled fully
   if(!username || !password || !email){
    console.log(req.body);
    throw new ApiError(401,"Pls fill all fields!");
   }

   //check if user exist in the database
   const exist=await User.findOne({
    $or:[{username},{email}]
   })

   if(!exist){
    throw new ApiError(500,"No accounts exists with these details, please register first!");
   }
   

   //verify the password from userschema method
   const check=await exist.isPasswordTrue(password);
   if(!check){
     throw new ApiError(409,"Incorrect password!");
   }

   //if verified return the acess and refresh token
   const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(exist._id);
   console.log(exist._id);
   console.log("accessToken",accessToken);
    console.log("refreshToken",refreshToken);

   const loggedDetail=await User.findById(exist._id).select("-password -referenceToken")

   const options={
      httpOnly:true,
      secure:true
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,loggedDetail,"LogIn Success!"))
});

const RemoveProductWish = asyncHandler(async (req, res) => {
    const { id } = req.params;  //  product to be removed from the wishlist
    const userId = req.user._id; // user making the request

    try {
        // console.clear();
        // console.log("Product ID to remove:", id);
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishList: id } }, // Remove the product ID from the wishlist
            { new: true } // Return the updated user document
        );

        if (!user) {
            throw new ApiError(401, 'Error in removing product from wishlist!');
        }

        res.status(200).json(new ApiResponse(200, user, "Product removed successfully!"));
    } catch (err) {
        console.error(err);
        throw new ApiError(401, 'Error in removing product from wishlist!');
    }
});

const LogoutUser=asyncHandler((req,res)=>{
    const id=req.user._id;

    User.findByIdAndUpdate(id,{
        $set:{
            refreshToken:undefined
        }
    },{
        new:true
    })

    const options={
        httponly:true,
        secure:true
     }

     return res.status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"LogOut Success!"))
})

const refreshAccesToken=asyncHandler(async(req,res)=>{
     const token=req.cookie.refreshToken || req.body

     if(!token){
        throw new ApiError(401,"Unable to obtain refreshToken!");
     }
     const decoded=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);

     const check= await User.findById(decoded?._id);
     if(!check){
        throw new ApiError(401,"Auth error!")
     }
     if(check.refreshToken!==token){
        throw new ApiError(401,"Refresh error!");
     }

     const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(check._id)

     const options={
        httpOnly:true,
        secure:true
     }
     res.status(201).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
     .json(new ApiResponse(201,{accessToken,refreshToken},"Ok! AccessToken refreshed!"));
})

const editUser=asyncHandler(async(req,res)=>{
    const {name,username}=req.body;

    const id=req.user._id;
    const updateFind=await User.findByIdAndUpdate(id,
        {
            $set:{
                username:username,
                name:name
            }
        },{
            new:true
        });
        res.status(201).json(new ApiResponse(201,updateFind,"Update success!"));
})

const WishListFetch=asyncHandler(async(req,res)=>{
    console.log("user",req.user);
    const userId = req.user._id;

    if(!userId){
        
        throw new ApiError(501,"ID Fetch error!");
    }

    const userWish = await User.findById(userId).populate('wishList');
    if (!userWish) {
        throw new ApiError(404, "User not found!");
    }
    console.log("wishdata",userWish.wishList);
    // alert(userWish.wishList);
    res.status(201).json(new ApiResponse(201,userWish.wishList));
    


})
// const SetProductWish=asyncHandler((req,res)=>{
//     const id=req.params
//     const userId=req.user
//     try{
//     const WishAdded=User.findByIdAndUpdate(userId,{
//         $addToSet:{wishList:id}
//     })

//     if(!WishAdded){

//         throw new ApiError(401,"error in setting product in wishList");
//     }
//     res.status(201).json("product is set to wishlist successfully");
//    }catch(err){
//      console.log(err);
//      throw new ApiError(401,"Error in seting product in Wishlist");
//    }
// }
// )
const SetProductWish = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    console.log("product id",id);
    const userId = req.user._id; 
    console.log("userId",userId);
  
    try {
    //   const FindProduct=await Product.findById(id);

    //   if(FindProduct.user===userId){
    //     res.status(201).json({message:"this is your product only you cant put it in wishList"})
    //     return;
    //   }
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishList: id } },
        { new: true } 
      );
  
      if (!user) {
        throw new ApiError(401, 'Unable to add product in wishlist!');
      }
  
      res.status(201).json(new ApiResponse(201,user,"Added to wishlist successfully"));
    } catch (err) {
      console.error(err);
      throw new ApiError(401, 'Unable to add product in wishlist!');
    }
  });
const RetrieveUser=asyncHandler((req,res)=>{
     const userId=req.user._id;

     res.status(201).json(
        new ApiResponse(201,userId)
     )
})
const FindUserById=asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    try {
        const UserData=await User.findById(userId);
        if(!UserData){
            throw new ApiError(501,"Unable to get user details!");
        }
        res.status(201).json(
            new ApiResponse(201,UserData)
        )
    } catch (error) {
        console.log(error);
        throw new ApiError(501,"Internal Server Error: Try again later!");
    }
})


export {RemoveProductWish, registerUser,LoginUser,LogoutUser,refreshAccesToken,editUser,WishListFetch,RetrieveUser,SetProductWish,FindUserById}//,ExtractCart}

