import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Error generating tokens');
  }
};

const registerUser = asyncHandler(async (req, res) => {
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, 'Email or Username is required');
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password');
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -__v");

  const options = {
    httpOnly: true,
    secure: true
  };

  res.status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new ApiResponse(200, loggedInUser, 'User logged in successfully'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessandRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
