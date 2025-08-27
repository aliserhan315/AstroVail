import { Router } from "express";
import {
    getMe,
    updateMyProfile,
    updateMyDevice
} from "../controllers/userController.js";
import { authRequired } from "../middleware/Auth.js";

const router = Router();

router.get("/",authRequired, getMe);
router.get("/profile",authRequired, updateMyProfile);
router.patch("/device",  authRequired, updateMyDevice);

export default router;
