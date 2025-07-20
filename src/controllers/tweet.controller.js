import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content || content.trim().length === 0){
        throw new ApiError(400, "Tweet content cannot be empty");
    }
    const addTweet= await Tweet.create({
        content,
        owner:req.user._id
    })
    await addTweet.populate("owner", "fullName username avatar");
    res.status(201).json(new ApiResponse(201, "Tweet created successfully", addTweet));
   
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }
})
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }
    const {content} = req.body
    if(!content || content.trim().length === 0){
        throw new ApiError(400, "Tweet content cannot be empty");
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }
    tweet.content = content;
    await tweet.save();
    await tweet.populate("owner", "fullName username avatar");
    return res.status(200).json(new ApiResponse(true, tweet, "Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }   
    await tweet.remove();
    return res.status(200).json(new ApiResponse(true, tweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}