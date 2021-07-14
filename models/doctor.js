const mongoose=require('mongoose');
const bcryptjs=require('bcryptjs');
const validator=require('validator');
const jwt=require('jsonwebtoken');

const doctorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    doctorID:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email !");
            }
        }
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    registrationNo:{
        type:String,
        required:true,
        unique:true
    },
    specialization:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:"https://i.pinimg.com/originals/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.png"
    }
},
    {timestamps:true}
)

doctorSchema.pre("save",async function(next){
    try {
        if(this.isModified("password")){
            this.password = await bcryptjs.hash(this.password,10);
        }
        next();
    } catch (error) {
        console.log(error);
    }
})

doctorSchema.methods.comparePasswords=async function(password){
    try {
        return await bcryptjs.compare(password,this.password);
    } catch (error) {
        return false;
    }
}

doctorSchema.methods.generateToken=async function(){
    try {
        const token=await jwt.sign({_id:this._id},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES});
        return token;
    } catch (error) {
        throw new Error("Token is not generated!");
    }
}

const Doctor= mongoose.model("doctors",doctorSchema);

module.exports=Doctor;