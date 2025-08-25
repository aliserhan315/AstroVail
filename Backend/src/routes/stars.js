import { Router } from "express";
import {
  getStars,
  createStar,
  updateStar,
  getStar,
  deleteStar,
} from "../controllers/starController.js";
import { authRequired } from "../middleware/Auth.js";

const router = Router();

router.get("/", getStars);
router.get("/:id", getStar);

router.post("/", authRequired, createStar);
router.patch("/:id", authRequired, updateStar);
router.delete("/:id", authRequired, deleteStar);

export default router;
