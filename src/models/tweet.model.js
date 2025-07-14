import mongoose, {Schema, SchemaType} from "mongoose";

import { User } from "./user.model.js";
import { Video } from "./video.model.js";
import { Comment } from "./comment.model.js";

const tweetSchema= new Schema(
    {
      owner:{
          type:Schema.Types.ObjectId,
          ref:"User"
        },
       content:{
        type:String,
        required:true
       }

    },{timestamps:true}
)


export const Tweet=mongoose.model("Tweet",tweetSchema);