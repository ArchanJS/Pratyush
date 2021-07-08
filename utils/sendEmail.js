const nodemailer=require('nodemailer');

const sendEmail=(contents)=>{
    let transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"noreply.pratyush",
            pass:"Pratyush@621"
        }
    })

    let details={
        from:"noreply.pratyush@gmail.com",
        to:contents.user,
        subject:contents.subject,
        html:contents.html
    }

    transporter.sendMail(details,function(err,res){
        if(err){
            console.log(err);
        }
        else{
            console.log(res)
        }
    })
}

module.exports=sendEmail;