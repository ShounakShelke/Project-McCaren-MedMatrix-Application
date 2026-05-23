import { Router } from "express";
import upload from "../middleware/upload";
import { extractBill } from "../controllers/billController";

const router = Router();

// POST /api/extract-bill
router.post("/extract-bill", upload.single("billImage"), extractBill);

export default router;
