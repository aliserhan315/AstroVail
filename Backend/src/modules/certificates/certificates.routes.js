
import { Router } from "express";
import { previewPdf } from "./certificate.controller.js";

const router = Router();
router.get("/preview.pdf", previewPdf);

export default router;
