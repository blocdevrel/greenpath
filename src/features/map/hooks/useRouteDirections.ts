import { useEffect, useMemo, useState } from 'react';

import { env } from '@/shared/config/env';

import { decodePolyline } from '../lib/decodePolyline';

type LatLng = { latitude: number; longitude: number };

type DirectionsResult = {
  coordinates: LatLng[];
  distanceText?: string;
  durationText?: string;
  error?: string;
};

const apiKey = env.googleMapsApiKey;

/**
 * Fetch a driving route through today's ranked stops via Google Directions.
 * Falls back to straight segments between stops when the API is unavailable.
 */
export function useRouteDirections(origin: LatLng, stops: LatLng[]): DirectionsResult {
  const stopsKey = stops.map((stop) => `${stop.latitude},${stop.longitude}`).join('|');
  const fallback = useMemo(
    () => [origin, ...stops],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by stopsKey
    [origin.latitude, origin.longitude, stopsKey]
  );

  const [remote, setRemote] = useState<{ key: string; result: DirectionsResult } | null>(null);

  useEffect(() => {
    if (stops.length === 0 || !apiKey) return;

    const destination = stops[stops.length - 1];
    const waypoints = stops
      .slice(0, -1)
      .map((stop) => `${stop.latitude},${stop.longitude}`)
      .join('|');

    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: 'driving',
      key: apiKey,
    });

    if (waypoints) {
      params.set('waypoints', waypoints);
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
        );
        const data = await response.json();

        if (cancelled) return;

        if (data.status !== 'OK' || !data.routes?.[0]) {
          setRemote({
            key: stopsKey,
            result: {
              coordinates: fallback,
              // Keep map usable; only hint when Directions fails.
              error:
                data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT'
                  ? 'Showing straight path (Directions unavailable)'
                  : undefined,
            },
          });
          return;
        }

        const route = data.routes[0];
        const encoded = route.overview_polyline?.points as string | undefined;
        const coordinates = encoded ? decodePolyline(encoded) : fallback;
        const legDistance = route.legs?.reduce(
          (sum: number, leg: { distance?: { value?: number } }) => sum + (leg.distance?.value ?? 0),
          0
        );
        const legDuration = route.legs?.reduce(
          (sum: number, leg: { duration?: { value?: number } }) => sum + (leg.duration?.value ?? 0),
          0
        );

        setRemote({
          key: stopsKey,
          result: {
            coordinates,
            distanceText: legDistance ? `${(legDistance / 1000).toFixed(1)} km` : undefined,
            durationText: legDuration ? `${Math.round(legDuration / 60)} min` : undefined,
          },
        });
      } catch {
        if (!cancelled) {
          setRemote({
            key: stopsKey,
            result: {
              coordinates: fallback,
              error: 'Could not load route',
            },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by stopsKey
  }, [fallback, origin.latitude, origin.longitude, stopsKey]);

  if (stops.length === 0) {
    return { coordinates: [origin] };
  }

  if (!apiKey) {
    // Straight-line fallback still draws the day's stop order without Directions.
    return { coordinates: fallback };
  }

  if (remote?.key === stopsKey) {
    return remote.result;
  }

  return { coordinates: fallback };
}
