 const isLogin= async (req,res,next)=>{
  try {
    if(req.session.user_id){
      next()
    }
    else{
      res.redirect('/')
    }
    
     
  } catch (error) {
    console.log(error);
        res.status(500).send('Server Error');
    
  }
}

const isLogout = async (req,res,next)=>{
  try {
    if(req.session.user_id){
      res.redirect('/')
    }else{
      next()
    }
   
  } catch (error) {
   
    console.log(error);
    res.status(500).send('Server Error');
  }
}


module.exports = {
  isLogin,
  isLogout 
}