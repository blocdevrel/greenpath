export type ReferralStatus = 'follow_up' | 'awaiting' | 'closed';

export type Referral = {
  id: string;
  name: string;
  patientType: string;
  reason: string;
  facility: string;
  facilityDistance: string;
  routeNote: string;
  status: ReferralStatus;
  dueLabel: string;
  slipPrinted: boolean;
};
