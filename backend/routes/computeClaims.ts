import { Router } from "express";
import { computeClaimsHandler } from "../controllers/claimsController";
import { validate } from "../middleware/validate";
import { ComputeClaimsSchema } from "../validation/schemas";

const router = Router();

// POST /api/compute-claims
router.post("/compute-claims", validate(ComputeClaimsSchema), computeClaimsHandler);

export default router;
