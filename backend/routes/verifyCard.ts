import { Router } from "express";
import upload from "../middleware/upload";
import { verifyCard } from "../controllers/cardController";

const router = Router();

// POST /api/verify-card
router.post("/verify-card", upload.single("cardImage"), verifyCard);

export default router;
