import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundSyncService } from '../../services/backgroundSync';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface SettingsTabScreenProps {
  navigation: any;
}

interface AppSettings {
  autoSync: boolean;
  syncInterval: number;
  notifications: boolean;
  offlineMode: boolean;
}

export const SettingsTabScreen: React.FC<SettingsTabScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings>({
    autoSync: true,
    syncInterval: 5, // minutes
    notifications: true,
    offlineMode: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState({
    isOnline: false,
    lastSyncTime: null as string | null,
  });

  useEffect(() => {
    loadSettings();
    loadConnectivityStatus();
  }, []);

  const loadSettings = async () => {
    // In a real app, you would load settings from AsyncStorage
    // For now, we'll use default settings
    setIsLoading(false);
  };

  const loadConnectivityStatus = async () => {
    try {
      const stats = await BackgroundSyncService.getSyncStats();
      setConnectivityStatus({
        isOnline: stats.isOnline,
        lastSyncTime: stats.lastSyncTime,
      });
    } catch (error) {
      console.error('Error loading connectivity status:', error);
    }
  };

  const handleSettingChange = (key: keyof AppSettings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // In a real app, you would save settings to AsyncStorage here
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    try {
      const result = await BackgroundSyncService.forceSync();
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Sync Failed', result.message);
      }
      await loadConnectivityStatus();
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data but keep your collected records. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would clear cache here
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Export all collected data as JSON file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const allData = await StorageService.getAllData();
            // In a real app, you would implement actual file export here
            Alert.alert('Success', `Exported ${allData.length} records`);
          } catch (error) {
            console.error('Error exporting data:', error);
            Alert.alert('Error', 'Failed to export data');
          }
        },
      },
    ]);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {/* Header */}
        <LinearGradient
          colors={['#00963f', '#00b84d']}
          className="px-6 pb-8 pt-6"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <View className="items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="settings" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Settings</Text>
            <Text className="text-gray-100">Manage your app preferences</Text>
          </View>
        </LinearGradient>

        <View className="-mt-6 px-5">
          {/* Sync Settings */}
          <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
              <Text className="text-xl font-bold text-gray-800">Sync Settings</Text>
            </View>

            <View className="space-y-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="sync" size={20} color="#00963f" className="mr-2" />
                    <Text className="font-medium text-gray-700">Auto Sync</Text>
                  </View>
                  <Text className="ml-7 text-sm text-gray-500">Automatically sync when online</Text>
                </View>
                <Switch
                  value={settings.autoSync}
                  onValueChange={(value) => handleSettingChange('autoSync', value)}
                  trackColor={{ false: '#d1d5db', true: '#00963f' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="time" size={20} color="#f7ac07" className="mr-2" />
                    <Text className="font-medium text-gray-700">Sync Interval</Text>
                  </View>
                  <Text className="ml-7 text-sm text-gray-500">How often to check for sync</Text>
                </View>
                <View className="flex-row items-center space-x-2 rounded-full bg-gray-100 p-1">
                  <TouchableOpacity
                    onPress={() =>
                      handleSettingChange('syncInterval', Math.max(1, settings.syncInterval - 1))
                    }
                    className="h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                    <Text className="font-bold text-gray-600">-</Text>
                  </TouchableOpacity>
                  <Text className="w-12 text-center font-bold text-gray-800">
                    {settings.syncInterval}m
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleSettingChange('syncInterval', Math.min(60, settings.syncInterval + 1))
                    }
                    className="h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                    <Text className="font-bold text-gray-600">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSyncNow}
                disabled={isLoading}
                className="flex-row items-center justify-center rounded-xl bg-[#00963f] p-4">
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color="white" className="mr-2" />
                    <Text className="font-semibold text-white">Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Connectivity Status */}
          <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-blue-500" />
              <Text className="text-xl font-bold text-gray-800">Connectivity Status</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name={connectivityStatus.isOnline ? 'wifi' : 'wifi-off'}
                    size={20}
                    color={connectivityStatus.isOnline ? '#00963f' : '#ef4444'}
                    className="mr-3"
                  />
                  <Text className="text-gray-600">Internet Connection</Text>
                </View>
                <View className="flex-row items-center">
                  <View
                    className={`mr-2 h-3 w-3 rounded-full ${
                      connectivityStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <Text className="font-semibold text-gray-800">
                    {connectivityStatus.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="cloud-done" size={20} color="#8b5cf6" className="mr-3" />
                  <Text className="text-gray-600">Last Sync</Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {formatDate(connectivityStatus.lastSyncTime)}
                </Text>
              </View>
            </View>
          </View>

          {/* App Settings */}
          <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-purple-500" />
              <Text className="text-xl font-bold text-gray-800">App Settings</Text>
            </View>

            <View className="space-y-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="notifications" size={20} color="#f7ac07" className="mr-2" />
                    <Text className="font-medium text-gray-700">Notifications</Text>
                  </View>
                  <Text className="ml-7 text-sm text-gray-500">Receive sync notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => handleSettingChange('notifications', value)}
                  trackColor={{ false: '#d1d5db', true: '#f7ac07' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="mb-1 flex-row items-center">
                    <Ionicons name="cloud-offline" size={20} color="#6b7280" className="mr-2" />
                    <Text className="font-medium text-gray-700">Offline Mode</Text>
                  </View>
                  <Text className="ml-7 text-sm text-gray-500">Work without internet</Text>
                </View>
                <Switch
                  value={settings.offlineMode}
                  onValueChange={(value) => handleSettingChange('offlineMode', value)}
                  trackColor={{ false: '#d1d5db', true: '#00963f' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-green-500" />
              <Text className="text-xl font-bold text-gray-800">Data Management</Text>
            </View>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleExportData}
                className="mb-2 flex-row items-center justify-between rounded-xl bg-[#00963f] p-4">
                <View className="flex-row items-center">
                  <Ionicons name="download" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Export Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearCache}
                className="flex-row items-center justify-between rounded-xl bg-[#f7ac07] p-4">
                <View className="flex-row items-center">
                  <Ionicons name="trash" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Clear Cache</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Actions */}
          <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-blue-500" />
              <Text className="text-xl font-bold text-gray-800">Account</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="person" size={20} color="#6b7280" className="mr-3" />
                  <Text className="text-gray-600">Logged in as</Text>
                </View>
                <Text className="font-semibold text-gray-800">{user?.user_name || 'Unknown'}</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-between rounded-xl bg-red-500 p-4">
                <View className="flex-row items-center">
                  <Ionicons name="log-out" size={24} color="white" />
                  <Text className="ml-3 font-semibold text-white">Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Information */}
          <View className="rounded-2xl bg-white p-5 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-8 w-1 rounded-full bg-gray-500" />
              <Text className="text-xl font-bold text-gray-800">App Information</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#6b7280" className="mr-3" />
                  <Text className="text-gray-600">Version</Text>
                </View>
                <Text className="font-semibold text-gray-800">1.0.0</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="build" size={20} color="#6b7280" className="mr-3" />
                  <Text className="text-gray-600">Build</Text>
                </View>
                <Text className="font-semibold text-gray-800">2024.01</Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="phone-portrait" size={20} color="#6b7280" className="mr-3" />
                  <Text className="text-gray-600">Platform</Text>
                </View>
                <Text className="font-semibold text-gray-800">React Native</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
