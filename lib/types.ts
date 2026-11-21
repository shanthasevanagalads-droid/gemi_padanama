export type Language = 'en' | 'si';

export type UserRole = 'front_desk' | 'referral_officer' | 'executive' | 'admin';

export type ScreenView = 
  | 'login' 
  | 'dashboard' 
  | 'register' 
  | 'search' 
  | 'details' 
  | 'referrals' 
  | 'reports' 
  | 'settings' 
  | 'executive'
  | 'services';

export type VisitStatus = 'Waiting' | 'In Progress' | 'Referred' | 'Completed';

export type ReferralUrgency = 'Normal' | 'Urgent' | 'Critical';

export type ReferralStatus = 'Pending' | 'In Consultation' | 'Action Plan Agreed' | 'Resolved';

export interface Client {
  id: string;
  fullName: string;
  address: string;
  nic: string;
  gender: 'Male' | 'Female' | 'Other';
  gnDivision: string;
  whatsappNumber: string;
  visitCount: number;
  firstVisitDate: string;
  lastVisitDate: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  nic: string;
  tokenNumber: string;
  visitReason: string;
  visitCount: number;
  visitDate: string;
  arrivalTime: string;
  departureTime?: string;
  status: VisitStatus;
  whatsappNumber: string;
  referralOfficerId: string;
  referralOfficerName: string;
  gnDivision: string;
  notes?: string;
  priority?: 'Normal' | 'Priority' | 'Emergency';
  createdAt: string;
}

export interface Referral {
  id: string;
  visitId: string;
  clientId: string;
  clientName: string;
  nic: string;
  gnDivision: string;
  referringOfficer: string;
  targetOfficerId: string;
  targetOfficerName: string;
  targetDepartment: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  caseSummary: string;
  appointmentDate?: string;
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface GNDivision {
  id: string;
  code: string;
  nameEn: string;
  nameSi: string;
  subArea: string;
}

export interface Officer {
  id: string;
  nameEn: string;
  nameSi: string;
  designationEn: string;
  designationSi: string;
  department: string;
  counterRoom: string;
  contactNumber: string;
  active: boolean;
}

export interface OfficeProfile {
  nameEn: string;
  nameSi: string;
  taglineEn: string;
  taglineSi: string;
  branch: string;
  district: string;
  province: string;
  addressEn: string;
  addressSi: string;
  ngoRegistrationNumber: string;
  hotline: string;
  whatsappSupport: string;
  email: string;
  workingHours: string;
}
