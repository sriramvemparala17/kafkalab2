import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import AddCartIcon from "@material-ui/icons/AddShoppingCart";
import DisabledCartIcon from "@material-ui/icons/RemoveShoppingCart";
import fav from "./fav-helper.js";
import { Redirect } from "react-router-dom";
import { Favorite } from "@material-ui/icons";
import FavoriteRounded from "@material-ui/icons/FavoriteRounded";
import { FavoriteBorderOutlined } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    width: "28px",
    height: "28px",
  },
  disabledIconButton: {
    color: "#7f7563",
    width: "28px",
    height: "28px",
  },
}));

export default function AddToFav(props) {
  const classes = useStyles();
  const [redirect, setRedirect] = useState(false);

  const addtofav = () => {
    fav.addtofav(props.item, () => {
      setRedirect({ redirect: true });
    });
  };
  if (redirect) {
    return <Redirect to={""} />;
  }
  return (
    <span>
      {props.item.isfav == "unfav" ? (
        <IconButton color="secondary" dense="dense" onClick={addtofav}>
          <FavoriteBorderOutlined
            className={props.cartStyle || classes.iconButton}
          />
        </IconButton>
      ) : (
        <IconButton color="secondary" dense="dense">
          <Favorite className={classes.iconButton} />
        </IconButton>
      )}
    </span>
  );
}

AddToFav.propTypes = {
  item: PropTypes.object.isRequired,
  cartStyle: PropTypes.string,
};
