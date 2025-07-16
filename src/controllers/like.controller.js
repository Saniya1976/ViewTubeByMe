import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked"));
    }
    await Like.create({
        video:videoId,
        likedBy:req.user._id
    });
    return res.status(201).json(new ApiResponse(201, null, "Video liked"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
  if(!isValidObjectId(commentId)){
    throw new ApiError(400,"Invalid CommentId")
  }
  const existingLike=await Like.findOne({
    comment:commentId,
    likedBy:req.user._id
  });
  if(existingLike){
    await Like.deleteOne(commentId);
     return res.status(200).json(new ApiResponse(200, null, "Comment unliked"));
  }
  await Like.create({
    comment:commentId,
    likedBy:req.user._id
  })
return res.status(201).json(new ApiResponse(201, null, "Comment liked"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }
    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    });
    if(existingLike){
        await Like.deleteOne(tweetId);
       return res.status(200).json(new ApiResponse(200, null, "Tweet unliked"));
    }
   await Like.create({
      tweet:tweetId,
        likedBy:req.user._id
   }) 
   res.status(200).json(
    new ApiResponse(
        200,
        null,
        "Tweet Unliked"
    )
   )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }
    }).populate("video"); 

    const likedVideos = likes.map(like => like.video);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}