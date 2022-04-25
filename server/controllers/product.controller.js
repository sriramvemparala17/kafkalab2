import Product from "../models/product.model";
import extend from "lodash/extend";
import errorHandler from "./../helpers/dbErrorHandler";
import formidable from "formidable";
import fs from "fs";
import defaultImage from "./../../client/assets/images/default.png";

var kafka = require('../kafka/client');

const create = (req, res, next) => {
  console.log("Try to create");
  req.body.command = "create";
  req.body.shop = {...req.shop};


  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Image could not be uploaded",
      });
    }
  
    req.body.fields = fields;
    req.body.files = files;
    
    kafka.make_request('product',req.body, function(err,results){
      console.log('in product result',err,results);
  
      if (err){
          console.log("Inside product err",err);
          return res.status('400').json({
            error: err
          })
      }else{
          console.log("product updated",results);
          var result = results[0];
          res.json(result);
        }
      
      });
  

  });
  
  
  return;

  let formx = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Image could not be uploaded",
      });
    }
    let product = new Product(fields);
    product.shop = req.shop;
    if (files.image) {
      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }
    try {
      let result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

const productByID = async (req, res, next, id) => {
  console.log("Try to orderByID");
  req.body.command = "productByID";
  req.body.theProductId = id;
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product productByID result',err,results);

    if (err){
        console.log("Inside product productByID err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order productByID updated",results);
        var result = results[0];
        req.product = result;
        next();
      }
    
    });

    return;

  try {
    let product = await Product.findById(id)
      .populate("shop", "_id name")
      .exec();
    if (!product)
      return res.status("400").json({
        error: "Product not found",
      });
    req.product = product;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve product",
    });
  }
};

// const photo = (req, res, next) => {
//   console.log("Try to photo");
//   req.body.command = "photo";
//   req.body.theProductId = req.params.theProductId;
  
//   kafka.make_request('product',req.body, function(err,results){
//     console.log('in product photo result',err,results);

//     if (err){
//         console.log("Inside product photo err",err);
//         return res.status('403').json({
//           error: err
//         })
//     }else{
//         console.log("order photo updated",results);
//         var result = results[0];
//         if (result.data) {
//           res.set("Content-Type", result.contentType);
//           return res.send(result.data);
//         }
//         next();
//       }
    
//     });

//     return;
// if (req.product.image.data) {
//     res.set("Content-Type", req.product.image.contentType);
//     return res.send(req.product.image.data);
//   }
//   next();
// };
const photo = async (req, res) => {
  try {
    let product = await Product.findById(req.params.theProductId)
    if (!product)
      return res.status("400").json({
        error: "Product not found",
      });
    else if (!product.image || !product.image.data){
      // console.log("default image sent")
      return res.sendFile(process.cwd() + defaultImage);
    }
    // console.log("actual image sent",product.image)
    res.set("Content-Type", product.image.contentType);
    return res.send(product.image.data);
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve product",
    });
  }
};
const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + defaultImage);
};

const read = (req, res) => {
  req.product.image = undefined;
  return res.json(req.product);
};

const isfav = async (req, res) => {
  return res.json(req.product["isfav"]);
};

const update = (req, res) => {
  console.log("Try to create");
  req.body.command = "update";
  req.body.product = req.product;

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
    
    kafka.make_request('product',req.body, function(err,results){
      console.log('in product result',err,results);
  
      if (err){
          console.log("Inside product err",err);
          return res.status('400').json({
            error: err
          })
      }else{
          console.log("product updated",results);
          var result = results[0];
          res.json(result);
        }
      
      });
  

  });
  
  
  return;
  let formx = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "Photo could not be uploaded",
      });
    }
    let product = req.product;
    product = extend(product, fields);
    product.updated = Date.now();
    if (files.image) {
      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }
    try {
      let result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

const remove = async (req, res) => {
  console.log("Try to remove product");
  req.body.command = "remove";
  req.body.product = req.product;
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product remove result',err,results);

    if (err){
        console.log("Inside product remove err",err);
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
    let product = req.product;
    let deletedProduct = await product.remove();
    res.json(deletedProduct);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByShop = async (req, res) => {
  console.log("Try to listByShop product");
  req.body.command = "listByShop";
  req.body.shop = req.shop;
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product listByShop result',err,results);

    if (err){
        console.log("Inside product listByShop err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order listByShop updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;
  try {
    let products = await Product.find({ shop: req.shop._id })
      .populate("shop", "_id name")
      .select("-image");
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listLatest = async (req, res) => {
  console.log("Try to listLatest product");
  req.body.command = "listLatest";
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product listLatest result',err,results);

    if (err){
        console.log("Inside product listLatest err",err);
        return res.status('400').json({
          error: err
        })
    }else{
        console.log("order listLatest updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;
  try {
    let products = await Product.find({})
      .sort("-created")
      .limit(5)
      .populate("shop", "_id name")
      .exec();
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listRelated = async (req, res) => {
  console.log("Try to listRelated product");
  req.body.command = "listRelated";
  req.body.product = req.product;
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product listRelated result',err,results);

    if (err){
        console.log("Inside product listRelated err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order listRelated updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;

  try {
    let products = await Product.find({
      _id: { $ne: req.product },
      category: req.product.category,
    })
      .limit(5)
      .populate("shop", "_id name")
      .exec();
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listCategories = async (req, res) => {
  console.log("Try to listCategories product");
  req.body.command = "listCategories";
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product listCategories result',err,results);

    if (err){
        console.log("Inside product listCategories err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order listCategories updated",results);
        var result = results[0];
        res.json(result);
      }
    
    });

    return;

    try {
    let products = await Product.distinct("category", {});
    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const list = async (req, res) => {
  console.log("Try to list product");
  req.body.command = "list";
  req.body.query = {...req.query};
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product list result',err,results);

    if (err){
        console.log("Inside product list err",err);
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


  const query = {};
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;
  const pageNumber = parseInt(req.query.pageNumber) || 1;

  if (req.query.search)
    query.name = { $regex: req.query.search, $options: "i" };
  if (req.query.category && req.query.category != "All")
    query.category = req.query.category;

  const totalNumberOfDocuments = await Product.countDocuments(query);
  const numberOfPages = Math.ceil(totalNumberOfDocuments / itemsPerPage);
  try {
    let products = await Product.find(query)
      .populate("shop", "_id name")
      .limit(itemsPerPage)
      .skip((pageNumber - 1) * itemsPerPage)
      .select("-image")
      .exec();
    res.json({ products, numberOfPages, totalNumberOfDocuments });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const decreaseQuantity = async (req, res, next) => {

  console.log("Try to decreaseQuantity");
  req.body.command = "decreaseQuantity";
  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product result',err,results);

    if (err){
        console.log("Inside product err",err);
        return res.status('401').json({
          error: err
        })
    }else{
        console.log("product updated",results);
        var result = results[0];
        next();
      }
    
    });

  return;


  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity } },
      },
    };
  });
  try {
    await Product.bulkWrite(bulkOps, {});
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not update product",
    });
  }
};

const increaseQuantity = async (req, res, next) => {
  console.log("Try to increaseQuantity product");
  req.body.command = "increaseQuantity";
  req.body.query = {...req.query};
  req.body.product = req.product;

  
  kafka.make_request('product',req.body, function(err,results){
    console.log('in product increaseQuantity result',err,results);

    if (err){
        console.log("Inside product increaseQuantity err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order increaseQuantity updated",results);
        var result = results[0];
        next();
      }
    
    });

    return;
  try {
    await Product.findByIdAndUpdate(
      req.product._id,
      { $inc: { quantity: req.body.quantity } },
      { new: true }
    ).exec();
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

export default {
  create,
  productByID,
  photo,
  defaultPhoto,
  read,
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  list,
  decreaseQuantity,
  increaseQuantity,
  isfav,
};
