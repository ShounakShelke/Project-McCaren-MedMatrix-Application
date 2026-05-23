import { processBillPhoto } from '../track-a/ocr/bill-parser.js';
import { processCardPhoto } from '../track-b/verify-pipeline.js';

export async function processFullClaim(billImagePath: string, cardImagePath: string) {
    console.log("Starting Claim Verification...");
    
    const [billResult, cardResult] = await Promise.all([
        processBillPhoto(billImagePath),
        processCardPhoto(cardImagePath)
    ]);
    
    let claimStatus = 'REJECTED';
    let claimReasons = [];
    
    if (!billResult.success) claimReasons.push("Failed to read bill.");
    if (!cardResult.success) claimReasons.push("Failed to verify card.");
    
    const validity = cardResult.data?.validity ?? 0;
    const amount = billResult.data?.amount ?? 0;

    if (validity > 0.7 && amount > 0) {
        claimStatus = 'APPROVED';
    } else {
        claimReasons.push("Card Tampering suspected or Zero Value Bill.");
    }
    
    return {
        claimStatus,
        reasons: claimReasons,
        extracted_data: {
            hospital: billResult.data?.hospital,
            treatment: billResult.data?.treatment,
            amount: billResult.data?.amount
        },
        card_verification: {
            trust_score: cardResult.data?.validity,
            issues: cardResult.data?.issues
        }
    };
}
