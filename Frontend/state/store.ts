import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import auth from "./slices/authSlice";
import stars from "./slices/starsSlice";
import cart from "./slices/cartSlice";

const rootReducer = combineReducers({ auth, stars, cart });

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "stars", "cart"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefault => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
