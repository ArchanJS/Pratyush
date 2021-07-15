const mongoose=require('mongoose');
const bcryptjs=require('bcryptjs');
const validator=require('validator');
const jwt=require('jsonwebtoken');

const patientSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userID:{
        type:String,
        required:true,
        unique:true
    },
    verified:{
        type:Boolean,
        default:false
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

patientSchema.pre("save",async function(next){
    try {
        if(this.isModified("password")){
            this.password = await bcryptjs.hash(this.password,10);
        }
        next();
    } catch (error) {
        console.log(error);
    }
})

patientSchema.methods.comparePasswords=async function(password){
    try {
        return await bcryptjs.compare(password,this.password);
    } catch (error) {
        return false;
    }
}

patientSchema.methods.generateToken=async function(){
    try {
        const token=await jwt.sign({_id:this._id},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES});
        return token;
    } catch (error) {
        throw new Error("Token is not generated!");
    }
}

const Patient= mongoose.model("patients",patientSchema);

module.exports=Patient;