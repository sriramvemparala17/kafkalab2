import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import request from 'request'
import config from './../../config/config'
import stripe from 'stripe'

const myStripe = stripe(config.stripe_test_secret_key)

var kafka = require('../kafka/client');

const create = async (req, res) => {
  console.log("Try to create user ");
  req.body.command = "create";
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user create result',err,results);

    if (err){
        console.log("Inside user create err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order create updated",results);
        var result = results[0];
        return res.status(200).json({
          message: "Successfully signed up!"
        })
      }
    
    });

    return;
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  console.log("Try to userByID user ");
  req.body.command = "userByID";
  req.body.theUserId = id;
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user userByID result',err,results);

    if (err){
        console.log("Inside user userByID err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order userByID updated",results);
        var result = results[0];
        req.profile = result
        next()
      }
    
    });

    return;

  try {
    let user = await User.findById(id)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.profile = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  console.log("Try to list user ");
  req.body.command = "list";
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user list result',err,results);

    if (err){
        console.log("Inside user list err",err);
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
    let users = await User.find().select('name email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  console.log("Try to create");
  // req.body.command = "update";
  kafka.make_request('user',{ command: "update",update:req.body,profile:req.profile}, function(err,results){
    console.log('in user result',err,results);

    if (err){
        console.log("Inside user err",err);
        return res.status('400').json({
          error: err
        })
    }else{
        console.log("user updated",results);
        var result = results[0];
        res.json(result)

      }
    
    });
  
  return;
  
  try {
    let user = req.profile
    user = extend(user, req.body)
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  console.log("Try to remove user ");
  req.body.command = "remove";
  req.body.profile = {...req.profile};
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user remove result',err,results);

    if (err){
        console.log("Inside user remove err",err);
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
    let user = req.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller
  if (!isSeller) {
    return res.status('403').json({
      error: "User is not a seller"
    })
  }
  next()
}

const stripe_auth = (req, res, next) => {
  console.log("Try to stripe_auth user ");
  req.body.command = "stripe_auth";
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user stripe_auth result',err,results);

    if (err){
        console.log("Inside user stripe_auth err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order stripe_auth updated",results);
        var result = results[0];
        req.body.stripe_seller = result
        next()
      }
    
    });

    return;
  request({
    url: "https://connect.stripe.com/oauth/token",
    method: "POST",
    json: true,
    body: {client_secret:config.stripe_test_secret_key,code:req.body.stripe, grant_type:'authorization_code'}
  }, (error, response, body) => {
    //update user
    if(body.error){
      return res.status('400').json({
        error: body.error_description
      })
    }
    req.body.stripe_seller = body
    next()
  })
}

const stripeCustomer = (req, res, next) => {
  console.log("Try to stripe_auth user ");
  req.body.command = "stripeCustomer";
  req.body.profile = {...req.profile};
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user stripeCustomer result',err,results);

    if (err){
        console.log("Inside user stripeCustomer err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order stripeCustomer updated",results);
        var result = results[0];
        req.body.order.payment_id = result
        next()
      }
    
    });

    return;

  if(req.profile.stripe_customer){
      //update stripe customer
      myStripe.customers.update(req.profile.stripe_customer, {
          source: req.body.token
      }, (err, customer) => {
        if(err){
          return res.status(400).send({
            error: "Could not update charge details"
          })
        }
        req.body.order.payment_id = customer.id
        next()
      })
  }else{
      myStripe.customers.create({
            email: req.profile.email,
            source: req.body.token
      }).then((customer) => {
          User.update({'_id':req.profile._id},
            {'$set': { 'stripe_customer': customer.id }},
            (err, order) => {
              if (err) {
                return res.status(400).send({
                  error: errorHandler.getErrorMessage(err)
                })
              }
              req.body.order.payment_id = customer.id
              next()
            })
      })
  }
}

const createCharge = (req, res, next) => {
  console.log("Try to createCharge user ");
  req.body.command = "createCharge";
  req.body.profile = {...req.profile};
  req.body.order = {...req.order};
  
  kafka.make_request('user',req.body, function(err,results){
    console.log('in user createCharge result',err,results);

    if (err){
        console.log("Inside user createCharge err",err);
        return res.status('403').json({
          error: err
        })
    }else{
        console.log("order createCharge updated",results);
        var result = results[0];
        next()
      }
    
    });

    return;

  if(!req.profile.stripe_seller){
    return res.status('400').json({
      error: "Please connect your Stripe account"
    })
  }
  myStripe.tokens.create({
    customer: req.order.payment_id,
  }, {
    stripeAccount: req.profile.stripe_seller.stripe_user_id,
  }).then((token) => {
      myStripe.charges.create({
        amount: req.body.amount * 100, //amount in cents
        currency: "usd",
        source: token.id,
      }, {
        stripeAccount: req.profile.stripe_seller.stripe_user_id,
      }).then((charge) => {
        next()
      })
  })
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller,
  stripe_auth,
  stripeCustomer,
  createCharge
}
