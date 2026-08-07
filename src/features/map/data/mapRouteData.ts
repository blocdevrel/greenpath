import { roundVisits } from '@/features/rounds/data/roundsData';

import type { RoundVisit } from '@/features/rounds/types/round';

export type RouteStop = RoundVisit & {
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

/** CHPS base near Savelugu — start of today's passable route. */
export const routeOrigin = {
  id: 'chps-base',
  name: 'Savelugu CHPS',
  coordinate: {
    latitude: 9.6245,
    longitude: -0.8278,
  },
} as const;

/**
 * Ranked household stops with coordinates around Savelugu / Tolon.
 * Order matches today's round ranking for the planned visit sequence.
 */
const stopCoordinates: Record<string, { latitude: number; longitude: number }> = {
  'amina-yakubu': { latitude: 9.6312, longitude: -0.8194 },
  'baby-musah': { latitude: 9.6188, longitude: -0.8412 },
  'fatima-adam': { latitude: 9.6276, longitude: -0.8125 },
  'yakubu-household': { latitude: 9.6221, longitude: -0.8218 },
  'mariama-seidu': { latitude: 9.6354, longitude: -0.8336 },
  'hauwa-ibrahim': { latitude: 9.6089, longitude: -0.8524 },
  'abdul-rahman': { latitude: 9.6204, longitude: -0.8182 },
  'zenabu-alidu': { latitude: 9.6401, longitude: -0.8458 },
};

export const routeStops: RouteStop[] = roundVisits
  .filter((visit) => stopCoordinates[visit.id])
  .map((visit) => ({
    ...visit,
    coordinate: stopCoordinates[visit.id],
  }));

export const activeRouteStops = routeStops.filter((stop) => !stop.completed);
