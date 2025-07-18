import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const comments=await Comment.find({video:videoId})
    .populate("user", "fullName username avatar")
    .sort({createdAt: -1})

    .skip((page - 1) * limit)
    .limit(limit * 1);
    const totalComments = await Comment.countDocuments({video: videoId});
    return res.status(200).json(new ApiResponse(true, comments, "Video comments fetched successfully", {
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit)
    }));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const {content} = req.body
    if(!content || content.trim().length === 0){
        throw new ApiError(400, "Comment content cannot be empty");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        user: req.user._id
    });
    await comment.populate("user", "fullName username avatar");
    return res.status(201).json(new ApiResponse(true, comment, "Comment added successfully"
    ));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }