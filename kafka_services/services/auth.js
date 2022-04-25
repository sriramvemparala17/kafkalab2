import User from "../../server/models/user.model.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import config from "../../config/config.js";

const AUTH_SERVICE = {
  signin : signin,
  signout : signout,
}

async function handle_request(msg, callback) {
  console.log("Inside Auth service, msg:", msg);

  AUTH_SERVICE[msg.command](msg, callback);

}


async function signin(msg, callback){
  try {
    let user = await User.findOne({
      email: msg.email,
    });

    console.log("user", user);

    if (!user) {
      console.log("user not found");
      callback("User not found", null);
      return;
    }

    if (!user.authenticate(msg.password)) {
      console.log("Password failed");
      callback("User or password incorrect", null);
      return;
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret
    );

    console.log("User is ok");

    callback(null, [
      {
        cookie: { cookie: "t", token: token,  },
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          seller: user.seller,
        },
      },
      msg,
    ]);
  } catch (err) {
    callback("Could Not Signin", null);
  }
}

async function signout(msg, callback){
  try {
    
    console.log("signout");

    callback(null, [
      {
        message : "OK"
      },
      msg,
    ]);
  } catch (err) {
    callback("Could Not Signout", null);
  }
}

// exports.handle_request = handle_request;

export default {
  handle_request,
};
