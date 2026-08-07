export type HomeNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: 'ussd' | 'referral' | 'sync' | 'round';
  unread?: boolean;
};

export const homeNotifications: HomeNotification[] = [
  {
    id: 'n1',
    title: 'USSD birth · SAV-1184',
    detail: 'Yakubu compound — confirm and visit.',
    time: '12 min ago',
    kind: 'ussd',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Referral follow-up due',
    detail: 'Amina Yakubu · Savelugu Hospital',
    time: '1h ago',
    kind: 'referral',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Round reminder',
    detail: '2 households still open today',
    time: '3h ago',
    kind: 'round',
  },
  {
    id: 'n4',
    title: 'Last sync',
    detail: 'Catchment updated · 07:12',
    time: 'Today',
    kind: 'sync',
  },
];
