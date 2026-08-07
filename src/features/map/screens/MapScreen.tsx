import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { TAB_BAR_SCROLL_PADDING } from '@/shared/components/TabBar';
import { Label } from '@/shared/components/ui';
import { env, hasGoogleMapsKey } from '@/shared/config/env';
import { colors } from '@/shared/theme/tokens';

import { activeRouteStops, routeOrigin } from '../data/mapRouteData';
import { useRouteDirections } from '../hooks/useRouteDirections';

const markerColor = {
  refer: colors.refer.DEFAULT,
  treat: colors.treat.DEFAULT,
  watch: colors.watch.DEFAULT,
} as const;

function buildMapHtml(args: {
  apiKey: string;
  origin: { latitude: number; longitude: number; name: string };
  stops: {
    id: string;
    rank: number;
    name: string;
    why: string;
    patientType: string;
    latitude: number;
    longitude: number;
    color: string;
    levelLabel: string;
  }[];
  path: { latitude: number; longitude: number }[];
  bottomPad: number;
  topPad: number;
}) {
  const payload = JSON.stringify({
    origin: args.origin,
    stops: args.stops,
    path: args.path,
    primary: colors.primary.DEFAULT,
    ink: colors.ink.DEFAULT,
    bottomPad: args.bottomPad,
    topPad: args.topPad,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #eef2f8; }
    .gm-style-iw { border-radius: 12px !important; }
    .gm-style-iw-d { overflow: hidden !important; }
    .tip {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 200px;
      padding: 2px 0;
    }
    .tip strong { display: block; font-size: 14px; color: #101014; margin-bottom: 2px; }
    .tip span { display: block; font-size: 12px; color: #5A6070; line-height: 1.35; }
    .tip em {
      display: inline-block; margin-top: 6px; font-style: normal; font-size: 11px;
      font-weight: 600; padding: 3px 8px; border-radius: 999px; color: #fff;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const data = ${payload};

    function pinSvg(fill, label) {
      const text = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">' +
        '<path d="M18 0C8.6 0 1 7.6 1 17c0 12.4 17 27 17 27s17-14.6 17-27C35 7.6 27.4 0 18 0z" fill="' + fill + '" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="18" cy="17" r="9" fill="#fff"/>' +
        '<text x="18" y="21" text-anchor="middle" font-size="11" font-weight="700" font-family="Arial,sans-serif" fill="' + fill + '">' + text + '</text>' +
        '</svg>';
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function initMap() {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: data.origin.latitude, lng: data.origin.longitude },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        clickableIcons: false,
        gestureHandling: 'greedy',
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
        ],
      });

      const bounds = new google.maps.LatLngBounds();
      const info = new google.maps.InfoWindow();

      const originPos = { lat: data.origin.latitude, lng: data.origin.longitude };
      const originMarker = new google.maps.Marker({
        position: originPos,
        map,
        title: data.origin.name,
        zIndex: 1,
        icon: {
          url: pinSvg(data.primary, 'CHPS'),
          scaledSize: new google.maps.Size(40, 49),
          anchor: new google.maps.Point(20, 49),
        },
      });
      originMarker.addListener('click', () => {
        info.setContent(
          '<div class="tip"><strong>' + data.origin.name + '</strong><span>Start of today\\'s round</span></div>'
        );
        info.open({ map, anchor: originMarker });
      });
      bounds.extend(originPos);

      data.stops.forEach((stop, index) => {
        const pos = { lat: stop.latitude, lng: stop.longitude };
        const isNext = index === 0;
        const marker = new google.maps.Marker({
          position: pos,
          map,
          title: '#' + stop.rank + ' ' + stop.name,
          zIndex: 10 + (data.stops.length - index),
          icon: {
            url: pinSvg(stop.color, stop.rank),
            scaledSize: new google.maps.Size(isNext ? 42 : 36, isNext ? 51 : 44),
            anchor: new google.maps.Point(isNext ? 21 : 18, isNext ? 51 : 44),
          },
        });
        marker.addListener('click', () => {
          info.setContent(
            '<div class="tip">' +
              '<strong>#' + stop.rank + ' · ' + stop.name + '</strong>' +
              '<span>' + stop.patientType + '</span>' +
              '<span>' + stop.why + '</span>' +
              '<em style="background:' + stop.color + '">' + stop.levelLabel + '</em>' +
            '</div>'
          );
          info.open({ map, anchor: marker });
        });
        bounds.extend(pos);
      });

      const routePath =
        data.path && data.path.length > 1
          ? data.path.map((p) => ({ lat: p.latitude, lng: p.longitude }))
          : [
              originPos,
              ...data.stops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
            ];

      new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: data.primary,
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
        zIndex: 2,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              fillColor: data.primary,
              fillOpacity: 1,
              strokeWeight: 0,
            },
            offset: '100%',
            repeat: '90px',
          },
        ],
      });

      map.fitBounds(bounds, {
        top: data.topPad,
        right: 28,
        bottom: data.bottomPad,
        left: 28,
      });
    }
    window.initMap = initMap;
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${args.apiKey}&callback=initMap"></script>
</body>
</html>`;
}

const levelLabel = {
  refer: 'Refer now',
  treat: 'Treat at home',
  watch: 'Keep watching',
} as const;

export function MapScreen() {
  const insets = useSafeAreaInsets();

  const stops = activeRouteStops;
  const stopCoordinates = useMemo(() => stops.map((stop) => stop.coordinate), [stops]);

  const { coordinates } = useRouteDirections(routeOrigin.coordinate, stopCoordinates);

  const html = useMemo(() => {
    if (!hasGoogleMapsKey) return '';
    return buildMapHtml({
      apiKey: env.googleMapsApiKey,
      origin: {
        latitude: routeOrigin.coordinate.latitude,
        longitude: routeOrigin.coordinate.longitude,
        name: routeOrigin.name,
      },
      stops: stops.map((stop) => ({
        id: stop.id,
        rank: stop.rank,
        name: stop.name,
        why: stop.why,
        patientType: stop.patientType,
        latitude: stop.coordinate.latitude,
        longitude: stop.coordinate.longitude,
        color: markerColor[stop.level],
        levelLabel: levelLabel[stop.level],
      })),
      path: coordinates,
      topPad: Math.round(insets.top + 24),
      bottomPad: Math.round(TAB_BAR_SCROLL_PADDING + insets.bottom + 16),
    });
  }, [coordinates, insets.bottom, insets.top, stops]);

  return (
    <View style={styles.screen}>
      {hasGoogleMapsKey ? (
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://maps.googleapis.com' }}
          style={StyleSheet.absoluteFill}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          allowsInlineMediaPlayback
          mixedContentMode="always"
          geolocationEnabled={false}
          bounces={false}
          overScrollMode="never"
        />
      ) : (
        <View style={styles.missingKey}>
          <Label>Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env</Label>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas.DEFAULT,
  },
  missingKey: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
