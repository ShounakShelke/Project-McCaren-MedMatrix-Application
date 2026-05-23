import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On failure returns 400 with a structured list of field-level errors.
 * On success replaces req.body with the parsed (coerced + stripped) value.
 */
export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: "Validation failed",
                issues: result.error.issues.map((i) => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
