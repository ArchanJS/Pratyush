const jwt=require('jsonwebtoken');
const Doctor=require('../models/doctor');

const authenticateDoctor=async(req,res,next)=>{


    try {
        let token;
        console.log("h1");
        if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(" ")[1];
        }
        console.log("h2");
        console.log(req.headers.authorization);
        if(!token){
            res.status(401).json({error:"Doctor unauthorized1"});
        }
        console.log("h3");
        console.log(token);
        const verifiedToken=await jwt.verify(token,process.env.SECRET_KEY);
        console.log("h4");
        const doctor= await Doctor.findOne({_id:verifiedToken._id});
        console.log("h5");
        if(!doctor){
            res.status(401).json({error:"Doctor unauthorized2"});
        }
        console.log("h6");
        req.doctor=doctor;
        next();
    } catch (error) {
        res.status(401).json({error:"User unauthorized3"});
        next();
    }
}

module.exports=authenticateDoctor;