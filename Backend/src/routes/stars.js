import { Router } from "express";
import {getStars,getMyStars,getStar,getStarByCatalog,createStar,updateStar,deleteStar
 
} from "../controllers/starController.js";
import { authRequired } from "../middleware/Auth.js";

const router = Router();

router.get("/", getStars);
router.get("/me/stars", authRequired, getMyStars);
router.get("/by-catalog/:catalogId", getStarByCatalog);
router.get("/:id", getStar);

router.patch("/:id", authRequired, updateStar);

router.post("/", authRequired, createStar);
router.delete("/:id", authRequired, deleteStar);

export default router;



