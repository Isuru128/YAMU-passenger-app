import React, { useRef, useMemo, useEffect } from 'react';
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

  // Generate Leaflet HTML document with OpenStreetMap / CartoDB tiles
  const leafletHtml = useMemo(() => {
    const centerLat = pickupCoordinates.latitude || DEFAULT_COORDS.latitude;
    const centerLng = pickupCoordinates.longitude || DEFAULT_COORDS.longitude;

    const routeJson = JSON.stringify(
      (routeCoordinates || []).map((c) => [c.latitude, c.longitude])
    );

    const vehiclesJson = JSON.stringify(
      nearbyVehicles.map((v) => ({
        id: v.id,
        type: v.type,
        lat: v.coordinates.latitude,
        lng: v.coordinates.longitude,
        rotation: v.rotation || 0,
      }))
    );

    const hasDest = !!destinationCoordinates;
    const destLat = destinationCoordinates?.latitude || 0;
    const destLng = destinationCoordinates?.longitude || 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      background: rgba(255, 255, 255, 0.7) !important;
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
    // Initialize map
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${centerLat}, ${centerLng}], 15);

    // Add high-performance, clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Pickup Marker
    const pickupHtml = \`
      <div class="custom-pin">
        <div class="callout-pill">${pickupLabel}</div>
        <div class="pin-circle"><div class="pin-core"></div></div>
      </div>
    \`;
    const pickupIcon = L.divIcon({
      html: pickupHtml,
      className: '',
      iconSize: [120, 50],
      iconAnchor: [60, 48]
    });
    const pickupMarker = L.marker([${centerLat}, ${centerLng}], { icon: pickupIcon }).addTo(map);

    // Destination Marker (if active)
    let destMarker = null;
    const hasDest = ${hasDest};
    if (hasDest) {
      const destHtml = \`
        <div class="custom-pin">
          <div class="callout-pill" style="color: #ef4444; border-color: #ef4444;">${destinationLabel}</div>
          <div class="pin-circle dest-circle"><div class="pin-core"></div></div>
        </div>
      \`;
      const destIcon = L.divIcon({
        html: destHtml,
        className: '',
        iconSize: [120, 50],
        iconAnchor: [60, 48]
      });
      destMarker = L.marker([${destLat}, ${destLng}], { icon: destIcon }).addTo(map);
    }

    // Route Polyline (from OSRM)
    const routeCoords = ${routeJson};
    if (routeCoords && routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#0f766e',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Fit map bounds to show complete route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (hasDest) {
      const bounds = L.latLngBounds([
        [${centerLat}, ${centerLng}],
        [${destLat}, ${destLng}]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Nearby Vehicle Markers (when not on active route)
    if (!hasDest) {
      const vehicles = ${vehiclesJson};
      const vehicleIcons = {
        tuk: '🛺',
        car: '🚗',
        bike: '🏍️',
        van: '🚐'
      };

      vehicles.forEach(v => {
        const iconChar = vehicleIcons[v.type] || '🚗';
        const vHtml = \`
          <div class="vehicle-marker" style="transform: rotate(\${v.rotation}deg);">
            <span style="font-size: 16px;">\${iconChar}</span>
          </div>
        \`;
        const vIcon = L.divIcon({
          html: vHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([v.lat, v.lng], { icon: vIcon }).addTo(map);
      });
    }

    // Function callable from React Native to smoothly recenter
    window.recenterMap = function(lat, lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
    };

    // Function callable from React Native to dynamically update pickup location
    window.updatePickup = function(lat, lng, label) {
      if (pickupMarker) {
        pickupMarker.setLatLng([lat, lng]);
      }
      map.flyTo([lat, lng], 15, { animate: true, duration: 1.0 });
    };
  </script>
</body>
</html>
    `;
  }, [
    pickupCoordinates,
    pickupLabel,
    destinationCoordinates,
    destinationLabel,
    routeCoordinates,
    nearbyVehicles,
  ]);

  // Sync Leaflet camera whenever GPS coordinates arrive
  useEffect(() => {
    if (webViewRef.current && pickupCoordinates?.latitude && pickupCoordinates?.longitude) {
      const script = `window.updatePickup && window.updatePickup(${pickupCoordinates.latitude}, ${pickupCoordinates.longitude}, "${pickupLabel}"); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [pickupCoordinates?.latitude, pickupCoordinates?.longitude, pickupLabel]);

  const handleRecenter = () => {
    if (webViewRef.current && pickupCoordinates) {
      const script = `window.recenterMap && window.recenterMap(${pickupCoordinates.latitude}, ${pickupCoordinates.longitude}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
    onRecenter?.();
  };

  // Web Browser fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="OpenStreetMap"
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
        source={{ html: leafletHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      />

      {children}

      {/* Recenter Location Button */}
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
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  map: {
    flex: 1,
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
