const express=require('express');
const authenticatePatient=require('../middlewares/authPatient');
const Patient=require('../models/patient');

const router=express.Router();

router.get('/',authenticatePatient,(req,res)=>{
    res.status(201).json(req.patient);
})

router.patch('/update/:userID',authenticatePatient,async(req,res)=>{
    try {
        const userID=req.params.userID;
        const{name,email,phone,profilePicture}=req.body;
        const patient=await Patient.findOne({userID});
        if(!patient){
            res.status(400).json({error:"User doesn't exist!"});
        }
        else{
            if(!name.trim() || !email.trim() || !phone.trim() || !profilePicture.trim()){
                res.status(400).json({error:"Don't leave any field empty!"});
            }
            else{
                await Patient.updateOne({userID},{
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

router.delete('/delete/:userID',authenticatePatient, async(req,res)=>{
    try {
        const userID=req.params.userID;
        await Patient.findOneAndDelete({userID});
        res.status(200).json({message:"User deleted!"});
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"Can't delete user!"});
    }
})

module.exports=router;