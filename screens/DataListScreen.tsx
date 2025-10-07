import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
// View removed
import { AgricultureData } from '../types/agriculture';
import { StorageService } from '../services/storage';
import { SyncService } from '../services/sync';
import { ConnectivityStatus } from '../components/ConnectivityStatus';
import { useAuth } from '../contexts/AuthContext';

interface DataListScreenProps {
  navigation: any;
}

export const DataListScreen: React.FC<DataListScreenProps> = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [data, setData] = useState<AgricultureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({
    totalRecords: 0,
    syncedRecords: 0,
    pendingRecords: 0,
    lastSyncTime: null as string | null,
  });

  const loadData = useCallback(async () => {
    try {
      const allData = await StorageService.getAllData();
      const stats = await SyncService.getSyncStats();

      // Sort by date collected (newest first)
      const sortedData = allData.sort(
        (a, b) => new Date(b.dateCollected).getTime() - new Date(a.dateCollected).getTime()
      );

      setData(sortedData);
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await SyncService.syncPendingData();

      if (result.success) {
        Alert.alert('Sync Successful', `${result.syncedCount} records synced successfully`);
      } else {
        Alert.alert('Sync Failed', result.error || 'Failed to sync data');
      }

      // Reload data to update sync status
      await loadData();
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadData]);

  const handleDeleteRecord = useCallback(
    (id: string, farmerName: string) => {
      Alert.alert(
        'Delete Record',
        `Are you sure you want to delete the record for ${farmerName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await StorageService.deleteData(id);
                await loadData();
                Alert.alert('Success', 'Record deleted successfully');
              } catch (error) {
                console.error('Error deleting record:', error);
                Alert.alert('Error', 'Failed to delete record');
              }
            },
          },
        ]
      );
    },
    [loadData]
  );

  const handleLogout = useCallback(() => {
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
  }, [logout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderSyncStatus = (isSynced: boolean) => (
    <View className={`h-3 w-3 rounded-full ${isSynced ? 'bg-green-500' : 'bg-red-500'}`} />
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDataItem = ({ item }: { item: AgricultureData }) => (
    <View className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="flex-1 text-lg font-semibold text-gray-800">{item.farmerName}</Text>
        <View className="ml-2 flex-row items-center">
          {renderSyncStatus(item.isSynced)}
          <Text className="ml-1 text-xs text-gray-500">{item.isSynced ? 'Synced' : 'Pending'}</Text>
        </View>
      </View>

      <View className="space-y-1">
        <Text className="text-gray-600">
          <Text className="font-medium">Location:</Text> {item.location}
        </Text>
        <Text className="text-gray-600">
          <Text className="font-medium">Crop:</Text> {item.cropType}
        </Text>
        <Text className="text-gray-600">
          <Text className="font-medium">Land Size:</Text> {item.landSize} acres
        </Text>
        <Text className="text-gray-600">
          <Text className="font-medium">Irrigation:</Text> {item.irrigationMethod}
        </Text>
        <Text className="text-gray-600">
          <Text className="font-medium">Date:</Text> {formatDate(item.dateCollected)}
        </Text>
      </View>

      <View className="mt-3 flex-row justify-end">
        <TouchableOpacity
          onPress={() => handleDeleteRecord(item.id, item.farmerName)}
          className="rounded bg-red-100 px-3 py-1">
          <Text className="text-sm text-red-600">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="mb-2 text-lg text-gray-500">No data collected yet</Text>
      <Text className="mb-6 text-center text-gray-400">
        Start collecting agricultural data by tapping the button below
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('DataCollection')}
        className="rounded-lg bg-green-500 px-6 py-3">
        <Text className="font-semibold text-white">Collect Data</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-4 text-gray-600">Loading data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ConnectivityStatus />
      <View className="px-4 py-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">Collected Data</Text>
            {user && <Text className="text-sm text-gray-600">Welcome, {user.user_name}</Text>}
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => navigation.navigate('DataCollection')}
              className="rounded-lg bg-green-500 px-4 py-2">
              <Text className="font-semibold text-white">+ Add Data</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="rounded-lg bg-red-500 px-4 py-2">
              <Text className="font-semibold text-white">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Status Card */}
        <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800">Sync Status</Text>
            <TouchableOpacity
              onPress={handleSync}
              disabled={isSyncing || syncStats.pendingRecords === 0}
              className={`rounded-lg px-4 py-2 ${
                isSyncing || syncStats.pendingRecords === 0 ? 'bg-gray-300' : 'bg-blue-500'
              }`}>
              {isSyncing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="font-semibold text-white">Sync Now</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-600">Total Records: {syncStats.totalRecords}</Text>
              <Text className="text-green-600">Synced: {syncStats.syncedRecords}</Text>
            </View>
            <View className="items-end">
              <Text className="text-red-600">Pending: {syncStats.pendingRecords}</Text>
              {syncStats.lastSyncTime && (
                <Text className="text-xs text-gray-500">
                  Last sync: {formatDate(syncStats.lastSyncTime)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Data List */}
      {data.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={data}
          renderItem={renderDataItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#10b981']}
              tintColor="#10b981"
            />
          }
        />
      )}
    </View>
  );
};
