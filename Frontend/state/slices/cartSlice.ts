import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/types/cart";

type CartState = { items: CartItem[] };
const initialState: CartState = { items: [] };

const upsert = (arr: CartItem[], item: CartItem) => {
  const i = arr.findIndex(x => x.starId === item.starId);
  if (i >= 0) arr[i] = { ...arr[i], ...item };
  else arr.push(item);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addOrUpdateItem(state, action: PayloadAction<CartItem>) {
      upsert(state.items, action.payload);
    },
    updateItem(state, action: PayloadAction<{ starId: string; patch: Partial<CartItem> }>) {
      const i = state.items.findIndex(x => x.starId === action.payload.starId);
      if (i >= 0) state.items[i] = { ...state.items[i], ...action.payload.patch };
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(x => x.starId !== action.payload);
    },
    clear(state) { state.items = []; },
  },
});

export const { addOrUpdateItem, updateItem, removeItem, clear } = cartSlice.actions;
export default cartSlice.reducer;
