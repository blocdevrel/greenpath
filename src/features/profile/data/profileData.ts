import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const workerProfile = {
  name: 'Mariama Issah',
  role: 'CHPS officer',
  zone: 'Savelugu · Northern',
  language: 'Dagbani',
  lastSync: '07:12',
  offline: true,
  avatar: require('../../../../assets/avatar-mariama.png'),
} as const;

export const profileStats = [
  { id: 'visits', label: 'Visits', value: '24' },
  { id: 'referrals', label: 'Referrals', value: '6' },
  { id: 'households', label: 'Households', value: '118' },
] as const;

export const profileMenu: readonly {
  id: string;
  label: string;
  value?: string;
  icon: IconName;
  tone?: 'default' | 'danger';
}[] = [
  { id: 'language', label: 'Language', value: 'Dagbani', icon: 'language-outline' },
  { id: 'voice', label: 'Voice Yes/No', value: 'On', icon: 'mic-outline' },
  { id: 'protocols', label: 'Protocol pack', value: 'v1.4', icon: 'document-text-outline' },
  { id: 'facilities', label: 'Facility directory', value: '10 sites', icon: 'business-outline' },
  { id: 'ussd', label: 'HH code / USSD', value: 'Generate', icon: 'keypad-outline' },
  { id: 'sync', label: 'Sync', value: 'Offline', icon: 'cloud-offline-outline' },
  { id: 'zone', label: 'Zone', value: 'Savelugu', icon: 'map-outline' },
  { id: 'signout', label: 'Sign out', icon: 'log-out-outline', tone: 'danger' },
];
