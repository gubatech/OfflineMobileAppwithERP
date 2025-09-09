import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './navigation/AppNavigator';
import { BackgroundSyncService } from './services/backgroundSync';
import { AuthProvider } from './contexts/AuthContext';
import 'react-native-gesture-handler';

import './global.css';

export default function App() {
  useEffect(() => {
    // Initialize background sync service
    BackgroundSyncService.initialize();

    // Cleanup on app unmount
    return () => {
      BackgroundSyncService.cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
