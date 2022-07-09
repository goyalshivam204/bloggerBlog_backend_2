const mongoose=require("mongoose");
const User=require("./User");

const blogSchema=new mongoose.Schema({
    title: String,
    desc:String,
    image:String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

blogSchema.post("save",async function(next){
  
    let blogId = this.id;
    User.findById(this.author,function(err,docs){
        if(err){
            console.log(err);
        }else{
            docs.blogs.push(blogId);
            docs.save(function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(result)
                }
            })
        }
    })
})

const blogModel=mongoose.model("blogs",blogSchema);
module.exports=blogModel;