export declare function processBillPhoto(imagePath: string): Promise<{
    success: boolean;
    data: {
        hospital: string;
        treatment: string;
        amount: number;
        date: string;
        category: string;
    };
    savings_engine: import("./scheme-engine.js").SavingsEngineOutput;
    confidence: number;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    data?: undefined;
    savings_engine?: undefined;
    confidence?: undefined;
}>;
