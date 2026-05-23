export const PMJAY_VALID_STATE_CODES = [
  'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JK',
  'JH', 'KA', 'KL', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD',
  'PB', 'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB', 'AN',
  'CH', 'DN', 'DD', 'DL', 'LD', 'PY'
];

export interface EsicOffice {
  city: string;
  address: string;
  pincode: string;
}

export const ESIC_OFFICES: EsicOffice[] = [
  {
    city: "Mumbai",
    address: "ESIC Model Hospital, Marol, Andheri East",
    pincode: "400093"
  },
  {
    city: "Delhi",
    address: "ESIC Hospital, Basaidarapur, New Delhi",
    pincode: "110015"
  },
  {
    city: "Pune",
    address: "ESIC Hospital, Bibwewadi, Pune",
    pincode: "411037"
  }
];
