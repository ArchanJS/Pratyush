const express=require('express');
const authenticate=require('../middlewares/auth');
const User=require('../models/user');

const router=express.Router();

router.get('/',authenticate,(req,res)=>{
    res.status(201).json({message:"Welcome to private home page!"});
})

router.patch('/update/:userID',authenticate,async(req,res)=>{
    try {
        const userID=req.params.userID;
        const{name,email,phone,profilePicture}=req.body;
        const user=await User.findOne({userID});
        if(!user){
            res.status(400).json({error:"User doesn't exist!"});
        }
        else{
            if(!name.trim() || !email.trim() || !phone.trim() || !profilePicture.trim()){
                res.status(400).json({error:"Don't leave any field empty!"});
            }
            else{
                await User.updateOne({userID},{
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

module.exports=router;