const mongoose = require("mongoose"); 
const Blog=require("./Blog");
const bcrypt=require("bcrypt");

const userSchema=new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    image: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Blog
        }
    ]
})

userSchema.pre("save",async function(next){
    if (!this.isModified("password")){
        next();
    }
    this.password =await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const userModel= mongoose.model("users",userSchema);
module.exports=userModel;