const jwt=require("jsonwebtoken");
const User=require("./models/User");
const Blog=require("./models/Blog");

module.exports=async (req,res,next)=>{
   
    try{
        const token = req.headers["x-access-token"];
        // console.log(token);
        if (token == 'undefined' || !token) {
            console.log("no token present");
            req.user=null;
            next();
            return;
        }

        var decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        req.user=user;
        next();
        return;
    }catch(err){

        res.status(err.statusCode || 500).json({
            success: false,
            message: err
            
        })
        return;
    }
}