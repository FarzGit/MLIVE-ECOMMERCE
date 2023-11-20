const Banner = require("../models/bannerModel")
const sharp = require('sharp')


const loadAddbanner = async(req,res)=>{
    try{
        res.render('addbanner')
    }catch(error){
        console.log(error.message)
    }
}

const addBanners = async (req, res) => {
    try {
      const banner = new Banner({
        mainHead: req.body.mainHead,
        typeHead: req.body.type,
        // description: req.body.description,
        image: req.file.filename,
        bannerURL:req.body.bannerURL
      });
      await banner.save();


      // Resize and save the main banner image
    await sharp("public/products/banner/temp/" + req.file.filename)
    .resize(1552, 872)
    .toFile("public/products/banner/" + req.file.filename);

  // Resize and save the mobile version of the banner image
  await sharp("public/products/banner/temp/" + req.file.filename)
    .resize(720, 600)
    .toFile("public/products/banner/mobile/" + req.file.filename);
  
      res.redirect('/admin/banners');
    } catch (error) {
      console.error(error);
      res.redirect('/500'); // Redirect to an error page or handle errors appropriately
    }
  };

  const loadBanners = async(req,res)=>{
    try {
        const search = req.query.search
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
            const condition = {}

            if ( search ){
                condition.$or = [
                    { typeHead : { $regex : search, $options : "i" }},
                    { mainHead : { $regex : search, $options : "i" }},
                    { description : { $regex : search, $options : "i" }}
                ]
            }
       
        const banners = await Banner.find(condition)
        

        res.render( 'banners',{
            banners : banners,
            admin : req.session.admin,
            search : search
           
            
        })
    }catch(error){
        res.status(500).render('500error')
    }
}

module.exports ={
    loadAddbanner,
    addBanners,
    loadBanners

}