export type ZonePrefix = {
  id: string;
  label: string;
  prefix: string;
};

/** Zone prefixes baked into household USSD/SMS codes. */
export const zonePrefixes: ZonePrefix[] = [
  { id: 'savelugu', label: 'Savelugu', prefix: 'SAV' },
  { id: 'kumbungu', label: 'Kumbungu', prefix: 'KUM' },
  { id: 'tolon', label: 'Tolon', prefix: 'TOL' },
  { id: 'gushegu', label: 'Gushegu', prefix: 'GUS' },
];

export type HouseholdCodeRecord = {
  hhNumber: string;
  zoneId: string;
  householdName: string;
  landmark: string;
  headLabel: string;
  createdAt: string;
};

/** Mock: next sequence per zone (pilot). */
export function nextHhNumber(prefix: string, sequence = 1184): string {
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}
