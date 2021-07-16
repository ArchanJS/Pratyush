const express=require('express');
const authenticateDoctor=require('../middlewares/authDoctor');
const Doctor=require('../models/doctor');
const bcryptjs=require('bcryptjs');

const router=express.Router();

router.get('/',authenticateDoctor,(req,res)=>{
    res.status(201).json(req.doctor);
})

router.patch('/update/:userID',authenticateDoctor,async(req,res)=>{
    try {
        const userID=req.params.userID;
        const{name,email,phone,profilePicture}=req.body;
        const doctor=await Doctor.findOne({userID});
        if(!doctor){
            res.status(400).json({error:"User doesn't exist!"});
        }
        else{
            if(!name.trim() || !email.trim() || !phone.trim() || !profilePicture.trim()){
                res.status(400).json({error:"Don't leave any field empty!"});
            }
            else{
                await Doctor.updateOne({userID},{
                    $set:{
                        name,email,phone,profilePicture
                    }
                })
                res.status(201).json({message:"User updated!"});
            }
        }
    } catch (error) {
        res.status(400).json({error:"Can't update!"})
    }
})

router.patch('/updatepassword/:userID',authenticateDoctor,async(req,res)=>{
    try {
        const userID=req.params.userID;
        let {password}=req.body;
        const doctor= await Doctor.findOne({userID});
        if(!doctor){
            res.status(400).json({error:"User doesn't exist!"});
        }
        else{
            password=await bcryptjs.hash(password,10);
            await Doctor.updateOne({userID},{
                $set:{
                    password
                }
            })
            res.status(201).json({message:"Password updated!"});
        }
    } catch (error) {
        res.status(400).json({error:"Can't update password!"});
    }
})

router.delete('/delete/:userID',authenticateDoctor, async(req,res)=>{
    try {
        const userID=req.params.userID;
        await Doctor.findOneAndDelete({userID});
        res.status(200).json({message:"User deleted!"});
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"Can't delete user!"});
    }
})

module.exports=router;