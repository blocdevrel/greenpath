export type { HouseholdVisit } from '@/shared/types/visit';

export type DailyMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: 'clipboard-outline' | 'arrow-forward-circle-outline' | 'trail-sign-outline';
  tone: 'dark' | 'primary' | 'light';
};

export type QuickAction = {
  id: string;
  label: string;
  icon:
    | 'mic-outline'
    | 'map-outline'
    | 'document-text-outline'
    | 'nutrition-outline'
    | 'keypad-outline';
};

export type { AppTab as HomeTab } from '@/navigation/tabs';
