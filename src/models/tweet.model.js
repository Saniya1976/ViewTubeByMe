import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "./user.model.js";
import { Video } from "./video.model.js";
import { Comment } from "./comment.model.js";

const tweetSchema= new Schema(
    {
      owner:{
          type:Schema.Types.ObjectId,
          ref:"User"
        },
       tweet:{
        type:String,
        required:true
       },

    },{timestamps:true}
)


commentSchema.plugin(mongooseAggregatePaginate);
export const Tweet=mongoose.model("Tweet",tweetSchema);