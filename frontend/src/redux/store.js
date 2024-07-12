import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import loginStatusReducer from "./slices/loginStatusSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    loginStatus: loginStatusReducer,
  },
});
