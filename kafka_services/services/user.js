import Product from "../../server/models/product.model";
import User from "../../server/models/user.model";
import { Order, CartItem } from "../../server/models/order.model";
import Shop from "../../server/models/shop.model";


import extend from "lodash/extend";
import errorHandler from "../../server/helpers/dbErrorHandler";
import fs from "fs";
import defaultImage from "../../client/assets/images/default.png";
import request from 'request'
import config from '../../config/config'
import stripe from 'stripe'

const myStripe = stripe(config.stripe_test_secret_key)

const USER_SERVICE = {
  create: create,
  userByID: userByID,
  update: update,
  remove : remove,
  list: list,
  stripe_auth: stripe_auth,
  stripeCustomer : stripeCustomer,
  createCharge: createCharge,
};

async function handle_request(msg, callback) {
  console.log("Inside User service, msg:", msg);

  if (!USER_SERVICE[msg.command]) {
    console.log("command did not match");
    return;
  }
  USER_SERVICE[msg.command](msg, callback);
}

async function create(msg, callback) {
  const user = new User(msg)
  try {
    await user.save()
    callback(null, [{message:"OK"}, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}

async function userByID(msg, callback) {
  console.log("userByID entry:msg",msg)

  try {
    let user = await User.findById(msg.theUserId)
    if (!user)
      return callback({
        error: "User not found"
      }, null)

    callback(null, [user, msg]);
  } catch (err) {
    callback("Could not retrieve user", null);
  }
}
async function update(msg, callback) {
  try {
    let profile = {...msg.profile}
    let update = {...msg.update};
    let user = extend(profile, update)
    user.updated = Date.now()
    await User.updateOne({ _id: msg.profile._id }, { $set: user })
    // await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    console.log("updated user",user)
    callback(null, [user, msg]);
  } catch (err) {
    // callback(errorHandler.getErrorMessage(err), null);
    console.error("Exception",err);
    callback("update failed!", null);
  }
}
async function remove(msg, callback) {
  try {
    let user = msg.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    callback(null, [deletedUser, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function list(msg, callback) {
  try {
    let users = await User.find().select('name email updated created')
    callback(null, [users, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function stripe_auth(msg, callback) {
  try {
    request({
      url: "https://connect.stripe.com/oauth/token",
      method: "POST",
      json: true,
      body: {client_secret:config.stripe_test_secret_key,code:msg.stripe, grant_type:'authorization_code'}
    }, (error, response, body) => {
      //update user
      if(body.error){
        callback({
          error: body.error_description
        }, null);
        return
      }
    })
    callback(null, [body, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function stripeCustomer(msg, callback) {
  try {
    if(msg.profile.stripe_customer){
      //update stripe customer
      myStripe.customers.update(msg.profile.stripe_customer, {
          source: msg.token
      }, (err, customer) => {
        if(err){
          callback({
            error: "Could not update charge details"
          }, null);
          return
        }
        callback(null, [customer.id, msg]);
      })
  }else{
      myStripe.customers.create({
            email: msg.profile.email,
            source: msg.token
      }).then((customer) => {
          User.update({'_id':msg.profile._id},
            {'$set': { 'stripe_customer': customer.id }},
            (err, order) => {
              if (err) {
                return res.status(400).send({
                  error: errorHandler.getErrorMessage(err)
                })
              }
              callback(null, [customer.id, msg]);
            })
      })
  }
    callback(null, [users, msg]);
  } catch (err) {
    callback(errorHandler.getErrorMessage(err), null);
  }
}
async function createCharge(msg, callback) {
  try {
    if(!msg.profile.stripe_seller){
      callback({
        error: "Please connect your Stripe account"
      })
      return
    }
    myStripe.tokens.create({
      customer: msg.order.payment_id,
    }, {
      stripeAccount: msg.profile.stripe_seller.stripe_user_id,
    }).then((token) => {
        myStripe.charges.create({
          amount: msg.amount * 100, //amount in cents
          currency: "usd",
          source: token.id,
        }, {
          stripeAccount: msg.profile.stripe_seller.stripe_user_id,
        }).then((charge) => {
          callback(null, [{message:"OK"}, msg]);
        })
    })
  } catch (err) {
    console.log("create charge failed",err);
    callback("create charge failed", null);
  }
}// exports.handle_request = handle_request;

export default {
  handle_request,
};
