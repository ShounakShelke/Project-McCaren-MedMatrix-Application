import { processCardPhoto } from './verify-pipeline.js';
async function run() {
    const inputPath = process.argv[2] || 'track-b/test-cards/real1.jpg';
    console.log(`Processing: ${inputPath}...`);
    try {
        const result = await processCardPhoto(inputPath);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (e) {
        console.error("Pipeline Failed:", e);
    }
}
run();
