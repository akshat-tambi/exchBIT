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
        throw new ApiError(409,"some error while generating access Token and refresh Token")
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
        throw new ApiError(400,"this account already exists");
    }

    //if user doesnt exist update it in database
    const user=await User.create({
        username,
        password,
        email
    });

    const check=await User.findById(user._id).select("-password -refreshToken");

    if(!check){
        throw new ApiError(500,"user has not been registered");
    }

    //return to database
    return res.status(201).json(
       new ApiResponse(201,check,"user registered successfully")
    )
});

const LoginUser=asyncHandler(async(req,res)=>{
   //take user detail from frontend
   const {username,password,email}=req.body

   //check if data is filled fully
   if(!username || !password || !email){
    console.log(req.body);
    throw new ApiError(401,"all details are missing");
   }

   //check if user exist in the database
   const exist=await User.findOne({
    $or:[{username},{email}]
   })

   if(!exist){
    throw new ApiError(500,"there is no account with this username or email please register first");
   }
   

   //verify the password from userschema method
   const check=exist.isPasswordTrue(password);
   if(!check){
     throw new ApiError(409,"incorrect password given");
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
   .json(new ApiResponse(200,loggedDetail,"logged successfully"))
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
     .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccesToken=asyncHandler(async(req,res)=>{
     const token=req.cookie.refreshToken || req.body

     if(!token){
        throw new ApiError(401,"some error in getting refreshToken");
     }
     const decoded=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);

     const check= await User.findById(decoded?._id);
     if(!check){
        throw new ApiError(401,"error in authorisation")
     }
     if(check.refreshToken!==token){
        throw new ApiError(401,"some error in refreshing");
     }

     const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(check._id)

     const options={
        httpOnly:true,
        secure:true
     }
     res.status(201).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
     .json(new ApiResponse(201,{accessToken,refreshToken},"ok AccessToken refreshed"));
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
        res.status(201).json(new ApiResponse(201,updateFind,"user data is updated"));
})

const WishListFetch=asyncHandler(async(req,res)=>{
    console.log("user",req.user);
    const userId = req.user._id;

    

    if(!userId){
        
        throw new ApiError(501,"id is not fetched");
    }

    const user = await User.findById(userId).populate('wishList');
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user.wishList, "Wishlist fetched successfully"));


})
const RetrieveUser=asyncHandler((req,res)=>{
     const userId=req.user._id;

     res.status(201).json(
        new ApiResponse(201,userId)
     )
})

export {registerUser,LoginUser,LogoutUser,refreshAccesToken,editUser,WishListFetch,RetrieveUser}

