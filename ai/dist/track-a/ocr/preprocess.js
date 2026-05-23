// In Node.js, Jimp could be used for preprocessing. 
// For this hackathon pipeline, we might just pass original buffers or paths.
import fs from 'fs';
export async function preprocessBill(imagePath) {
    // If you need contrast enhancement:
    // const image = await Jimp.read(imagePath);
    // image.contrast(0.2).greyscale();
    // return await image.getBufferAsync(Jimp.MIME_JPEG);
    // Simple pass-through for demo as tesseract.js handles buffers
    return fs.readFileSync(imagePath);
}
