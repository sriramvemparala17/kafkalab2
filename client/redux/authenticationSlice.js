import { createSlice, current } from "@reduxjs/toolkit";

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState: {
    isLoggedIn: false,
    user: undefined,
    token: undefined,
  },
  reducers: {
    loginUser: (state, action) => {
      const { data } = action.payload;
      const { token, user } = data;
      state.isLoggedIn = true;
      state.user = user;
      state.token = token;
    },
    logoutUser: (state, action) => {
      state.isLoggedIn = false;
      state.token = undefined;
      state.user = undefined;
    },
  },
});

export const { loginUser, logoutUser } = authenticationSlice.actions;

export default authenticationSlice.reducer;
