const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const bcrypt = require("bcryptjs");

const bcryptSalt = bcrypt.genSaltSync(10);

const jwtSecret = "dsfadf";

const app = express();

app.use(express.json())

app.use(cors({
    credentials: true,
    origin: "*",
}));

mongoose.connect(process.env.MongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.get("/test", (req, res) => {
    res.json({ "message": "test ok" });
});


app.post("/register",async (req, res) => {
    const {username,email,password} = req.body

    console.log(req.body)

    try{
    const userDoc = await UserModel.create({
        username,
        email,
        password:bcrypt.hashSync(password,bcryptSalt)
        })
    res.json(userDoc)
    }catch(e){
        res.status(422).json(e)
    }
});


app.post("/login",async(req,res)=>{
    const {email,password} = req.body

    console.log(email,password);

    const userDoc= await UserModel.findOne({email});

    if(userDoc){
        const passOk = bcrypt.compareSync(password,userDoc.password)
        if(passOk){
            jwt.sign({
                email:userDoc.email,
                id:userDoc._id
            },jwtSecret,{},(err,token)=>{
                if(err)
                    throw err
                else
                    res.cookie("token",token).json("pass Ok")
            })
        }
        else{
            res.status(422).json("pass Not Ok")
        }
    }
    else{
    res.json("not Found")
    }
})

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
