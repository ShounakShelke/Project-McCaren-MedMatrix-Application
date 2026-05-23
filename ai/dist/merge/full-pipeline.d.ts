export declare function processFullClaim(billImagePath: string, cardImagePath: string): Promise<{
    claimStatus: string;
    reasons: string[];
    extracted_data: {
        hospital: string | undefined;
        treatment: string | undefined;
        amount: number | undefined;
    };
    card_verification: {
        trust_score: number;
        issues: string[];
    };
}>;
