import type { Referral } from '../types/referral';

export const referralSummary = {
  open: 3,
  followUpDue: 2,
  closedThisWeek: 1,
} as const;

export const referrals: Referral[] = [
  {
    id: 'amina-yakubu',
    name: 'Amina Yakubu',
    patientType: 'Pregnant · 32 weeks',
    reason: 'Severe anaemia',
    facility: 'Savelugu Hospital',
    facilityDistance: '11 km',
    routeNote: 'Use Tamale bypass',
    status: 'follow_up',
    dueLabel: 'Due tomorrow',
    slipPrinted: true,
  },
  {
    id: 'baby-musah',
    name: 'Baby Musah',
    patientType: 'Newborn · 11 days',
    reason: 'Fast breathing',
    facility: 'Tolon Health Centre',
    facilityDistance: '6 km',
    routeNote: 'Passable track',
    status: 'awaiting',
    dueLabel: 'Slip printed',
    slipPrinted: true,
  },
  {
    id: 'hauwa-ibrahim',
    name: 'Hauwa Ibrahim',
    patientType: 'Pregnant · 28 weeks',
    reason: 'High blood pressure',
    facility: 'Kumbungu CHPS',
    facilityDistance: '4 km',
    routeNote: 'Nearest BP site',
    status: 'awaiting',
    dueLabel: 'Print slip',
    slipPrinted: false,
  },
  {
    id: 'zenabu-alidu',
    name: 'Zenabu Alidu',
    patientType: 'Pregnant · 16 weeks',
    reason: 'Ultrasound',
    facility: 'Tamale Teaching',
    facilityDistance: '18 km',
    routeNote: 'Arrived',
    status: 'closed',
    dueLabel: 'Closed 3 Aug',
    slipPrinted: true,
  },
];
