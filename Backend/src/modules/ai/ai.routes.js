import { Router } from "express";
import { genCertificateMessage } from "./ai.controller.js";

const router = Router();
router.post("/certificate-message", genCertificateMessage);
export default router;
