const userDb = require('../models/userModel')
// const io = require('socket.io')










const chatPageLoad = async(req,res)=>{

    try{

        console.log("safsadfsfdsadf",req.session.user_id);

        
        res.render('chat')

    }catch(error){
        console.log(error.message)
        res.render("admin500")

    }
}


const adminChatPageLoad = async(req,res)=>{
    try{
        res.render('adminChat')
    }catch(error){
        console.log(error.message)
        res.render("admin500")

    }
}




module.exports = {
    chatPageLoad,
    adminChatPageLoad
}