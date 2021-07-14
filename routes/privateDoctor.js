const express=require('express');
const authenticateDoctor=require('../middlewares/authDoctor');
const Doctor=require('../models/doctor');

const router=express.Router();

router.get('/',authenticateDoctor,(req,res)=>{
    res.status(201).json(req.doctor);
})

module.exports=router;