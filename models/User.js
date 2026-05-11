const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    hashedPassword: {
      type: String,
      required: true
    },
    email:{
      type:String,
      required:true,
      unique: true,
    },

    role:{
      enum:["seeker","employer"],
      require:true,
    },

    skills:[{
      type:String,
      enum:skillsList
    }],

    bio: {
        type: String,
        default: ''
    },
   location:{
    type:String,
    default:'Bahrain'
   },
   profileComplete:{
    type:Boolean,
    default:false
   },
  },
  { timestamps: true }
  
);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    }
});

module.exports = mongoose.model('User', userSchema);