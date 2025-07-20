import mongoose, {isValidObjectId} from "mongoose"
import {Playlist, Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
     if(!name || name.trim().length===0){
        throw new ApiError(400, "Playlist name cannot be empty");
     }
     const playlist=await Playlist.create({
        name,
        description,
        user: req.user._id
     })
     res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const playlist = await Playlist.find({user: userId})
    res.status(200).json(new ApiResponse(200, "User playlists fetched successfully", playlist));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    res.status(200).json(new ApiResponse(200, "Playlist fetched successfully", playlist));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }
    const Playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video already exists in the playlist");
    }
    playlist.videos.push(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playlist));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }
    const Playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(404, "Video not found in the playlist");
    }
    playlist.videos.pull(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playlist));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id");
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    await playlist.remove()
    res.status(200).json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isVaildateObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(!name ||name.trim().length===0){
        throw new ApiError(400,"Playlist name Cannot be Empty")
    }
    const playlist=await Playlist .findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    playlist.name = name
    playlist.description = description || playlist.description
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist,"Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}