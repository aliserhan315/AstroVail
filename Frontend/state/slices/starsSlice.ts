import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { StarSimple } from "@/types/star";

type StarsState = {
  myStars: StarSimple[];
};

const initialState: StarsState = { myStars: [] };

const starsSlice = createSlice({
  name: "stars",
  initialState,
  reducers: {
    setMyStars(state, action: PayloadAction<StarSimple[]>) {
      state.myStars = action.payload;
    },
    clearMyStars(state) {
      state.myStars = [];
    },
  },
});

export const { setMyStars, clearMyStars } = starsSlice.actions;
export default starsSlice.reducer;
