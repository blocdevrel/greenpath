import type { DailyMetric, HouseholdVisit, QuickAction } from '../types/home';

export const dailyMetrics: DailyMetric[] = [
  {
    id: 'visits',
    label: 'Visits today',
    value: '4 / 8',
    detail: '4 remaining',
    icon: 'clipboard-outline',
    tone: 'dark',
  },
  {
    id: 'referrals',
    label: 'Needs referral',
    value: '2 open',
    detail: 'Visit first',
    icon: 'arrow-forward-circle-outline',
    tone: 'primary',
  },
  {
    id: 'distance',
    label: 'Route distance',
    value: '7.5 km',
    detail: 'Passable route',
    icon: 'trail-sign-outline',
    tone: 'dark',
  },
];

export const quickActions: QuickAction[] = [
  { id: 'voice', label: 'Voice', icon: 'mic-outline' },
  { id: 'map', label: 'Route map', icon: 'map-outline' },
  { id: 'hhcode', label: 'HH code', icon: 'keypad-outline' },
  { id: 'nutrition', label: 'Nutrition', icon: 'nutrition-outline' },
];

export const householdVisits: HouseholdVisit[] = [
  {
    id: 'amina-yakubu',
    name: 'Amina Yakubu',
    patientType: 'Pregnant · 32 weeks',
    reason: 'Anaemia symptoms noted at the last visit.',
    level: 'refer',
    distance: '2.4 km',
    dueLabel: '6 days overdue',
  },
  {
    id: 'baby-musah',
    name: 'Baby Musah',
    patientType: 'Newborn · 11 days',
    reason: 'Newborn check overdue; fast breathing reported.',
    level: 'refer',
    distance: '3.1 km',
    dueLabel: 'Due today',
  },
  {
    id: 'fatima-adam',
    name: 'Fatima Adam',
    patientType: 'Child · 14 months',
    reason: 'Low weight-for-age; feeding support started.',
    level: 'treat',
    distance: '1.2 km',
    dueLabel: 'Visit by 2:00 PM',
  },
];
