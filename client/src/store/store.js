import { configureStore } from "@reduxjs/toolkit";
import darkModeReducer from "./slices/darkModeSlice";

const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
  },
});

export default store;
