const mongoose = require('mongoose');
const skillsList = require('../constants/skills');


const jobSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },

    company: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    skillsRequired: [{
        type: String,
        enum: skillsList
    }],

    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'remote'],
        required: true
    },

    location: {
        type: String,
        required: true
    },

    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    isOpen: {
        type: Boolean,
        default: true
    }

},
{ timestamps: true }

)
module.exports = mongoose.model('Job', jobSchema);