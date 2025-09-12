import { Router } from "express";
import {getMe,updateMyProfile,updateMyDevice} from "./user.controller.js";
import { authRequired } from "../../middleware/Auth.js";
import { getMyStars } from "../star/star.controller.js";

const router = Router();

router.get("/",authRequired, getMe);
router.patch("/profile",authRequired, updateMyProfile);
router.patch("/device",  authRequired, updateMyDevice);
router.get("/stars", authRequired, getMyStars); 

export default router;
