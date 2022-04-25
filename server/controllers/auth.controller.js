import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from './../../config/config'

var kafka = require('../kafka/client');

const signin = async (req, res) => {
  console.log("Try to signin");
  req.body.command = "signin";

  kafka.make_request('auth',req.body, function(err,results){
    console.log('in result',err,results);

    if (err){
        console.log("Inside err",err);
        return res.status('401').json({
          error: err
        })
    }else{
        console.log("Inside else",results);
        var result = results[0];
        res.cookie("t", result.cookie.token, {
          expire: new Date() + 9999
        })
  
        return res.json({
          token : result.cookie.token,
          user: result.user
        })
      }
    
    });

  return;

  try {
    let user = await User.findOne({
        "email": req.body.email
      })

      if (!user)
        return res.status('401').json({
          error: "User not found"
        })

      if (!user.authenticate(req.body.password)) {
        return res.status('401').send({
          error: "Email and password don't match."
        })
      }

      const token = jwt.sign({
        _id: user._id
      }, config.jwtSecret)

      res.cookie("t", token, {
        expire: new Date() + 9999
      })

      return res.json({
        token,
        user: {_id: user._id, name: user.name, email: user.email, seller: user.seller}
      })
  } catch (err) {
    return res.status('401').json({
      error: "Could not sign in"
    })
  }
}

const signout = (req, res) => {
  console.log("Try to signout");
  req.body.command = "signout";

  kafka.make_request('auth',req.body, function(err,results){
    console.log('in result',err,results);

    if (err){
        console.log("Inside err",err);
        return res.status('401').json({
          error: err
        })
    }else{
      res.clearCookie("t")
      return res.status('200').json({
        message: "signed out"
      })
      }
    
    });

  return;


  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
