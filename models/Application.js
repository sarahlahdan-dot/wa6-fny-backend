const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true

    },

    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
        
    },

    coverNote:{
        type:String,
        default:''
    },

    matchScore:{
        type:Number,
        min:0,
        max:100
    },

    status:{
        type:String,
        enum:['Applied','Reviewing','Accepted','Rejected'],
        default:'Applied'
    },

    appliedAt:{
        type:Date,
        default:Date.now
    }

}
,{timestamps:true}
)

module.exports = mongoose.model('Application',applicationSchema);