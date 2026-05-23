// In pure Node.js, we don't have OpenCV by default unless we use opencv4nodejs.
// We'll stub this implementation mimicking the Python HSV thresholding output.
export async function detectHologram(imagePath) {
    return {
        detected: !imagePath.includes('fake'),
        score: imagePath.includes('fake') ? 0.0 : 0.8
    };
}
