import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "public", "docs");
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // run every 1 hour

/**
 * Delete PDFs in public/docs older than MAX_AGE_MS.
 */
export async function cleanOldPdfs(): Promise<void> {
    let files: string[];
    try {
        files = await fs.promises.readdir(DOCS_DIR);
    } catch {
        // Directory doesn't exist yet — nothing to clean
        return;
    }

    const now = Date.now();
    const deletions = files
        .filter((f) => f.endsWith(".pdf"))
        .map(async (file) => {
            const filePath = path.join(DOCS_DIR, file);
            try {
                const { mtimeMs } = await fs.promises.stat(filePath);
                if (now - mtimeMs > MAX_AGE_MS) {
                    await fs.promises.unlink(filePath);
                    console.log(`[cleanup] Deleted old PDF: ${file}`);
                }
            } catch {
                // File may already be gone — ignore
            }
        });

    await Promise.all(deletions);
}

/**
 * Run an initial cleanup on startup, then repeat on an interval.
 */
export function startCleanupScheduler(): void {
    cleanOldPdfs();
    setInterval(cleanOldPdfs, CLEANUP_INTERVAL_MS);
    console.log("🧹  PDF cleanup scheduler started (every 1h, TTL 24h)");
}
