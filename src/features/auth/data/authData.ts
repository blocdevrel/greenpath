export const zones = ['Savelugu', 'Kumbungu', 'Tolon', 'Gushegu'] as const;

export const roles = [
  { id: 'chw', label: 'CHW' },
  { id: 'cho', label: 'CHO' },
] as const;

export type WorkerRole = (typeof roles)[number]['id'];
