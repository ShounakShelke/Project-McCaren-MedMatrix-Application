export declare function scanPMJAYQR(imagePath: string): Promise<{
    text?: string;
    id?: string;
    valid: boolean;
}>;
export declare function validatePMJAYQR(text: string): boolean;
