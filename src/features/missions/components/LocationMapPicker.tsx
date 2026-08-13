import { createElement, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Caption } from '@/shared/components/ui';
import { env, hasGoogleMapsKey } from '@/shared/config/env';
import { colors } from '@/shared/theme/tokens';
import { webInputReset } from '@/shared/ui/webInputReset';

export type PickedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

const ACCRA = { latitude: 5.6037, longitude: -0.187 };

type Props = {
  value: PickedLocation | null;
  onChange: (location: PickedLocation) => void;
  height?: number;
};

const POST_BRIDGE = `
function post(loc) {
  var msg = JSON.stringify(loc);
  try {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(msg);
    }
  } catch (e) {}
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
  } catch (e) {}
}
window.addEventListener('message', function (ev) {
  try {
    var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
    if (!d || !d.type) return;
    if (d.type === 'locate' && typeof window.__locate === 'function') {
      window.__locate();
    }
    if (d.type === 'goTo' && typeof window.__goTo === 'function') {
      window.__goTo(d.latitude, d.longitude, d.label || '');
    }
  } catch (e) {}
});
`;

const PLACE_NAME_HELPERS = `
function isPlusCode(text) {
  return /^[A-Z0-9]{2,}\\+[A-Z0-9]+$/i.test(String(text || '').trim());
}
function cleanPart(text) {
  var t = String(text || '').trim();
  if (!t || isPlusCode(t)) return '';
  // Strip leading plus-code segment like "PWGQ+MWR, Lebanon"
  t = t.replace(/^[A-Z0-9]{2,}\\+[A-Z0-9]+,?\\s*/i, '').trim();
  return t;
}
function pickComponent(components, types) {
  for (var i = 0; i < components.length; i++) {
    var c = components[i];
    for (var t = 0; t < types.length; t++) {
      if (c.types.indexOf(types[t]) >= 0) {
        var name = cleanPart(c.long_name);
        if (name) return name;
      }
    }
  }
  return '';
}
function placeNameFromGoogle(result) {
  if (!result) return 'Nearby';
  var comps = result.address_components || [];
  var primary = pickComponent(comps, [
    'premise', 'point_of_interest', 'establishment', 'route',
    'neighborhood', 'sublocality_level_1', 'sublocality', 'political'
  ]);
  var area = pickComponent(comps, [
    'locality', 'postal_town', 'administrative_area_level_2', 'administrative_area_level_1'
  ]);
  if (primary && area && primary.toLowerCase() !== area.toLowerCase()) {
    return primary + ', ' + area;
  }
  if (primary) return primary;
  if (area) return area;
  var formatted = cleanPart((result.formatted_address || '').split(',').slice(0, 2).join(', '));
  return formatted || 'Nearby';
}
function placeNameFromOsm(j) {
  if (!j) return 'Nearby';
  var a = j.address || {};
  var primary = cleanPart(
    a.road || a.neighbourhood || a.suburb || a.quarter || a.village || a.hamlet || a.amenity || ''
  );
  var area = cleanPart(a.city || a.town || a.municipality || a.county || a.state || '');
  if (primary && area && primary.toLowerCase() !== area.toLowerCase()) {
    return primary + ', ' + area;
  }
  if (primary) return primary;
  if (area) return area;
  var display = cleanPart((j.display_name || '').split(',').slice(0, 2).join(', '));
  return display || 'Nearby';
}
`;

function buildPickerHtml(apiKey: string, initial: PickedLocation | null) {
  const start = initial ?? {
    latitude: ACCRA.latitude,
    longitude: ACCRA.longitude,
    label: '',
  };
  const payload = JSON.stringify({
    lat: start.latitude,
    lng: start.longitude,
    label: start.label,
    hasSelection: !!initial,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #eef2f8; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const data = ${payload};
    let marker;
    let geocoder;
    ${POST_BRIDGE}
    ${PLACE_NAME_HELPERS}

    function setPin(lat, lng, label) {
      const pos = { lat: lat, lng: lng };
      if (!marker) {
        marker = new google.maps.Marker({
          position: pos,
          map: window.__map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });
        marker.addListener('dragend', function () {
          const p = marker.getPosition();
          reverse(p.lat(), p.lng());
        });
      } else {
        marker.setPosition(pos);
      }
      post({ latitude: lat, longitude: lng, label: label || 'Nearby' });
    }

    function reverse(lat, lng) {
      if (!geocoder) {
        setPin(lat, lng, 'Nearby');
        return;
      }
      geocoder.geocode({ location: { lat: lat, lng: lng } }, function (results, status) {
        var label = 'Nearby';
        if (status === 'OK' && results && results[0]) {
          label = placeNameFromGoogle(results[0]);
        }
        setPin(lat, lng, label);
      });
    }
    window.reverse = reverse;

    window.__locate = function () {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          if (window.__map) {
            window.__map.panTo({ lat: lat, lng: lng });
            window.__map.setZoom(16);
          }
          reverse(lat, lng);
        },
        function () {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    };

    window.__goTo = function (lat, lng, label) {
      if (window.__map) {
        window.__map.panTo({ lat: lat, lng: lng });
        window.__map.setZoom(16);
      }
      if (label) setPin(lat, lng, label);
      else reverse(lat, lng);
    };

    function initMap() {
      geocoder = new google.maps.Geocoder();
      window.__map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: data.lat, lng: data.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: true,
        gestureHandling: 'greedy',
      });

      // Wait for live GPS / search — don't fake Accra as the selected place
      if (data.hasSelection) {
        setPin(data.lat, data.lng, data.label);
      }
      window.__map.addListener('click', function (e) {
        reverse(e.latLng.lat(), e.latLng.lng());
      });
      window.__locate();
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"></script>
</body>
</html>`;
}

function buildOsmPickerHtml(initial: PickedLocation | null) {
  const start = initial ?? {
    latitude: ACCRA.latitude,
    longitude: ACCRA.longitude,
    label: '',
  };
  const payload = JSON.stringify({
    lat: start.latitude,
    lng: start.longitude,
    label: start.label,
    hasSelection: !!initial,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #eef2f8; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const data = ${payload};
    ${POST_BRIDGE}
    ${PLACE_NAME_HELPERS}
    const map = L.map('map', { zoomControl: true }).setView([data.lat, data.lng], 15);
    window.map = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    let marker = null;

    function setPin(lat, lng, label) {
      if (!marker) {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', function () {
          var p = marker.getLatLng();
          reverse(p.lat, p.lng);
        });
      } else {
        marker.setLatLng([lat, lng]);
      }
      post({ latitude: lat, longitude: lng, label: label || 'Nearby' });
    }

    function reverse(lat, lng) {
      fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng, {
        headers: { 'Accept-Language': 'en' },
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          setPin(lat, lng, placeNameFromOsm(j));
        })
        .catch(function () {
          setPin(lat, lng, 'Nearby');
        });
    }
    window.reverse = reverse;

    window.__locate = function () {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          map.setView([lat, lng], 16);
          reverse(lat, lng);
        },
        function () {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    };

    window.__goTo = function (lat, lng, label) {
      map.setView([lat, lng], 16);
      if (label) setPin(lat, lng, label);
      else reverse(lat, lng);
    };

    if (data.hasSelection) {
      setPin(data.lat, data.lng, data.label);
    }
    map.on('click', function (e) { reverse(e.latlng.lat, e.latlng.lng); });
    window.__locate();
  </script>
</body>
</html>`;
}

function parseLocationMessage(raw: unknown): PickedLocation | null {
  try {
    const data = typeof raw === 'string' ? (JSON.parse(raw) as PickedLocation) : null;
    if (
      !data ||
      typeof data.latitude !== 'number' ||
      typeof data.longitude !== 'number' ||
      !data.label
    ) {
      return null;
    }
    return {
      ...data,
      label: cleanPlaceLabel(data.label),
    };
  } catch {
    return null;
  }
}

/** Drop plus-codes / raw coords from labels shown in the UI. */
function cleanPlaceLabel(label: string) {
  let t = label.trim();
  t = t.replace(/^[A-Z0-9]{2,}\+[A-Z0-9]+,?\s*/i, '').trim();
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(t)) return 'Nearby';
  if (/^[A-Z0-9]{2,}\+[A-Z0-9]+$/i.test(t)) return 'Nearby';
  return t || 'Nearby';
}

/** Web: iframe + parent postMessage (works in Expo web). Native: WebView. */
function MapSurface({
  html,
  onPick,
  onReady,
  onRequestLocate,
  onRequestGoTo,
}: {
  html: string;
  onPick: (loc: PickedLocation) => void;
  onReady: () => void;
  onRequestLocate: MutableRefObject<(() => void) | null>;
  onRequestGoTo: MutableRefObject<
    ((lat: number, lng: number, label: string) => void) | null
  >;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const webRef = useRef<WebView>(null);

  useEffect(() => {
    const send = (payload: object) => {
      const msg = JSON.stringify(payload);
      if (Platform.OS === 'web') {
        iframeRef.current?.contentWindow?.postMessage(msg, '*');
        return;
      }
      webRef.current?.injectJavaScript(`
        (function () {
          try {
            var d = ${msg};
            if (d.type === 'locate' && typeof window.__locate === 'function') window.__locate();
            if (d.type === 'goTo' && typeof window.__goTo === 'function') {
              window.__goTo(d.latitude, d.longitude, d.label || '');
            }
          } catch (e) {}
          return true;
        })();
        true;
      `);
    };

    onRequestLocate.current = () => send({ type: 'locate' });
    onRequestGoTo.current = (latitude, longitude, label) =>
      send({ type: 'goTo', latitude, longitude, label });

    if (Platform.OS !== 'web') return;

    const handler = (event: MessageEvent) => {
      const loc = parseLocationMessage(event.data);
      if (loc) onPick(loc);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPick, onRequestGoTo, onRequestLocate]);

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      ref: iframeRef,
      title: 'Pick report location',
      srcDoc: html,
      allow: 'geolocation *',
      onLoad: onReady,
      style: {
        border: '0',
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#eef2f8',
      } as unknown as ViewStyle,
    });
  }

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{
        html,
        baseUrl: hasGoogleMapsKey
          ? 'https://maps.googleapis.com'
          : 'https://www.openstreetmap.org',
      }}
      style={StyleSheet.absoluteFill}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      geolocationEnabled
      onLoadEnd={onReady}
      onMessage={(event: WebViewMessageEvent) => {
        const loc = parseLocationMessage(event.nativeEvent.data);
        if (loc) onPick(loc);
      }}
      mixedContentMode="always"
      bounces={false}
      overScrollMode="never"
    />
  );
}

type PlaceSuggestion = {
  id: string;
  label: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(q)}` +
    `&countrycodes=gh&limit=6&addressdetails=1`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'Accept-Language': 'en' },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as {
    place_id: number;
    lat: string;
    lon: string;
    name?: string;
    display_name: string;
    address?: Record<string, string>;
  }[];

  return rows.map((row) => {
    const a = row.address ?? {};
    const primary =
      row.name ||
      a.road ||
      a.neighbourhood ||
      a.suburb ||
      a.village ||
      a.town ||
      a.city ||
      cleanPlaceLabel(row.display_name.split(',')[0] ?? '');
    const area = a.city || a.town || a.suburb || a.state || a.country || 'Ghana';
    const label = cleanPlaceLabel(
      primary && area && primary.toLowerCase() !== area.toLowerCase()
        ? `${primary}, ${area}`
        : primary || area,
    );
    return {
      id: String(row.place_id),
      label,
      subtitle: cleanPlaceLabel(row.display_name.split(',').slice(0, 3).join(', ')),
      latitude: Number(row.lat),
      longitude: Number(row.lon),
    };
  });
}

export function LocationMapPicker({ value, onChange, height = 260 }: Props) {
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(value?.label ?? '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const lastSent = useRef('');
  const locateRef = useRef<(() => void) | null>(null);
  const goToRef = useRef<((lat: number, lng: number, label: string) => void) | null>(null);
  const typingRef = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const html = useMemo(() => {
    if (hasGoogleMapsKey) return buildPickerHtml(env.googleMapsApiKey, value);
    return buildOsmPickerHtml(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPick = useCallback(
    (data: PickedLocation) => {
      const key = `${data.latitude.toFixed(5)},${data.longitude.toFixed(5)},${data.label}`;
      if (key === lastSent.current) return;
      lastSent.current = key;
      onChange(data);
      if (!typingRef.current) {
        setQuery(data.label);
        setShowSuggestions(false);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (value?.label && !typingRef.current) setQuery(value.label);
  }, [value?.label]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const onChangeQuery = (text: string) => {
    typingRef.current = true;
    setQuery(text);
    setShowSuggestions(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(() => {
      void searchPlaces(text)
        .then((rows) => {
          setSuggestions(rows);
          setSearching(false);
        })
        .catch(() => {
          setSuggestions([]);
          setSearching(false);
        });
    }, 350);
  };

  const pickSuggestion = (place: PlaceSuggestion) => {
    typingRef.current = false;
    setQuery(place.label);
    setSuggestions([]);
    setShowSuggestions(false);
    goToRef.current?.(place.latitude, place.longitude, place.label);
    onChange({
      latitude: place.latitude,
      longitude: place.longitude,
      label: place.label,
    });
  };

  const useCurrentLocation = () => {
    typingRef.current = false;
    setShowSuggestions(false);
    setSuggestions([]);
    locateRef.current?.();
  };

  return (
    <View className="gap-3">
      <View
        style={{ height }}
        className="relative overflow-hidden rounded-2xl border border-line bg-canvas-sunken">
        {!ready ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-canvas-sunken">
            <ActivityIndicator color={colors.primary.DEFAULT} />
            <Caption className="mt-2">Loading map…</Caption>
          </View>
        ) : null}
        <MapSurface
          html={html}
          onPick={onPick}
          onReady={() => setReady(true)}
          onRequestLocate={locateRef}
          onRequestGoTo={goToRef}
        />
      </View>

      <View className="gap-2">
        <View className="flex-row items-center gap-2 rounded-2xl border border-line bg-card px-3 py-3">
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onFocus={() => {
              typingRef.current = true;
              if (suggestions.length) setShowSuggestions(true);
            }}
            placeholder="Search a location"
            placeholderTextColor={colors.muted}
            className="min-w-0 flex-1 font-sans text-body text-ink"
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
            style={webInputReset}
          />
          {searching ? (
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          ) : query.length > 0 ? (
            <Pressable
              onPress={() => {
                typingRef.current = true;
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              accessibilityLabel="Clear search"
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-canvas-sunken">
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={useCurrentLocation}
            accessibilityLabel="Use current location"
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary-50">
            <Ionicons name="locate" size={18} color={colors.primary.DEFAULT} />
          </Pressable>
        </View>

        {value?.label && !showSuggestions ? (
          <Caption numberOfLines={1}>{value.label}</Caption>
        ) : null}

        {showSuggestions && suggestions.length > 0 ? (
          <View className="overflow-hidden rounded-2xl border border-line bg-card">
            {suggestions.map((place, index) => (
              <Pressable
                key={place.id}
                onPress={() => pickSuggestion(place)}
                className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-canvas-sunken ${
                  index > 0 ? 'border-t border-line' : ''
                }`}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-canvas-sunken">
                  <Ionicons name="location" size={18} color={colors.ink.DEFAULT} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-sans-semibold text-body text-ink" numberOfLines={1}>
                    {place.label}
                  </Text>
                  <Caption numberOfLines={1}>{place.subtitle}</Caption>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
