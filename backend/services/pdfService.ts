import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { BillData, ClaimData, User } from "../types";

const PUBLIC_DOCS_DIR = path.join(process.cwd(), "public", "docs");

interface PdfOptions {
    billData: BillData;
    claim: ClaimData;
    user: User;
}

/**
 * Two-column row helper.
 */
function row(doc: PDFKit.PDFDocument, label: string, value: string): void {
    const startX = 50;
    const valueX = 230;
    const y = doc.y;
    doc.font("Helvetica-Bold").text(`${label}:`, startX, y, { width: 170 });
    doc.font("Helvetica").text(value, valueX, y, { width: 315 });
    doc.moveDown(0.2);
}

/**
 * Generate an ESIC Form-8-style PDF.
 */
export async function generateEsicPdf({ billData, claim, user }: PdfOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        const filename = `ESIC-${Date.now()}.pdf`;
        const filePath = path.join(PUBLIC_DOCS_DIR, filename);
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .text("ESIC – Reimbursement Claim Form (Form 8)", { align: "center" })
            .moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#1a1a2e").lineWidth(2).stroke().moveDown(1);

        // Patient Details
        doc.fontSize(12).font("Helvetica-Bold").text("Patient Details").moveDown(0.3);
        doc.font("Helvetica").fontSize(11);
        row(doc, "Patient Name", user.patientName || "N/A");
        row(doc, "ESIC Number", user.esicNumber || "N/A");
        doc.moveDown(0.8);

        // Hospital Details
        doc.fontSize(12).font("Helvetica-Bold").text("Hospital Details").moveDown(0.3);
        doc.font("Helvetica").fontSize(11);
        row(doc, "Hospital Name", billData.hospitalName || "N/A");
        row(doc, "Treatment", billData.treatment || "N/A");
        row(doc, "Admission Date", billData.admissionDate || "N/A");
        row(doc, "Discharge Date", billData.dischargeDate || "N/A");
        doc.moveDown(0.8);

        // Claim Summary
        doc.fontSize(12).font("Helvetica-Bold").text("Claim Summary").moveDown(0.3);
        doc.font("Helvetica").fontSize(11);
        row(doc, "Total Bill Amount", `Rs. ${billData.amount.toFixed(2)}`);
        row(doc, "ESIC Claimable Amount", `Rs. ${claim.amount.toFixed(2)}`);
        row(doc, "Eligibility Reason", claim.reason);
        doc.moveDown(1.5);

        // Footer
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").lineWidth(1).stroke().moveDown(0.5);
        doc
            .fontSize(10)
            .font("Helvetica-Oblique")
            .fillColor("#555555")
            .text(
                "INSTRUCTIONS: Submit this form at your nearest ESIC office along with original bills, " +
                "a copy of your ESIC card, and the hospital discharge summary. Keep photocopies of all documents.",
                { align: "justify" }
            );

        doc.end();
        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

/**
 * Generate a PMJAY claim summary PDF.
 */
export async function generatePmjayPdf({ billData, claim, user }: PdfOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        const filename = `PMJAY-${Date.now()}.pdf`;
        const filePath = path.join(PUBLIC_DOCS_DIR, filename);
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .fillColor("#1a1a2e")
            .text("Pradhan Mantri Jan Arogya Yojana (PMJAY)", { align: "center" })
            .moveDown(0.2);
        doc
            .fontSize(13)
            .font("Helvetica")
            .fillColor("#444444")
            .text("Claim Summary Sheet", { align: "center" })
            .moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#1a1a2e").lineWidth(2).stroke().moveDown(1);

        // Beneficiary Details
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Beneficiary Details").moveDown(0.3);
        doc.font("Helvetica").fillColor("#000000").fontSize(11);
        row(doc, "Patient Name", user.patientName || "N/A");
        row(doc, "PMJAY ID", user.pmjayId || "N/A");
        doc.moveDown(0.8);

        // Treatment Details
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Treatment Details").moveDown(0.3);
        doc.font("Helvetica").fillColor("#000000").fontSize(11);
        row(doc, "Hospital Name", billData.hospitalName || "N/A");
        row(doc, "Treatment / Procedure", billData.treatment || "N/A");
        row(doc, "Admission Date", billData.admissionDate || "N/A");
        row(doc, "Discharge Date", billData.dischargeDate || "N/A");
        doc.moveDown(0.8);

        // Claim Summary
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Claim Summary").moveDown(0.3);
        doc.font("Helvetica").fillColor("#000000").fontSize(11);
        row(doc, "Total Bill Amount", `Rs. ${billData.amount.toFixed(2)}`);
        row(doc, "PMJAY Covered Amount", `Rs. ${claim.amount.toFixed(2)}`);
        row(doc, "Reason", claim.reason);
        doc.moveDown(1.5);

        // Next Steps
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Next Steps").moveDown(0.3);
        doc.font("Helvetica").fillColor("#000000").fontSize(11);
        const steps = [
            "1. Visit the nearest PMJAY empanelled hospital kiosk or Common Service Centre (CSC) to initiate the claim.",
            "2. Carry original Aadhaar card along with the original discharge summary and bills from the hospital.",
            `3. Quote your PMJAY ID (${user.pmjayId || "provided above"}) at the kiosk. The claim will be processed digitally.`,
        ];
        steps.forEach((step) => doc.text(step, { indent: 10, paragraphGap: 4 }));

        doc.end();
        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}
