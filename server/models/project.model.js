const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    name:{
        type:String,
        required:[true, "Please provide a project name"]
    },
    description:{
        type:String,
        default:""
    },
    orignalFilename:{
        type:String,
        required:[true, "Please provide a project orignal filename"]
    },
    totalFiles:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["processing", "completed", "failed"],
        default:"processing"
    },

},
{timestamps:true}
)


module.exports = mongoose.model('Project', projectSchema);