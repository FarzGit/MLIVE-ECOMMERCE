const User = require("../models/userModel")
const bcrypt = require('bcrypt')


const insertUser = async(req,res)=>{
    try{
        const user =new User({
            firstName:req.body.fname,
            lastName:req.body.lname,
            email:req.body.email,
            mobile:req.body.phone,
            password:req.body.password,
            is_admin:0
        })
        const userData =await user.save()

            if(userData){
                res.render("registration",{
                    message:"your registration successfully"
                })
            }else{
                res.render("registration",{
                    message:"your registration successfully"
                })

            }

    }catch(error){
        console.log(error.message);
    }

}







const loadlogin = async(req,res)=>{
    try{
        res.render("login")

    }catch(error){
        console.log(error.message);
    }
}


const loadResgister = async (req,res)=>{
    try{
        res.render('registration')

    }catch(error){
        console.log(error.message);
    }
}




module.exports = {
    loadlogin,
    loadResgister,
    insertUser
}


