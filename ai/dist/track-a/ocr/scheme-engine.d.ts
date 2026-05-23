export interface Scheme {
    name: string;
    description: string;
    amount: number;
    status: "ELIGIBLE" | "NOT ELIGIBLE" | "X NOT FOUND";
    instruction: string;
}
export interface SavingsEngineOutput {
    summary: {
        total_get_back: number;
        save_percentage: number;
        headline: string;
    };
    schemes: Scheme[];
}
export declare function calculateSchemes(amount: number, hospital: string, treatment: string): SavingsEngineOutput;
