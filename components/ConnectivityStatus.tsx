import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const ConnectivityStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true);
    });

    return unsubscribe;
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <View className="bg-red-500 px-4 py-2">
      <Text className="text-center text-sm font-medium text-white">
        No Internet Connection - Data will sync when connection is restored
      </Text>
    </View>
  );
};

