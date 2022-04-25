import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";
import Button from "@material-ui/core/Button";
import auth from "./../auth/auth-helper";
import { Link, withRouter } from "react-router-dom";
import CartIcon from "@material-ui/icons/ShoppingCart";
import Badge from "@material-ui/core/Badge";
import cart from "./../cart/cart-helper";
import fav from "./../fav/fav-helper";
import { FavoriteBorderRounded } from "@material-ui/icons";
import { Favorite } from "@material-ui/icons";

const isActive = (history, path) => {
  if (history.location.pathname == path) return { color: "#bef67a" };
  else return { color: "#ffffff" };
};
const isPartActive = (history, path) => {
  if (history.location.pathname.includes(path)) return { color: "#bef67a" };
  else return { color: "#ffffff" };
};
const Footer = withRouter(({ history }) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit"></Typography>
      {/* <div>
        <Link to="/">
          <IconButton aria-label="Home" style={isActive(history, "/")}>
            <HomeIcon />
          </IconButton>
        </Link>
        <Link to="/shops/all">
          <Button style={isActive(history, "/shops/all")}>All Shops</Button>
        </Link>
        <Link to="/cart">
          <Button style={isActive(history, "/cart")}>
            Cart
            <Badge
              color="secondary"
              invisible={false}
              badgeContent={cart.itemTotal()}
              style={{ marginLeft: "7px" }}
            >
              <CartIcon />
            </Badge>
          </Button>
        </Link>
        <Link to="/fav">
          <Button style={isActive(history, "/fav")}>
            Fav
            <Badge
              color="secondary"
              invisible={false}
              badgeContent={fav.itemTotal()}
              style={{ marginLeft: "7px" }}
            >
              <Favorite />
            </Badge>
          </Button>
        </Link>
      </div>
      <div style={{ position: "absolute", right: "10px" }}>
        <span style={{ float: "right" }}>
          {!auth.isAuthenticated() && (
            <span>
              <Link to="/signup">
                <Button style={isActive(history, "/signup")}>Sign up</Button>
              </Link>
              <Link to="/signin">
                <Button style={isActive(history, "/signin")}>Sign In</Button>
              </Link>
            </span>
          )}
          {auth.isAuthenticated() && (
            <span>
              {auth.isAuthenticated().user.seller && (
                <Link to="/seller/shops">
                  <Button style={isPartActive(history, "/seller/")}>
                    My Shops
                  </Button>
                </Link>
              )}
              <Link to={"/user/" + auth.isAuthenticated().user._id}>
                <Button
                  style={isActive(
                    history,
                    "/user/" + auth.isAuthenticated().user._id
                  )}
                >
                  My Profile
                </Button>
              </Link>
              <Button
                color="inherit"
                onClick={() => {
                  auth.clearJWT(() => history.push("/"));
                }}
              >
                Sign out
              </Button>
            </span>
          )}
        </span>
      </div> */}

      <div className="dropdown show">
        <div className="dropdown-menu" aria-labelledby="actions">
          
        </div>
      </div>
    </Toolbar>
  </AppBar>
));

export default Footer;
