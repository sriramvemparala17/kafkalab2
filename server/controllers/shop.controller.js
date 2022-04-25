import Shop from '../models/shop.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'
import defaultImage from './../../client/assets/images/default.png'

var kafka = require('../kafka/client');

const create = (req, res) => {
  console.log("Try to create");
  req.body.command = "create";
  req.body.profile = {...req.profile}

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Photo could not be uploaded",
      });
    }
  
    req.body.fields = fields;
    req.body.files = files;
    
    kafka.make_request('shop',req.body, function(err,results){
      console.log('in shop result',err,results);
  
      if (err){
          console.log("Inside shop err",err);
          return res.status('400').json({
            error: err
          })
      }else{
          console.log("shop created",results);
          var result = results[0];
          res.status(200).json(result)
        }
      
      });
  

  });
  
  
  return;

  let formx = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let shop = new Shop(fields)
    shop.owner= req.profile
    if(files.image){
      shop.image.data = fs.readFileSync(files.image.path)
      shop.image.contentType = files.image.type
    }
    try {
      let result = await shop.save()
      res.status(200).json(result)
    }catch (err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const shopByID = async (req, res, next, id) => {
  console.log("Try to orderByID");
  req.body.command = "shopByID";
  req.body.theShopId = id;
  
  kafka.make_request('shop',req.body, function(err,results){
    console.log('in shop shopByID result',err,results);

    if (err){
        console.log("Inside shop shopByID err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order shopByID updated",results);
        var result = results[0];
        req.shop = result;
        next();
      }
    
    });

    return;

  try {
    let shop = await Shop.findById(id).populate('owner', '_id name').exec()
    if (!shop)
      return res.status('400').json({
        error: "Shop not found"
      })
    req.shop = shop
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve shop"
    })
  }
}

// const photo = (req, res, next) => {
//   if(req.shop.image.data){
//     res.set("Content-Type", req.shop.image.contentType)
//     return res.send(req.shop.image.data)
//   }
//   next()
// }
const photo = async (req, res) => {
  try {
    let shop = await Shop.findById(req.params.theShopId)
    if (!shop)
      return res.status("400").json({
        error: "shop not found",
      });
    else if (!shop.image || !shop.image.data){
      // console.log("default image sent")
      return res.sendFile(process.cwd() + defaultImage);
    }
    // console.log("actual image sent",shop.image)
    res.set("Content-Type", shop.image.contentType);
    return res.send(shop.image.data);
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve shop",
    });
  }
}

const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd()+defaultImage)
}

const read = (req, res) => {
  req.shop.image = undefined
  return res.json(req.shop)
}

const update = (req, res) => {
  console.log("Try to create");
  req.body.command = "update";
  req.body.shop = req.shop;

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Photo could not be uploaded",
      });
    }
  
    req.body.fields = fields;
    req.body.files = files;
    
    kafka.make_request('shop',req.body, function(err,results){
      console.log('in shop result',err,results);
  
      if (err){
          console.log("Inside shop err",err);
          return res.status('400').json({
            error: err
          })
      }else{
          console.log("shop updated",results);
          var result = results[0];
          res.json(result)
        }
      
      });
  

  });
  
  
  return;
  
  let formx = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Photo could not be uploaded"
      })
    }
    let shop = req.shop
    shop = extend(shop, fields)
    shop.updated = Date.now()
    if(files.image){
      shop.image.data = fs.readFileSync(files.image.path)
      shop.image.contentType = files.image.type
    }
    try {
      let result = await shop.save()
      res.json(result)
    }catch (err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  console.log("Try to remove shop");
  req.body.command = "remove";
  req.body.shop = {...req.shop};
  
  kafka.make_request('shop',req.body, function(err,results){
    console.log('in shop remove result',err,results);

    if (err){
        console.log("Inside shop remove err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order remove updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;
  
    try {
    let shop = req.shop
    let deletedShop = shop.remove()
    res.json(deletedShop)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }  
}

const list = async (req, res) => {
  console.log("Try to list shop");
  req.body.command = "list";
  req.body.query = {...req.query};
  
  kafka.make_request('shop',req.body, function(err,results){
    console.log('in shop list result',err,results);

    if (err){
        console.log("Inside shop list err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order list updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;

try {
    let shops = await Shop.find()
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByOwner = async (req, res) => {
  console.log("Try to listByOwner shop");
  req.body.command = "listByOwner";
  req.body.profile = {...req.profile};
  
  kafka.make_request('shop',req.body, function(err,results){
    console.log('in shop listByOwner result',err,results);

    if (err){
        console.log("Inside shop listByOwner err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order listByOwner updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return

    try {
    let shops = await Shop.find({owner: req.profile._id}).populate('owner', '_id name')
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const isOwner = (req, res, next) => {
  const isOwner = req.shop && req.auth && req.shop.owner._id == req.auth._id
  console.log("isOwner",req.shop, req.auth, req.shop.owner._id, req.auth._id)
  if(!isOwner){
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  create,
  shopByID,
  photo,
  defaultPhoto,
  list,
  listByOwner,
  read,
  update,
  isOwner,
  remove
}
