import { Router } from "express";
import {
  mint,
  starsByEmail,
  contractOwner,
  ownerOf,
  currentTokenId,
} from "./ownership.controller.js";

const router = Router();

router.post("/mint", mint);
router.get("/stars", starsByEmail);
router.get("/owner", contractOwner);
router.get("/ownerOf", ownerOf);
router.get("/currentTokenId", currentTokenId);


export default router;
