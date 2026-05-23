/**
 * API Service for Project McCaren
 * Handles all communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface BillData {
  hospitalName: string | null;
  treatment: string | null;
  treatmentKey: string | null;
  amount: number;
  admissionDate: string | null;
  dischargeDate: string | null;
}

export interface ExtractBillResponse {
  billData: BillData;
  caseId: number;
  sessionId: string;
}

export interface ClaimData {
  id: number;
  scheme: string;
  eligible: boolean;
  amount: number;
  reason: string;
  pdfUrl?: string;
}

export interface ComputeClaimsResponse {
  claims: ClaimData[];
}

export interface CardValidationResult {
  isValid: boolean;
  overallScore: number;
  cardType: 'pmjay' | 'esic';
  checks: {
    qrCode: { passed: boolean; score: number; message: string };
    hologram: { passed: boolean; score: number; message: string };
    idFormat: { passed: boolean; score: number; message: string };
    tampering: { passed: boolean; score: number; message: string };
  };
  extractedInfo: {
    beneficiaryId: string | null;
    name: string | null;
    stateCode: string | null;
  };
  flags: string[];
}

/**
 * Extract bill data from an image
 */
export async function extractBill(imageFile: File | Blob): Promise<ExtractBillResponse> {
  const formData = new FormData();
  formData.append('billImage', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/extract-bill`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to extract bill data');
  }

  return response.json();
}

/**
 * Compute claims based on bill data
 */
export async function computeClaims(
  billData: BillData,
  caseId: number,
  flags?: { hasESIC?: boolean; hasPMJAY?: boolean }
): Promise<ComputeClaimsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/compute-claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billData,
      caseId,
      flags: flags || {},
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to compute claims');
  }

  return response.json();
}

/**
 * Verify insurance card
 */
export async function verifyCard(
  imageFile: File | Blob,
  cardType: 'pmjay' | 'esic'
): Promise<CardValidationResult> {
  const formData = new FormData();
  formData.append('cardImage', imageFile);
  formData.append('cardType', cardType);

  const response = await fetch(`${API_BASE_URL}/api/verify-card`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to verify card');
  }

  return response.json();
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload bill image and get extracted data + claims
 */
export async function processFullBill(
  imageDataUrl: string,
  manualAmount?: number
): Promise<{
  billData: BillData;
  caseId: number;
  claims: ClaimData[];
}> {
  // Convert data URL to blob
  const blob = dataURLtoBlob(imageDataUrl);
  
  // Extract bill data
  const { billData, caseId } = await extractBill(blob);
  
  // Override amount if provided manually
  if (manualAmount && manualAmount > 0) {
    billData.amount = manualAmount;
  }
  
  // Compute claims
  const { claims } = await computeClaims(billData, caseId);
  
  return { billData, caseId, claims };
}
