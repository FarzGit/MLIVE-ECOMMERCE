const bannerDb = require('../models/bannerModel')
const sharp = require('sharp')


const BannerPageLoader = async(req,res)=>{
    try {
        const banners =  await bannerDb.find()
        console.log(banners);
        res.render('banner',{banners})
    } catch (error) {
        console.log(error.message);
    }
}


const bannerUpdate = async(req,res)=>{
    try {
        console.log(req.body);
        const {subhead, Titile, link, bannerTarget} = req.body
        const Banner =  await bannerDb.findOne({bannerNumber: bannerTarget})
        if(!Banner){
            return res.redirect('/admin/banner')
        }
        if(req.file){
            Banner.image = req.file.filename
            await sharp("static/products/banner/temp/" + req.file.filename)
                  .resize(1552, 872)
                  .toFile("static/products/banner/" + req.file.filename);
            
            await sharp("static/products/banner/temp/" + req.file.filename)
            .resize(720, 600)
            .toFile("static/products/banner/mobile/" + req.file.filename);               
        }

        Banner.subtext = subhead
        Banner.mainHead = Titile
        Banner.link = link
        Banner.save()
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    BannerPageLoader,
    bannerUpdate
}