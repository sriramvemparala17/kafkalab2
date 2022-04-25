import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "./authenticationSlice";

export default configureStore({
  reducer: {
    authentication: authenticationReducer,
  },
});
