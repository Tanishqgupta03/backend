import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new Schema({
    videoFile: {
        type: String, //cludinary url
        required: true
    },
    thumbnail: {
        type: String, //cludinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, //cludinary url
        required: true
    },
    videoFile: {
        type: Number,
        defualt: 0
    },
    isPublished: {
        type: Boolean,
        default: true 
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},{
   timestamps: true 
})

videoSchema.plugin(mongooseAggregatePaginate)// ab yaha isko use krke aggregation pipeline likh skte hein.

export const Video = mongoose.model("Video", videoSchema)