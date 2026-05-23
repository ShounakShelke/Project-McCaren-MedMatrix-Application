import multer from "multer";

// Store files in memory so OCR can consume the buffer directly
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter(_req, file, cb) {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/tiff",
            "image/bmp",
            "application/pdf",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type. Upload a JPEG, PNG, TIFF, BMP, or PDF."));
        }
    },
});

export default upload;
