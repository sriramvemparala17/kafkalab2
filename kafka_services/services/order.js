import Product from "../../server/models/product.model";
import Shop from "../../server/models/shop.model";
import { Order, CartItem } from "../../server/models/order.model";
import errorHandler from "../../server/helpers/dbErrorHandler";

const ORDER_SERVICE = {
  create: create,
  listByShop: listByShop,
  update: update,
  orderByID: orderByID,
  listByUser: listByUser,
};

async function handle_request(msg, callback) {
  console.log("Inside Order service, msg:", msg);

  if (!ORDER_SERVICE[msg.command]) {
    console.log("command did not match");
    return;
  }
  ORDER_SERVICE[msg.command](msg, callback);
}

async function create(msg, callback) {
  try {
    const order = new Order(msg.order);
    let result = await order.save();
    callback(null, [result, msg]);
  } catch (err) {
    // callback("Could Not Order", null);
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function listByShop(msg, callback) {
  try {
    let orders = await Order.find({ "products.shop": msg.shop._id })
      .populate({ path: "products.product", select: "_id name price" })
      .sort("-created")
      .exec();
    callback(null, [orders, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function update(msg, callback) {
  try {
    let order = await Order.update(
      { "products._id": msg.cartItemId },
      {
        $set: {
          "products.$.status": msg.status,
        },
      }
    );
    callback(null, [order, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function orderByID(msg, callback) {
  try {
    let order = await Order.findById(msg.theOrderId)
      .populate("products.product", "name price")
      .populate("products.shop", "name")
      .exec();
    if (!order) {
      console.log("Order not found:msg", msg);
      callback("Order not found", null);
      return;
    }
    callback(null, [order, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function listByUser(msg, callback) {
  try {
    const itemsPerPage = parseInt(msg.query.itemsPerPage) || 5;
    const pageNumber = parseInt(msg.query.pageNumber) || 1;
    const totalNumberOfDocuments = await Order.countDocuments({
      user: msg.profile._id,
    });
    const numberOfPages = Math.ceil(totalNumberOfDocuments / itemsPerPage);
    let orders = await Order.find({ user: msg.profile._id })
      .sort("-created")
      .limit(itemsPerPage)
      .skip((pageNumber - 1) * itemsPerPage)
      .exec();
    callback(null, [{ orders, numberOfPages, totalNumberOfDocuments }, msg]);
  } catch (err) {
    console.log(err);
    callback(errorHandler.getErrorMessage(err), null);
  }
}

export default {
  handle_request,
};
