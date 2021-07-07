const express=require('express');
const authenticate=require('../middlewares/auth');

const router=express.Router();

router.get('/',authenticate,(req,res)=>{
    res.status(201).json({message:"Welcome to private home page!"});
})

module.exports=router;