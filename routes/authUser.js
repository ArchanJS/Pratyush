const express = require('express');
const User = require('../models/user');
const sendEmail=require('../utils/sendEmail');
const jwt=require('jsonwebtoken');

const router = express();

router.get('/', (req, res) => {
    res.status(201).send("Welcome to home!");
})

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (name.trim() != "" || email.trim() != "" || phone.trim() != "" || password.trim() != "") {
            const characters ="abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let userID = "u";
            const charactersLength = characters.length;

            while (true) {
                for (var i = 0; i < 5; i++) {
                    userID += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let checkUser = await User.findOne({ userID });
                if (checkUser != null) {
                    userID = "u";
                    continue;
                } else {
                    break;
                }
            }

            const user = new User({ name, userID, email, phone, password });
            await user.save();
            const token = await user.generateToken();
            sendEmail({
                user:user.email,
                subject:"Login",
                html:`<h1>Login successful</h1><br><h4>Welcome to our website ${user.name}.Here is your token ${token}</h4>`
            })
            res.status(201).json({ message: "User created!" });
        }
        else {
            res.status(400).json({ error: "Please enter all the details!" });
        }
    } catch (error) {
        res.status(400).json({ error: "Something went wrong!" })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { userID, password } = req.body;
        console.log("hi1");
        if(!userID.trim() || !password.trim()){
            res.status(400).json({ error: "Please enter all the details!" });
        }
        else{
            const user=await User.findOne({userID});
            console.log("hi2");
            if(!user){
                res.status(400).json({ error: "User not found!" });
            }
            else{
                const checkPass=await user.comparePasswords(password);
                console.log("hi3");
                if(!checkPass){
                    res.status(400).json({error:"Invalid credentiials!1"});
                }
                else{
                    console.log("hi4");
                    const token = await user.generateToken();
                    res.status(201).send(token);
                    console.log(user);
                }
            }
        }

    } catch (error) {
        res.status(401).json({ error: "Invalid credentials!2" });
    }
})

router.post('/verify/:token',async(req,res)=>{
    try {
        const token=req.params.token;
        console.log("hi1");
        const verifiedToken=await jwt.verify(token,process.env.SECRET_KEY);
        const user= await User.findOne({_id:verifiedToken._id});
        if(!user){
            res.status(401).json({error:"User doesn't exist!"});
        }
        else{
            let userID=user.userID;
            let verified=true;
            await User.updateOne({userID},{
                $set:{
                    verified
                }
            })
            res.status(201).json({message:"User verified!"});
        }
    } catch (error) {
        res.status(401).json({error:"Something went wrong!"})
    }
})

module.exports = router;