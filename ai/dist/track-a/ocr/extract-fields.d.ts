export interface BillData {
    hospital: string;
    treatment: string;
    amount: number;
    date: string;
    raw_text: string;
}
export declare function extractBillData(text: string): BillData;
