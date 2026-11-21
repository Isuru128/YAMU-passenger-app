import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Coordinates } from '../../types/location';
import { ENV } from '../../config/env';

interface VehiclePin {
  id: string;
  type: 'tuk' | 'car' | 'bike' | 'van';
  coordinates: Coordinates;
  rotation?: number;
}

export interface WhiteThemedMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  pickupCoordinates?: Coordinates;
  pickupLabel?: string;
  destinationCoordinates?: Coordinates;
  destinationLabel?: string;
  routeCoordinates?: Coordinates[];
  nearbyVehicles?: VehiclePin[];
  onRecenter?: () => void;
  style?: object;
  children?: React.ReactNode;
}

const DEFAULT_COORDS = {
  latitude: 6.9271, // Colombo, Sri Lanka
  longitude: 79.8612,
};

const MOCK_NEARBY_VEHICLES: VehiclePin[] = [
  { id: 'tuk_1', type: 'tuk', coordinates: { latitude: 6.9262, longitude: 79.8462 }, rotation: 45 },
  { id: 'car_1', type: 'car', coordinates: { latitude: 6.9228, longitude: 79.8425 }, rotation: 120 },
  { id: 'bike_1', type: 'bike', coordinates: { latitude: 6.9275, longitude: 79.8432 }, rotation: 190 },
  { id: 'tuk_2', type: 'tuk', coordinates: { latitude: 6.9212, longitude: 79.8471 }, rotation: 310 },
];

export const WhiteThemedMap: React.FC<WhiteThemedMapProps> = ({
  pickupCoordinates = DEFAULT_COORDS,
  pickupLabel = 'Pick up here',
  destinationCoordinates,
  destinationLabel = 'Drop-off',
  routeCoordinates,
  nearbyVehicles = MOCK_NEARBY_VEHICLES,
  onRecenter,
  style,
  children,
}) => {
  const webViewRef = useRef<WebView | null>(null);
  const initialCoordsRef = useRef<Coordinates>({
    latitude: pickupCoordinates?.latitude || DEFAULT_COORDS.latitude,
    longitude: pickupCoordinates?.longitude || DEFAULT_COORDS.longitude,
  });

  // Static HTML with Google Maps Roadmap tiles + Google Maps API key & automatic fallback
  const leafletHtml = useMemo(() => {
    const centerLat = initialCoordsRef.current.latitude;
    const centerLng = initialCoordsRef.current.longitude;
    const apiKey = ENV.MAPS_API_KEY || 'AIzaSyCPbCLkwQSee72-fCbDatw39MKe3hQiKQI';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #map {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: #f8fafc;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      background: rgba(255, 255, 255, 0.75) !important;
    }
    .leaflet-control-zoom {
      display: none !important;
    }
    .custom-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .callout-pill {
      background: #ffffff;
      color: #0f172a;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.18);
      white-space: nowrap;
      margin-bottom: 2px;
      border: 1px solid rgba(0,0,0,0.08);
    }
    .pin-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #0f766e;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-core {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ffffff;
    }
    .dest-circle {
      background: #ef4444 !important;
    }
    .vehicle-marker {
      background: #ffffff;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.22);
      border: 1.5px solid #0f766e;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${centerLat}, ${centerLng}], 15);

    // Primary Google Maps Roadmap layer using provided Google Maps API key
    const googleLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${apiKey}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    }).addTo(map);

    let fallbackUsed = false;
    googleLayer.on('tileerror', function() {
      if (!fallbackUsed) {
        fallbackUsed = true;
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '© OpenStreetMap © CARTO'
        }).addTo(map);
      }
    });

    let pickupMarker = null;
    let destMarker = null;
    let routeLine = null;
    let vehicleLayerGroup = L.layerGroup().addTo(map);

    function buildPinIcon(label, isDest) {
      const colorStyle = isDest ? 'color: #ef4444; border-color: #ef4444;' : '';
      const circleClass = isDest ? 'pin-circle dest-circle' : 'pin-circle';
      return L.divIcon({
        html: '<div class="custom-pin"><div class="callout-pill" style="' + colorStyle + '">' + label + '</div><div class="' + circleClass + '"><div class="pin-core"></div></div></div>',
        className: '',
        iconSize: [140, 50],
        iconAnchor: [70, 48]
      });
    }

    pickupMarker = L.marker([${centerLat}, ${centerLng}], {
      icon: buildPinIcon('Pick up here', false)
    }).addTo(map);

    window.syncMapState = function(state) {
      if (!state) return;
      map.invalidateSize();

      if (state.pickup && state.pickup.lat && state.pickup.lng) {
        if (pickupMarker) {
          pickupMarker.setLatLng([state.pickup.lat, state.pickup.lng]);
          pickupMarker.setIcon(buildPinIcon(state.pickupLabel || 'Pick up here', false));
        } else {
          pickupMarker = L.marker([state.pickup.lat, state.pickup.lng], {
            icon: buildPinIcon(state.pickupLabel || 'Pick up here', false)
          }).addTo(map);
        }
      }

      if (state.destination && state.destination.lat && state.destination.lng) {
        if (destMarker) {
          destMarker.setLatLng([state.destination.lat, state.destination.lng]);
          destMarker.setIcon(buildPinIcon(state.destinationLabel || 'Drop-off', true));
        } else {
          destMarker = L.marker([state.destination.lat, state.destination.lng], {
            icon: buildPinIcon(state.destinationLabel || 'Drop-off', true)
          }).addTo(map);
        }
      } else if (destMarker) {
        map.removeLayer(destMarker);
        destMarker = null;
      }

      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }

      if (state.route && state.route.length > 1) {
        routeLine = L.polyline(state.route, {
          color: '#0f766e',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [55, 55] });
      } else if (state.pickup && state.destination) {
        const bounds = L.latLngBounds([
          [state.pickup.lat, state.pickup.lng],
          [state.destination.lat, state.destination.lng]
        ]);
        map.fitBounds(bounds, { padding: [55, 55] });
      }

      vehicleLayerGroup.clearLayers();
      if (!state.destination && state.vehicles && state.vehicles.length > 0) {
        const vehicleIcons = { tuk: '🛺', car: '🚗', bike: '🏍️', van: '🚐' };
        state.vehicles.forEach(function(v) {
          const iconChar = vehicleIcons[v.type] || '🚗';
          const vIcon = L.divIcon({
            html: '<div class="vehicle-marker" style="transform: rotate(' + (v.rotation || 0) + 'deg);"><span style="font-size: 16px;">' + iconChar + '</span></div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([v.lat, v.lng], { icon: vIcon }).addTo(vehicleLayerGroup);
        });
      }
    };

    window.recenterMap = function(lat, lng) {
      map.invalidateSize();
      map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
    };

    setTimeout(function() { map.invalidateSize(); }, 100);
    setTimeout(function() { map.invalidateSize(); }, 400);
    window.addEventListener('resize', function() { map.invalidateSize(); });
  </script>
</body>
</html>`;
  }, []);

  const syncToWebView = useCallback(() => {
    if (!webViewRef.current) return;

    const payload = {
      pickup: pickupCoordinates
        ? { lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude }
        : null,
      pickupLabel,
      destination: destinationCoordinates
        ? { lat: destinationCoordinates.latitude, lng: destinationCoordinates.longitude }
        : null,
      destinationLabel,
      route: (routeCoordinates || []).map((c) => [c.latitude, c.longitude]),
      vehicles: (nearbyVehicles || []).map((v) => ({
        id: v.id,
        type: v.type,
        lat: v.coordinates.latitude,
        lng: v.coordinates.longitude,
        rotation: v.rotation || 0,
      })),
    };

    const script = `window.syncMapState && window.syncMapState(${JSON.stringify(payload)}); true;`;
    webViewRef.current.injectJavaScript(script);
  }, [
    pickupCoordinates,
    pickupLabel,
    destinationCoordinates,
    destinationLabel,
    routeCoordinates,
    nearbyVehicles,
  ]);

  useEffect(() => {
    syncToWebView();
  }, [syncToWebView]);

  const handleRecenter = () => {
    if (webViewRef.current && pickupCoordinates) {
      const script = `window.recenterMap && window.recenterMap(${pickupCoordinates.latitude}, ${pickupCoordinates.longitude}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
    onRecenter?.();
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="GoogleMaps"
        />
        {children}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml, baseUrl: 'https://yamu.lk' }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        userAgent="YAMU-Passenger-App/1.0 (https://yamu.lk)"
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        startInLoadingState={true}
        onLoadEnd={syncToWebView}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      />

      {children}

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={22} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  recenterButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
  },
});
