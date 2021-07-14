const express=require('express');
const authenticateUser=require('../middlewares/authUser');
const User=require('../models/user');

const router=express.Router();

router.get('/',authenticateUser,(req,res)=>{
    res.status(201).json(req.user);
})

router.patch('/update/:userID',authenticateUser,async(req,res)=>{
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

router.delete('/delete/:userID',authenticateUser, async(req,res)=>{
    try {
        const userID=req.params.userID;
        await User.findOneAndDelete({userID});
        res.status(200).json({message:"User deleted!"});
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"Can't delete user!"});
    }
})

module.exports=router;