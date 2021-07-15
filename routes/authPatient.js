const express = require('express');
const Patient = require('../models/patient');
const sendEmail=require('../utils/sendEmail');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');

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

                let checkPatient = await Patient.findOne({ userID });
                if (checkPatient != null) {
                    userID = "u";
                    continue;
                } else {
                    break;
                }
            }

            const patient = new Patient({ name, userID, email, phone, password });
            await patient.save();
            const token = await patient.generateToken();
            sendEmail({
                user:patient.email,
                subject:"Verify email",
                html:`<h1>Registration successful</h1><br><h4>Welcome to our website ${patient.name}. Click on the following button to verify your email.</h4><br><a href="http://localhost:3000/verifyemail/${token}" target="_blank"><button style="color: white;background: purple;cursor: pointer;">Click here to verify email</button></a>`
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
        const { email, password } = req.body;
        console.log("hi1");
        if(!email.trim() || !password.trim()){
            res.status(400).json({ error: "Please enter all the details!" });
        }
        else{
            const patient=await Patient.findOne({email});
            console.log("hi2");
            if(!patient){
                res.status(400).json({ error: "User not found!" });
            }
            else{
                const checkPass=await patient.comparePasswords(password);
                console.log("hi3");
                if(!checkPass){
                    res.status(400).json({error:"Invalid credentials!1"});
                }
                else{
                    console.log("hi4");
                    const token = await patient.generateToken();
                    res.status(201).send(token);
                    console.log(patient);
                }
            }
        }

    } catch (error) {
        res.status(401).json({ error: "Invalid credentials!2" });
    }
})

router.get('/verify/:token',async(req,res)=>{
    try {
        const token=req.params.token;
        console.log("hi1");
        const verifiedToken=await jwt.verify(token,process.env.SECRET_KEY);
        const patient= await Patient.findOne({_id:verifiedToken._id});
        if(!patient){
            res.status(401).json({error:"User doesn't exist!"});
        }
        else{
            let userID=patient.userID;
            let verified=true;
            await Patient.updateOne({userID},{
                $set:{
                    verified
                }
            })
            res.status(201).json({message:"User verified!"});
        }
    } catch (error) {
        res.status(400).json({error:"Something went wrong!"})
    }
})

router.post('/forgotpassword',async(req,res)=>{
    try {
        const {email}=req.body;
        const patient=await Patient.findOne({email});
        const token = await patient.generateToken();
        sendEmail({
            user:patient.email,
            subject:"Reset password",
            html:`<h1>Reset password</h1><br><h4>Click on the following button to reset your password.</h4><br><a href="http://localhost:3000/resetpassword/${token}" target="_blank"><button style="color: white;background: purple;cursor: pointer;">Reset password.</button></a>`
        })
        res.status(200).json({message:"Mail sent!"});
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"Something went wrong!"});
    }
})

router.post('/resetpassword/:token',async(req,res)=>{
    try {
        const token=req.params.token;
        let {password}=req.body;
        password = await bcryptjs.hash(password,10);
        console.log("hi1");
        const verifiedToken=await jwt.verify(token,process.env.SECRET_KEY);
        const patient= await Patient.findOne({_id:verifiedToken._id});
        if(!patient){
            res.status(401).json({error:"User doesn't exist!"});
        }
        else{
            let userID=patient.userID;
            await Patient.updateOne({userID},{
                $set:{
                    password
                }
            })
            res.status(200).json({message:"Password updated!"});
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"Something went wrong!"});
    }
})

module.exports = router;