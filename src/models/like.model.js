import mongoose, {Schema} from "mongoose";

import { User } from "./user.model.js";
import { Video } from "./video.model.js";
import { Comment } from "./comment.model.js";
import {tweet} from "./tweet.model.js";

const likeschema=new Schema(
    {
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        comment:{
             type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
             type:Schema.Types.ObjectId,
             ref:"Tweet"
        },
        videos:{
              type:Schema.Types.ObjectId,
              ref:"Video"
        }
    },{timestamps:true}
)



export const Like = mongoose.model("Like", likeSchema);