import { Order, CartItem } from "../models/order.model";
import errorHandler from "./../helpers/dbErrorHandler";

var kafka = require("../kafka/client");

const create = async (req, res) => {
  console.log("Try to create");
  req.body.order.user = req.profile;
  req.body.command = "create";

  kafka.make_request("order", req.body, function (err, results) {
    console.log("in order create result", err, results);

    if (err) {
      console.log("Inside order create err", err);
      return res.status("400").json({
        error: err,
      });
    } else {
      console.log("order create updated", results);
      var result = results[0];
      res.status(200).json(result);
    }
  });

  return;

  try {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    let result = await order.save();
    res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByShop = async (req, res) => {
  console.log("Try to listByShop");
  req.body.command = "listByShop";
  req.body.shop = req.shop;

  kafka.make_request("order", req.body, function (err, results) {
    console.log("in order listByShop result", err, results);

    if (err) {
      console.log("Inside order listByShop err", err);
      return res.status("400").json({
        error: err,
      });
    } else {
      console.log("order listByShop updated", results);
      var result = results[0];
      res.status(200).json(result);
    }
  });

  return;
  try {
    let orders = await Order.find({ "products.shop": req.shop._id })
      .populate({ path: "products.product", select: "_id name price" })
      .sort("-created")
      .exec();
    res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const update = async (req, res) => {
  console.log("Try to update");
  req.body.command = "update";

  kafka.make_request("order", req.body, function (err, results) {
    console.log("in order update result", err, results);

    if (err) {
      console.log("Inside order update err", err);
      return res.status("400").json({
        error: err,
      });
    } else {
      console.log("order update updated", results);
      var result = results[0];
      res.status(200).json(result);
    }
  });

  return;
  try {
    let order = await Order.update(
      { "products._id": req.body.cartItemId },
      {
        $set: {
          "products.$.status": req.body.status,
        },
      }
    );
    res.json(order);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const getStatusValues = (req, res) => {
  res.json(CartItem.schema.path("status").enumValues);
};

const orderByID = async (req, res, next, id) => {
  console.log("Try to orderByID");
  req.body.command = "orderByID";
  req.body.theOrderId = id;

  kafka.make_request("order", req.body, function (err, results) {
    console.log("in order orderByID result", err, results);

    if (err) {
      console.log("Inside order orderByID err", err);
      return res.status("403").json({
        error: err,
      });
    } else {
      console.log("order orderByID updated", results);
      var result = results[0];
      req.order = result;
      next();
    }
  });

  return;
  try {
    let order = await Order.findById(id)
      .populate("products.product", "name price")
      .populate("products.shop", "name")
      .exec();
    if (!order)
      return res.status("400").json({
        error: "Order not found",
      });
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByUser = async (req, res) => {
  console.log("Try to listByUser");
  req.body.command = "listByUser";
  req.body.query = { ...req.query };
  req.body.profile = { ...req.profile };

  kafka.make_request("order", req.body, function (err, results) {
    console.log("in order listByUser result", err, results);

    if (err) {
      console.log("Inside order listByUser err", err);
      return res.status("400").json({
        error: err,
      });
    } else {
      console.log("order listByUser updated", results);
      var result = results[0];
      res.status(200).json(result);
    }
  });

  return;

  try {
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const totalNumberOfDocuments = await Order.countDocuments({
      user: req.profile._id,
    });
    const numberOfPages = Math.ceil(totalNumberOfDocuments / itemsPerPage);
    let orders = await Order.find({ user: req.profile._id })
      .sort("-created")
      .limit(itemsPerPage)
      .skip((pageNumber - 1) * itemsPerPage)
      .exec();
    res.json({ orders, numberOfPages, totalNumberOfDocuments });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const read = (req, res) => {
  return res.json(req.order);
};

export default {
  create,
  listByShop,
  update,
  getStatusValues, //
  orderByID,
  listByUser,
  read, //
};
