/**
 * PDF Generator Service
 * Generates claim summary documents for users
 */

import { jsPDF } from 'jspdf';

export interface ClaimSummary {
  patientName: string;
  billAmount: number;
  pmjayAmount: number;
  esicAmount: number;
  totalSavings: number;
  finalAmount: number;
  cardType: string;
  verificationScore: number;
  generatedAt: Date;
}

/**
 * Generate a professional claims summary PDF
 */
export function generateClaimsPDF(summary: ClaimSummary): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryGreen = [56, 102, 65]; // Forest Moss
  const darkGray = [31, 41, 55];
  const lightGray = [107, 114, 128];
  
  let yPos = 20;
  
  // === HEADER ===
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Project McCaren', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Healthcare Claims Made Simple', 20, 35);
  
  // Date on right
  doc.setFontSize(9);
  doc.text(`Generated: ${summary.generatedAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - 70, 35);
  
  yPos = 60;
  
  // === DOCUMENT TITLE ===
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CLAIMS SUMMARY REPORT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Divider line
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 15;
  
  // === PATIENT DETAILS ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Patient Details', 20, yPos);
  
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Name:', 25, yPos);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(summary.patientName || 'Not Provided', 60, yPos);
  
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Card Type:', 25, yPos);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(summary.cardType.toUpperCase(), 60, yPos);
  
  yPos += 8;
  
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Verification:', 25, yPos);
  const verificationStatus = summary.verificationScore >= 0.5 ? 'VERIFIED ✓' : 'PENDING';
  doc.setTextColor(summary.verificationScore >= 0.5 ? 34 : 220, summary.verificationScore >= 0.5 ? 139 : 38, summary.verificationScore >= 0.5 ? 34 : 38);
  doc.setFont('helvetica', 'bold');
  doc.text(verificationStatus, 60, yPos);
  
  yPos += 20;
  
  // === BILL BREAKDOWN BOX ===
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, yPos, pageWidth - 40, 70, 3, 3, 'F');
  
  yPos += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Bill Breakdown', 30, yPos);
  
  yPos += 12;
  
  // Table header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('ITEM', 30, yPos);
  doc.text('AMOUNT', pageWidth - 60, yPos);
  
  yPos += 3;
  doc.setDrawColor(229, 231, 235);
  doc.line(30, yPos, pageWidth - 30, yPos);
  
  yPos += 10;
  
  // Original Bill
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Original Hospital Bill', 30, yPos);
  doc.text(`₹${summary.billAmount.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
  
  yPos += 10;
  
  // PM-JAY Claim
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('PM-JAY Claim (Ayushman Bharat)', 30, yPos);
  doc.text(`- ₹${summary.pmjayAmount.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
  
  yPos += 10;
  
  // ESIC Claim
  doc.setTextColor(180, 130, 0);
  doc.text('ESIC Claim (Worker Insurance)', 30, yPos);
  doc.text(`- ₹${summary.esicAmount.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
  
  yPos += 25;
  
  // === FINAL AMOUNT BOX ===
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F');
  
  yPos += 15;
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('AMOUNT YOU NEED TO PAY', 30, yPos);
  
  doc.setFontSize(11);
  doc.text(`Total Savings: ₹${summary.totalSavings.toLocaleString('en-IN')}`, pageWidth - 90, yPos);
  
  yPos += 15;
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${summary.finalAmount.toLocaleString('en-IN')}`, 30, yPos);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${Math.round((summary.totalSavings / summary.billAmount) * 100)}% saved!)`, pageWidth - 70, yPos);
  
  yPos += 30;
  
  // === NEXT STEPS ===
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps', 20, yPos);
  
  yPos += 10;
  
  const steps = [
    '1. Visit the PM-JAY desk at your hospital with this document.',
    '2. Carry your original ID proof and address proof.',
    '3. For ESIC claims, visit your nearest ESIC office with this summary.',
    '4. Keep copies of all original bills and receipts.'
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  steps.forEach(step => {
    doc.text(step, 25, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // === DISCLAIMER ===
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 2, 2, 'F');
  
  yPos += 10;
  
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT:', 25, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('This is an estimated claim summary. Final amounts are subject to verification by respective', 55, yPos);
  yPos += 5;
  doc.text('authorities. Coverage depends on scheme eligibility and hospital empanelment.', 25, yPos);
  
  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Project McCaren - Healthcare Claims Made Simple', 20, footerY);
  doc.text('Toll Free: 1800-MED-HELP (24/7)', pageWidth - 70, footerY);
  
  // Save the PDF
  const fileName = `Project McCaren_Summary_${summary.patientName?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Calculate and generate PDF from bill details
 */
export function generateClaimsSummaryPDF(
  patientName: string,
  billAmount: number,
  cardType: string,
  verificationScore: number
): void {
  const pmjayAmount = Math.round(billAmount * 0.5);
  const esicAmount = Math.round(billAmount * 0.2);
  const totalSavings = pmjayAmount + esicAmount;
  const finalAmount = billAmount - totalSavings;
  
  const summary: ClaimSummary = {
    patientName,
    billAmount,
    pmjayAmount,
    esicAmount,
    totalSavings,
    finalAmount,
    cardType,
    verificationScore,
    generatedAt: new Date()
  };
  
  generateClaimsPDF(summary);
}
