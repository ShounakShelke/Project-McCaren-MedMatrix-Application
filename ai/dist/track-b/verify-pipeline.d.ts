export declare function processCardPhoto(imagePath: string): Promise<{
    success: boolean;
    data: {
        validity: number;
        qr_valid: boolean;
        mrn_valid: boolean;
        issues: string[];
        beneficiary_id: string | undefined;
    };
} | {
    success: boolean;
    data: {
        validity: number;
        qr_valid: boolean;
        mrn_valid: boolean;
        issues: string[];
        beneficiary_id?: undefined;
    };
}>;
