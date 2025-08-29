import { Router } from "express";
import {getMe,updateMyProfile,updateMyDevice} from "../controllers/userController.js";
import { authRequired } from "../middleware/Auth.js";
import { getMyStars } from "../controllers/starController.js";

const router = Router();

router.get("/",authRequired, getMe);
router.patch("/profile",authRequired, updateMyProfile);
router.patch("/device",  authRequired, updateMyDevice);
router.get("/stars", authRequired, getMyStars); 

export default router;
