import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Total videos
    const videos = await Video.find({ channel: channelId });
    const totalVideos = videos.length;

    // Total views & likes
    let totalViews = 0;
    let totalLikes = 0;

    for (const video of videos) {
        totalViews += video.views || 0;
        const likeCount = await Like.countDocuments({ video: video._id });
        totalLikes += likeCount;
    }
    const stats = {
        channelId,
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes
    };

    res.status(200).json(new ApiResponse(true, stats, "Channel stats fetched successfully"));
});

// 🎥 Get all videos for a channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { video } = req.params;

    if (!isValidObjectId(video)) {
        throw new ApiError(400, "Invalid Channel ID (as video param)");
    }

    const channelVideos = await Video.find({ channel: video })
        .populate("channel", "fullName username avatar")
        .populate({
            path: "likes",
            select: "likedBy", // only return likedBy field
        });

    res.status(200).json(new ApiResponse(true, channelVideos, "Channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
};
