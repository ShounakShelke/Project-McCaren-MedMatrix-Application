import { processBillPhoto } from './ocr/bill-parser.js';

async function run() {
    const inputPath = process.argv[2] || 'track-a/test_bills/bill1.jpg';
    console.log(`Processing: ${inputPath}...`);
    
    try {
        const result = await processBillPhoto(inputPath);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Pipeline Failed:", e);
    }
}

run();
