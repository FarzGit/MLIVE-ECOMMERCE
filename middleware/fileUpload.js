const multer = require('multer')
const path = require('path')




const storageBanner = multer.diskStorage({
    destination:function(req,file,callbacks){
        callbacks(null,path.join(__dirname, '../public/products/Banner/temp'))
    },
    filename:function(req,file,callbacks){
        const  name = Date.now()+"-"+file.originalname;
        callbacks(null,name)
    }
  })
  
  const uploadBanner = multer({storage:storageBanner})




  module.exports={
    
    uploadBanner
}