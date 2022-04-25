import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
// import CartItems from "./CartItems";
// import { StripeProvider } from "react-stripe-elements";
import config from "./../../config/config";
// import Checkout from "./Checkout";
import Favitems from "./FavItems";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
}));

export default function fav() {
  const classes = useStyles();
  const [checkout, setCheckout] = useState(false);

  const showCheckout = (val) => {
    setCheckout(val);
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={8}>
        <Grid item xs={6} sm={6}>
          <Favitems />
        </Grid>
        {checkout && (
          <Grid item xs={6} sm={6}>
            {/* <StripeProvider apiKey={config.stripe_test_api_key}>
              <Checkout />
            </StripeProvider> */}
          </Grid>
        )}
      </Grid>
    </div>
  );
}
