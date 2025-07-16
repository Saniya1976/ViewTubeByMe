import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }
    if(req.user._id.toString()===channelId){
        throw new ApiError(400,"You cannot subscribe to yourself")
    }
    const channel=await Subscription.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel not found")
    }
    const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
  });
 if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }
  // Subscribe
  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId
  });
   return res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
    
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Chhannel Id")
    }
    const subscribers=await Subscription.find({channel:channelId}).
    populate("subscriber", "fullName username avatar");

    return res.status(200).json(
    new ApiResponse(200, subscribers.map(s => s.subscriber), "Subscribers fetched")
  );
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
     if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Chhannel Id")
    }
     const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "fullName username avatar");

  return res.status(200).json(
    new ApiResponse(200, subscriptions.map(s => s.channel), "Subscribed channels fetched"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}