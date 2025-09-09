import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storage';
import { SyncService } from '../../services/sync';
import { Ionicons } from '@expo/vector-icons';

interface ProfileTabScreenProps {
  navigation: any;
}

export const ProfileTabScreen: React.FC<ProfileTabScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [userStats, setUserStats] = useState({
    totalRecords: 0,
    syncedRecords: 0,
    pendingRecords: 0,
    lastSyncTime: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(30), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, slideAnim, scaleAnim]);

  const loadUserStats = async () => {
    try {
      const stats = await SyncService.getSyncStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all collected data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
              await loadUserStats();
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ActivityIndicator size="large" color="#00963f" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {/* Header Gradient */}
        <LinearGradient
          colors={['#00963f', '#00b84d']}
          className="px-6 pb-8 pt-6"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="items-center">
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
              className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-white/20">
              <Text className="text-3xl font-bold text-white">
                {user?.user_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </Animated.View>
            <Text className="text-2xl font-bold text-white">{user?.user_name || 'User'}</Text>
            <Text className="text-gray-100">{user?.emailm || 'No email'}</Text>
            <View className="mt-2 flex-row items-center rounded-full bg-white/20 px-4 py-1">
              <Ionicons name="leaf" size={16} color="white" />
              <Text className="ml-2 text-sm text-white">Data Collector</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <View className="-mt-6 px-5">
          {/* User Stats */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
              <Text className="text-xl font-bold text-gray-800">Your Statistics</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons name="document-text" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-gray-600">Total Records</Text>
                </View>
                <Text className="text-lg font-bold text-gray-800">{userStats.totalRecords}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Ionicons name="checkmark-circle" size={20} color="#00963f" />
                  </View>
                  <Text className="text-gray-600">Synced Records</Text>
                </View>
                <Text className="text-lg font-bold text-[#00963f]">{userStats.syncedRecords}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Ionicons name="time" size={20} color="#f7ac07" />
                  </View>
                  <Text className="text-gray-600">Pending Records</Text>
                </View>
                <Text className="text-lg font-bold text-[#f7ac07]">{userStats.pendingRecords}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Ionicons name="sync" size={20} color="#8b5cf6" />
                  </View>
                  <Text className="text-gray-600">Last Sync</Text>
                </View>
                <Text className="text-right text-sm text-gray-500">
                  {formatDate(userStats.lastSyncTime)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Account Information */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-blue-500" />
              <Text className="text-xl font-bold text-gray-800">Account Information</Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-500">User ID</Text>
                <Text className="text-gray-800">{user?.name || 'N/A'}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View>
                <Text className="text-sm font-medium text-gray-500">Username</Text>
                <Text className="text-gray-800">{user?.user_name || 'N/A'}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View>
                <Text className="text-sm font-medium text-gray-500">Email</Text>
                <Text className="text-gray-800">{user?.emailm || 'N/A'}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View>
                <Text className="text-sm font-medium text-gray-500">Account Created</Text>
                <Text className="text-gray-800">
                  {user?.creation ? formatDate(user.creation) : 'N/A'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
              <Text className="text-xl font-bold text-gray-800">Quick Actions</Text>
            </View>

            <View className="space-y-3 ">
              <TouchableOpacity
                onPress={() => navigation.navigate('DataCollection')}
                className="mb-2 flex-row items-center justify-between rounded-xl bg-[#00963f] p-4">
                <View className="flex-row items-center">
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Collect New Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Statistics')}
                className="mb-2 flex-row items-center justify-between rounded-xl bg-[#3b82f6] p-4">
                <View className="flex-row items-center">
                  <Ionicons name="stats-chart" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">View Statistics</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                className="flex-row items-center justify-between rounded-xl bg-[#6b7280] p-4">
                <View className="flex-row items-center">
                  <Ionicons name="settings" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-red-500" />
              <Text className="text-xl font-bold text-red-800">Danger Zone</Text>
            </View>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleClearData}
                className="mb-2 flex-row items-center justify-between rounded-xl bg-red-500 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="trash" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Clear All Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-between rounded-xl bg-red-600 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="log-out" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* App Info */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-gray-500" />
              <Text className="text-xl font-bold text-gray-800">App Information</Text>
            </View>

            <View className="space-y-2">
              <Text className="text-gray-600">Agriculture Data Collection App</Text>
              <Text className="text-gray-600">Version 1.0.0</Text>
              <Text className="text-gray-600">Built with React Native & Expo</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
