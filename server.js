const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path: "./config/dotenv.env"});
// const multer=require("multer");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const Blog=require("./models/Blog");
const User=require("./models/User");
const jwt=require('jsonwebtoken');
const cors = require('cors');
const path=require('path');
const isAuthenticated = require("./isAuthenticated");

try {
    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log("Database connected successfully");
} catch (err) {
    console.log(`mongoose connection failed due to some error:${err}`);
}

// const corsOptions = {
//     origin: '*',
//     credentials: true,            //access-control-allow-credentials:true
//     optionSuccessStatus: 200,
// }

// app.use(cors(corsOptions)) // Use this after the variable declaration
// app.use(cors());
app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    // res.header("Access-Control-Allow-Headers", "Origin, ,X-Requested-With, Content-Type, Accept");
    // res.header("Access-Control-Allow-Headers","x-access-token");

    corsAllowedList = [ 'http://localhost:3000' , 'https://effulgent-churros-88edc4.netlify.app' ]
    console.log(req.headers.origin);
    if (corsAllowedList.indexOf(req.headers.origin) !== -1){
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept,x-access-token');
    }
    // res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
    // res.setHeader("Access-Control-Allow-Origin", 'https://effulgent-churros-88edc4.netlify.app');

    next();
});
// const storage=multer.diskStorage({
//     destination: function(req,file,cb){
//         cb(null,"./public/images/");
//     },
//     filename: function(req,file,cb){
//         // cb(null, Date.now() + file.originalname)
//         cb(null, Date.now()+file.originalname)
//     }
// })


// const fileFilter=(req,file,cb)=>{
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'||file.mimetype === 'image/png'){
//         cb(null,true);
//     }else{
//         cb(null,false);
//     }
// }

// const upload=multer({
//     storage: storage,
//     fileFilter: fileFilter
// })

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse form data
// app.use(upload.array());

// parse cookie with it
app.use(cookieParser());



// Creating a new blog
app.post("/createblog", isAuthenticated, async (req,res)=>{
    
    try{
        console.log("user",req.user);
        if(!req.user){
            res.status(401).json({});
            return;
        }
        
      
        const title=req.body.title;
        const desc=req.body.desc;
        const blog_image=req.body.image;
        const author = req.user.id;
        console.log(req.body,req.user.id);
        let blog=new Blog({title,desc,image: blog_image,author});
        blog=await blog.save();
        res.status(200).json({success: true,user: req.user});
        return;
    }catch(err){
        console.log(err);
        res.status(err.statusCode||500).json({
            success: false,
            message: err

        })
    }
 
});

// sign up route
// app.post("/signup", upload.single("image"),async (req,res)=>{
//     try{
//         const username = req.body.username;
//         const email = req.body.email;
//         const password = req.body.password;

//         // return res.json({ point: "1" });

//         const image = req.file.filename;
//         // console.log(image,username,email,password);
//         // return res.json({point: "1"});
//         const user = new User({ username, email, image, password });
//         // console.log(user);
//         // return res.json({ point: "1" });

//         await user.save();
//         // return res.json({ point: "1" });

//         const options = {
//             httpsOnly: true,
//             expiresIn: new Date(
//                 Date.now + process.env.COOKIE_EXPIRE * 24 * 60 * 1000
//             )
//         }
//         // return res.json({ point: "1" });

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRE
//         });
       
//         res.json({success: true,token: token});
//     }catch(err){
//         console.log(err);
//         res.status(err.statusCode || 500).json({
//             success: false,
//             message: err
//         })
//     }
   
// })

app.post("/signup", async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const image=req.body.image;

        // return res.json({ point: "1" });

       
        // console.log(image,username,email,password);
        // console.log({ username, email, image, password })
        // return res.json({point: "1"});
        const user = new User({ username, email, image, password });
        // console.log(user);
        // return res.json({ point: "1" });

        await user.save();
        // return res.json({ point: "1" });

        const options = {
            httpsOnly: true,
            expiresIn: new Date(
                Date.now + process.env.COOKIE_EXPIRE * 24 * 60 * 1000
            )
        }
        // return res.json({ point: "1" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.json({ success: true, token: token });
    } catch (err) {
        console.log(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err
        })
    }

})

app.post("/login", async (req, res) => {
    try {
        // console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
       
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({success: false,message: "Invalid username"});
        }
        const isSame= await user.comparePassword(password);
        if(!isSame){
            return res.status(401).json({ success: false,message: "Invalid password" });
        }

        const options = {
            httpsOnly: true,
            expiresIn: new Date(
                Date.now + process.env.COOKIE_EXPIRE * 24 * 60 * 1000
            )
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
        return res.cookie("token", token, options).json({ token, expires_in: process.env.COOKIE_EXPIRE * 24 * 60 * 1000 });
    } catch (err) {
        console.log(err);

        res.status(err.statusCode || 500).json({
            success: false,
            message: err

        })
    }

})

app.get("/test",(req,res)=>{
    
  
})


app.get('/blog/:id',async (req,res)=>{
    try{
        const blog = await Blog.findById(req.params.id).populate('author', 'username image', User);
        res.json(blog);
    } catch (err) {
        console.log(err);

        res.status(err.statusCode || 500).json({
            success: false,
            message: err

        })
    }
})

app.get('/image/:url',(req,res)=>{
    try{

        const url = path.join(__dirname, "public/images", req.params.url);
        // console.log(url);
        res.sendFile(url);

    }catch(err){
        console.log(err);

        res.status(err.statusCode || 500).json({
            success: false,
            message: err

        })
    }
  
})

app.get("/myblogs", isAuthenticated, async (req, res) => {
    const myblogs = [];

    try {
        if (!req.user) {
            res.status(401).json({});
        } else {
            for await (const id of req.user.blogs) {
                const blog = await Blog.findById(id);
                myblogs.push(blog);
            }
            res.status(200).json({ success:true,blogs: [...myblogs],user: req.user });
        }
    } catch (err) {
        console.log(err);

        res.status(err.statusCode || 500).json({
            success: false,
            message:  err

        })
    }

})

app.get("/isAuthenticated",isAuthenticated,(req,res)=>{
    if(!req.user){
        res.status(401).json({success: false});
        return;
    }else{
        res.status(200).json({ success: true,user:req.user });
    }

})

app.get("/",isAuthenticated,async (req,res)=>{
    //  res.header("Access-Control-Allow-Origin", "*");
    try{
        // Incorrect(produces "schema hasn't been registered for model" error):
        // const blogs = await Blog.find({}).populate('author');

        // Correct approach:
        // const blogs=await Blog.find({}).populate({ path: 'author', model: User })

        // you can pass the model NAME instead of model instance
        // const blogs=await Blog.find({}).populate({ path: 'author', model: 'User' })
        let blogs;
        // console.log(req.user);

        // console.log(req.user);
        if(req.user){
            // console.log(req.user);
        
            blogs = await Blog.find({ 'author': { $ne: req.user._id }}).populate('author', 'username image', User)
        }else{
            blogs = await Blog.find({ }).populate('author', 'username image', User)
        }
        
      
       
        // console.log(blogs);
        res.json(blogs);
    }catch(err){
        console.log(err);

        res.status(err.statusCode || 500).json({
            success: false,
            message:  err

        })
    }
})



app.listen(process.env.PORT,(req,res)=>{
    console.log(process.env.PORT);
    console.log("server is running at port:",process.env.PORT);
})


