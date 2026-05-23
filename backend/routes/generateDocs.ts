import { Router } from "express";
import { generateDocs } from "../controllers/docsController";
import { validate } from "../middleware/validate";
import { GenerateDocsSchema } from "../validation/schemas";

const router = Router();

// POST /api/generate-docs
router.post("/generate-docs", validate(GenerateDocsSchema), generateDocs);

export default router;
