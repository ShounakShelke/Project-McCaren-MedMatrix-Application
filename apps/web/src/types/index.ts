export type UserRole = 'admin' | 'provider' | 'patient' | 'auditor';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface BillData {
  id?: number;
  hospital_name: string | null;
  treatment: string | null;
  treatment_key: string | null;
  amount: number;
  admission_date: string | null;
  discharge_date: string | null;
}

export interface Claim {
  id: number;
  case_id: number;
  scheme: string;
  eligible: boolean;
  amount: number;
  reason: string;
  pdf_url: string | null;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

export interface Case {
  id: number;
  session_id: string;
  created_by_id: number | null;
  patient_name: string | null;
  patient_income: number | null;
  patient_state: string | null;
  created_at: string;
  bill: BillData | null;
  claims: Claim[];
}

export interface Hospital {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string | null;
  pincode: string | null;
  ratings: number;
  bed_availability: number;
  specialty: string | null;
  supports_pmjay: boolean;
  supports_esic: boolean;
}

export interface CardValidationResult {
  is_valid: boolean;
  overall_score: number;
  card_type: 'pmjay' | 'esic';
  checks: {
    qr_code: { passed: boolean; score: number; message: string };
    hologram: { passed: boolean; score: number; message: string };
    id_format: { passed: boolean; score: number; message: string };
    tampering: { passed: boolean; score: number; message: string };
  };
  extracted_info: {
    beneficiary_id: string | null;
    name: string | null;
    state_code: string | null;
  };
  flags: string[];
}
