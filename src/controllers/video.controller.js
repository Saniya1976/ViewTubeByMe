import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const filter = {};
  if (query) filter.title = { $regex: query, $options: "i" };
  if (userId) filter.owner = userId;

  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .populate("owner", "username fullName avatar")
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Video.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, { videos, total }, "Videos fetched successfully"));
})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
   const videoLocaLpath=req.files?.video?.[0]?.path;
   const thumbnailLocaLpath=req.files?.thumbnail?.[0]?.path;
   if(!videoLocaLpath||!thumbnailLocaLpath){
    throw new ApiError(400 ,"Video and thumbnail are required")
   }
   const videoRes=await uploadOnCloudinary(videoLocaLpath);
   const thumbnailRes=await uploadOnCloudinary(thumbnailLocaLpath);
   const newVideo=await Video.create({
    videoFile:videoRes.url,
    thumbnail:thumbnailRes.url,
    title,
    description,
    owner:req.user._id
   })
   res.status(200).json(new ApiResponse(
    200,
    newVideo,
    "Video published"
   ))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID");
    }
    const video=await Video.findById(videoId).populate("owner","username avatar fullNmae");
    if(!video){
        throw new ApiError(404,"video not found")
    }
    res.status(200).json(new ApiResponse(
        200,
        video,
        "Video Fetched"
    ))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description}=req.body;
    
    const video=await Video.findByIdAndUpdate(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(400,"Not allowed");
    }
    res.status(200).json(new ApiResponse(
        200,
        video,
        "Video Updated Successfully"
    ))
 } );  


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   const video=await Video.findById(videoId);
   if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(400,"Not allowed");
    }
    await Video.deleteOne();
    res.status(200).json(new ApiResponse(
        200,
        video,
        "Video deleted"
    ))
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video=await Video.findById(videoId);
   if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(400,"Not allowed");
    }
    video.isPublished=!video.isPublished;
    await video.save();
    res.status(200).
    json(new ApiResponse(
        200,
        video,
        `Video is now ${video.isPublished ? "Published" : "Unpublished"}`
    ));
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
