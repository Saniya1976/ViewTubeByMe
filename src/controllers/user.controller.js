import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessandRefreshTokens =async (userId) => {
 try{
 const user= await User.findById(userId);
 const accessToken = user.generateAccessToken();
 const refreshToken = user.generateRefreshToken();
 user.refreshToken = refreshToken;
 await user.save(validatebeforeSave = false);
 return { accessToken, refreshToken };
 }catch (error) {
  throw new ApiError(500, 'Error generating tokens');
 }
};
const registerUser = asyncHandler(async (req, res) => {
  // Register logic will go here
  // first we will check if the user already exists
  // then we will check if the avatar is uploaded
  // then we will check if the cover image is uploaded
  // if everything is correct we will create the user
  // if everything is correct we will return the user data

  const { email, password, fullName, username } = req.body;

  if (!email || !password || !fullName || !username) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarResponse?.url) {
    throw new ApiError(500, 'Failed to upload avatar');
    
  }

  let coverImageUrl = null;
  if (coverImageLocalPath) {
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);
    if (coverImageResponse?.url) {
      coverImageUrl = coverImageResponse.url;
    }
  }

  const newUser = await User.create({
    email,
    password,
    fullName,
    username: username.toLowerCase(),
    avatar: avatarResponse.url,
    coverImage: coverImageUrl,
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken -__v");
  if (!createdUser) {
    throw new ApiError(500, 'Failed to create user');
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, 'User registered successfully')
  );
});

const loginUser =asyncHandler(async(req,res)=>{
  // Login logic will go here
  // first we will check if the user exists
  // then we will check if the password is correct
  // if everything is correct we will generate a token
  // if everything is correct we will return the user data
    const {email,username,password}=req.body;
    if(!email && !username){
        throw new ApiError(400, 'Email or Username is required');
    }
    const user=await User.findOne({
      $or:[{email}, {username }]
    })
    if(!user){
      throw new ApiError(404,"user not found");
    }
   const isPasswordCorrect = await user.isPasswordCorrect(password);
   if(!isPasswordCorrect) {
     throw new ApiError(401, 'Invalid password');
   }
 const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);
const loggedInUser = await User.findById(user._id).select("-password -refreshToken -__v");
const options={
  httpOnly :true,
  secure:true
}
})
export { registerUser , loginUser };

