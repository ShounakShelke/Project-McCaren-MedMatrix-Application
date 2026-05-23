import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import prisma from "./services/prismaClient";
import { startCleanupScheduler } from "./services/cleanupService";

import extractBillRouter from "./routes/extractBill";
import computeClaimsRouter from "./routes/computeClaims";
import generateDocsRouter from "./routes/generateDocs";
import verifyCardRouter from "./routes/verifyCard";

const app = express();
const PORT = process.env.PORT ?? 4000;

// Middleware
app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

// Static – serve generated PDFs
app.use("/docs", express.static(path.join(__dirname, "public", "docs")));

// API Routes
app.use("/api", extractBillRouter);
app.use("/api", computeClaimsRouter);
app.use("/api", generateDocsRouter);
app.use("/api", verifyCardRouter);

// Start
async function start(): Promise<void> {
    try {
        await prisma.$connect();
        console.log("✅  Database connection verified");
    } catch (err) {
        console.error("❌  Database connection failed:", err);
    }

    const server = app.listen(PORT, () => {
        console.log(`🚀  Project McCaren backend running on http://localhost:${PORT}`);
        startCleanupScheduler();
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
            console.error(`❌  Port ${PORT} is already in use. Kill the other process and retry.`);
        } else {
            console.error("❌  Server error:", err);
        }
        process.exit(1);
    });
}

start();
