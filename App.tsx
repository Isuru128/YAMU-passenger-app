import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { RideProvider } from './src/context/RideContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashIntro } from './src/components/layout/SplashIntro';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <RideProvider>
            <StatusBar style="dark" />
            <RootNavigator />
            {showSplash && <SplashIntro onFinish={() => setShowSplash(false)} />}
          </RideProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
