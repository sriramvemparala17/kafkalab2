import Product from "../../server/models/product.model";
import User from "../../server/models/user.model";
import Shop from "../../server/models/shop.model";
import { Order, CartItem } from "../../server/models/order.model";

import extend from "lodash/extend";
import errorHandler from "../../server/helpers/dbErrorHandler";
import fs from "fs";
import defaultImage from "../../client/assets/images/default.png";

const SHOP_SERVICE = {
  create: create,
  shopByID: shopByID,
  update: update,
  remove : remove,
  listByOwner : listByOwner,
  list: list,
  photo : photo,
  increaseQuantity : increaseQuantity,
  decreaseQuantity: decreaseQuantity,
};

async function handle_request(msg, callback) {
  console.log("Inside Shop service, msg:", msg);

  if (!SHOP_SERVICE[msg.command]) {
    console.log("command did not match");
    return;
  }
  SHOP_SERVICE[msg.command](msg, callback);
}

async function create(msg, callback) {
  let shop = new Shop(msg.fields)
  shop.owner= msg.profile
  if(msg.files.image){
    shop.image.data = fs.readFileSync(msg.files.image.path)
    shop.image.contentType = msg.files.image.type
  }
  try {
    let result = await shop.save()
    callback(null, [result, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function shopByID(msg, callback) {
  console.log("shopByID entry:msg",msg)

  try {
    let shop = await Shop.findById(msg.theShopId).select({image:0})
      .populate("owner", "_id name")
      .exec();
    if (!shop) {
      console.log("Shop not found:msg",msg)
      callback("Shop not found", null);
      return;
    }
    console.log("Shop found:shop,msg",shop,msg)

    callback(null, [shop, msg]);
  } catch (err) {
    callback("Could not retrieve shop", null);
  }
}
async function update(msg, callback) {
  let files = msg.files;
  let shop = extend({...msg.shop}, {...msg.fields});
  shop.updated = Date.now();
  if (files.image) {
    shop.image = {};
    shop.image.data = fs.readFileSync(files.image.path);
    shop.image.contentType = files.image.type;
  }
  try {
    // let result = await shop.save();
    let result = await Shop.updateOne({ _id: shop._id }, { $set: shop })

    msg.shop.image = undefined;
    msg.files = undefined;
    callback(null, [result, msg]);
  } catch (err) {
    callback("Update Failed", null);
  }
}
async function remove(msg, callback) {
  try {
    let shop = msg.shop;
    let deletedShop = await shop.remove();
    callback(null, [deletedShop, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function listByOwner(msg, callback) {
  try {
    let shops = await Shop.find({owner: msg.profile._id}).select({image:0}).populate('owner', '_id name').exec();
    callback(null, [shops, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function list(msg, callback) {
  try {
    let shops = await Shop.find().select({image:0})
    callback(null, [shops , msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function photo(msg, callback) {
  try {
    let shop = await Shop.findById(msg.theShopId).select({image:0})
    if (!shop) {
      console.log("Shop not found:msg",msg)
      callback("Shop not found", null);
      return;
    }
    console.log("Shop found:shop,msg",shop,msg)

    callback(null, [shop.image, msg]);
  } catch (err) {
    callback("Could not retrieve shop", null);
  }
}
async function increaseQuantity(msg, callback) {
  try {
    await Shop.findByIdAndUpdate(
      msg.shop._id,
      { $inc: { quantity: msg.body.quantity } },
      { new: true }
    ).exec();
    callback(null, [{message:"OK"}, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}


// callback(null, [deletedShop, msg]);
// callback(errorHandler.getErrorMessage(err), null);


async function decreaseQuantity(msg, callback) {
  let bulkOps = msg.order.shops.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.shop._id },
        update: { $inc: { quantity: -item.quantity } },
      },
    };
  });
  try {
    await Shop.bulkWrite(bulkOps, {});
    callback(null, [{ message: "OK" }, msg]);
  } catch (err) {
    callback("Could Not Update Shop", null);
  }
}

// exports.handle_request = handle_request;

export default {
  handle_request,
};
