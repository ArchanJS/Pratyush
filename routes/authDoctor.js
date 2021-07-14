const express = require('express');
const Doctor = require('../models/doctor');
const sendEmail=require('../utils/sendEmail');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');

const router = express();

router.get('/', (req, res) => {
    res.status(201).send("Welcome to home!");
})

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone,  registrationNo, specialization, password } = req.body;
        if (name.trim() != "" || email.trim() != "" || phone.trim() != "" || password.trim() != "" || registrationNo.trim() != "" || specialization.trim() != "") {
            const characters ="abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let doctorID = "d";
            const charactersLength = characters.length;

            while (true) {
                for (var i = 0; i < 5; i++) {
                    doctorID += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let checkDoctor = await Doctor.findOne({ doctorID });
                if (checkDoctor != null) {
                    doctorID = "d";
                    continue;
                } else {
                    break;
                }
            }

            const doctor = new Doctor({ name, doctorID, email, phone, registrationNo, specialization, password });
            await doctor.save();
            const token = await doctor.generateToken();
            sendEmail({
                user:doctor.email,
                subject:"Verify email",
                html:`<h1>Registration successful</h1><br><h4>Welcome to our website Dr. ${doctor.name}. Click on the following button to verify your email.</h4><br><a href="http://localhost:3000/verifyemail/${token}" target="_blank"><button style="color: white;background: purple;cursor: pointer;">Click here to verify email</button></a>`
            })
            res.status(201).json({ message: "Doctor created!" });
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
            const doctor=await Doctor.findOne({email});
            console.log("hi2");
            if(!doctor){
                res.status(400).json({ error: "Doctor not found!" });
            }
            else{
                const checkPass=await doctor.comparePasswords(password);
                console.log("hi3");
                if(!checkPass){
                    res.status(400).json({error:"Invalid credentials!1"});
                }
                else{
                    console.log("hi4");
                    const token = await doctor.generateToken();
                    res.status(201).send(token);
                    console.log(doctor);
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
        const doctor= await Doctor.findOne({_id:verifiedToken._id});
        if(!doctor){
            res.status(401).json({error:"User doesn't exist!"});
        }
        else{
            let doctorID=doctor.doctorID;
            let verified=true;
            await Doctor.updateOne({doctorID},{
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
        const doctor=await Doctor.findOne({email});
        const token = await doctor.generateToken();
        sendEmail({
            user:doctor.email,
            subject:"Reset pasword",
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
        const doctor= await Doctor.findOne({_id:verifiedToken._id});
        if(!doctor){
            res.status(401).json({error:"Doctor doesn't exist!"});
        }
        else{
            let doctorID=doctor.doctorID;
            await Doctor.updateOne({doctorID},{
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