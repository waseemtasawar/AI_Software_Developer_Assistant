const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    filename:{
        type:String,
        required:[true, "Please provide a file name"]
    },
    filepath:{
        type:String,
        required:[true, "Please provide a file path"]
    },
    extension:{
        type:String,
        default:""
    },
    language:{
        type:String,
        default:"text"
    },
    content:{
        type:String,
        required:[true, "Please provide file content"]
    },
    size:{
        type:Number,
        default:0
    }
},
{timestamps:true}
)

module.exports = mongoose.model('File', fileSchema);