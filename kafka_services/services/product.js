import Product from "../../server/models/product.model";
import User from "../../server/models/user.model";
import Shop from "../../server/models/shop.model";
import { Order, CartItem } from "../../server/models/order.model";

import extend from "lodash/extend";
import errorHandler from "../../server/helpers/dbErrorHandler";
import fs from "fs";
import defaultImage from "../../client/assets/images/default.png";

const PRODUCT_SERVICE = {
  create: create,
  productByID: productByID,
  update: update,
  remove : remove,
  listLatest : listLatest,
  listRelated: listRelated,
  listCategories : listCategories,
  listByShop : listByShop,
  list: list,
  photo : photo,
  increaseQuantity : increaseQuantity,
  decreaseQuantity: decreaseQuantity,
};

async function handle_request(msg, callback) {
  console.log("Inside Product service, msg:", msg);

  if (!PRODUCT_SERVICE[msg.command]) {
    console.log("command did not match");
    return;
  }
  PRODUCT_SERVICE[msg.command](msg, callback);
}

async function create(msg, callback) {
  let product = new Product(msg.fields);
  product.shop = msg.shop;
  if (msg.files.image) {
    product.image.data = fs.readFileSync(msg.files.image.path);
    product.image.contentType = msg.files.image.type;
  }
  try {
    let result = await product.save();
    callback(null, [result, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function productByID(msg, callback) {
  console.log("productByID entry:msg",msg)
  // let test = await Product.findById(msg.theProductId);
  // console.log("productByID test",test)


  try {
    let product = await Product.findById(msg.theProductId)
      .populate("shop", "_id name")
      .exec();
    if (!product) {
      console.log("Product not found:msg",msg)
      callback("Product not found", null);
      return;
    }
    console.log("Product found:product,msg",product,msg)

    callback(null, [product, msg]);
  } catch (err) {
    callback("Could not retrieve product", null);
  }
}
async function update(msg, callback) {
  let files = msg.files;
  let product = msg.product;
  product = extend(product, msg.fields);
  product.updated = Date.now();
  if (files.image) {
    product.image = {};
    product.image.data = fs.readFileSync(files.image.path);
    product.image.contentType = files.image.type;
  }
  try {
    // let result = await product.save();
    let result = await Product.updateOne({ _id: product._id }, { $set: product })
    callback(null, [result, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function remove(msg, callback) {
  try {
    let deletedProduct = await Product.findByIdAndDelete(msg.product._id);
    callback(null, [deletedProduct, msg]);
  } catch (err) {
    console.log("Remove failed",err);
    callback("remove failed", null);
  }
}
async function listLatest(msg, callback) {
  try {
    let products = await Product.find({},{image:0})
    // let products = await Product.find({})
      .sort("-created")
      // .limit(1)
      .limit(5)
      .populate("shop", "_id name")
      .exec();
    callback(null, [products, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function listRelated(msg, callback) {
  try {
    let products = await Product.find({
      _id: { $ne: msg.product },
      category: msg.product.category,
    })
      .limit(5)
      .populate("shop", "_id name")
      .exec();
    callback(null, [products, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function listCategories(msg, callback) {
  try {
    let products = await Product.distinct("category", {});
    callback(null, [products, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function listByShop(msg, callback) {
  try {
    let products = await Product.find({ shop: msg.shop._id })
    // let products = await Product.find({})
      .populate("shop", "_id name")
      .select("-image");
    callback(null, [products, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function list(msg, callback) {
  const query = {};
  const itemsPerPage = parseInt(msg.query.itemsPerPage) || 5;
  const pageNumber = parseInt(msg.query.pageNumber) || 1;

  if (msg.query.search)
    query.name = { $regex: msg.query.search, $options: "i" };
  if (msg.query.category && msg.query.category != "All")
    query.category = msg.query.category;

  const totalNumberOfDocuments = await Product.countDocuments(query);
  const numberOfPages = Math.ceil(totalNumberOfDocuments / itemsPerPage);
  try {
    let products = await Product.find(query)
      .populate("shop", "_id name")
      .limit(itemsPerPage)
      .skip((pageNumber - 1) * itemsPerPage)
      .select("-image")
      .exec();
    callback(null, [{ products, numberOfPages, totalNumberOfDocuments }, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function photo(msg, callback) {
  try {
    let product = await Product.findById(msg.theProductId)
    if (!product) {
      console.log("Product not found:msg",msg)
      callback("Product not found", null);
      return;
    }else if (!product.image){
      product = {image : {notAvailable: true}}
    }
    console.log("Product found:product,msg",product,msg)

    callback(null, [product.image, msg]);
  } catch (err) {
    callback("Could not retrieve product", null);
  }
}
async function increaseQuantity(msg, callback) {
  try {
    await Product.findByIdAndUpdate(
      msg.product._id,
      { $inc: { quantity: msg.body.quantity } },
      { new: true }
    ).exec();
    callback(null, [{message:"OK"}, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}


// callback(null, [deletedProduct, msg]);
// callback(errorHandler.getErrorMessage(err), null);


async function decreaseQuantity(msg, callback) {
  let bulkOps = msg.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity } },
      },
    };
  });
  try {
    await Product.bulkWrite(bulkOps, {});
    callback(null, [{ message: "OK" }, msg]);
  } catch (err) {
    callback("Could Not Update Product", null);
  }
}

// exports.handle_request = handle_request;

export default {
  handle_request,
};
