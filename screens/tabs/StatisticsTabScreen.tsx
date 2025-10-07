import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../../services/storage';
import { AgricultureData } from '../../types/agriculture';
import { Ionicons } from '@expo/vector-icons';

interface StatisticsTabScreenProps {
  navigation: any;
}

interface Statistics {
  totalRecords: number;
  totalLandSize: number;
  averageLandSize: number;
  cropTypeStats: Record<string, number>;
  irrigationMethodStats: Record<string, number>;
  monthlyStats: Record<string, number>;
  syncStats: {
    synced: number;
    pending: number;
    syncRate: number;
  };
}

export const StatisticsTabScreen: React.FC<StatisticsTabScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      const allData = await StorageService.getAllData();
      const stats = calculateStatistics(allData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const calculateStatistics = (data: AgricultureData[]): Statistics => {
    const totalRecords = data.length;
    const totalLandSize = data.reduce((sum, item) => sum + item.landSize, 0);
    const averageLandSize = totalRecords > 0 ? totalLandSize / totalRecords : 0;

    // Crop type statistics
    const cropTypeStats: Record<string, number> = {};
    data.forEach((item) => {
      cropTypeStats[item.cropType] = (cropTypeStats[item.cropType] || 0) + 1;
    });

    // Irrigation method statistics
    const irrigationMethodStats: Record<string, number> = {};
    data.forEach((item) => {
      irrigationMethodStats[item.irrigationMethod] =
        (irrigationMethodStats[item.irrigationMethod] || 0) + 1;
    });

    // Monthly statistics
    const monthlyStats: Record<string, number> = {};
    data.forEach((item) => {
      const month = new Date(item.dateCollected).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    // Sync statistics
    const synced = data.filter((item) => item.isSynced).length;
    const pending = totalRecords - synced;
    const syncRate = totalRecords > 0 ? (synced / totalRecords) * 100 : 0;

    return {
      totalRecords,
      totalLandSize,
      averageLandSize,
      cropTypeStats,
      irrigationMethodStats,
      monthlyStats,
      syncStats: {
        synced,
        pending,
        syncRate,
      },
    };
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ComponentProps<typeof Ionicons>['name'],
    color?: string
  ) => (
    <View className="mb-4 rounded-2xl bg-white p-5 shadow-lg">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        {icon && <Ionicons name={icon} size={20} color={color || '#00963f'} />}
      </View>
      <Text className="mb-1 text-3xl font-bold text-[#00963f]">{value}</Text>
      {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
    </View>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <View className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
      <View
        className="h-full rounded-full"
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );

  const renderTopItems = (title: string, items: Record<string, number>, maxItems: number = 5) => {
    const sortedItems = Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems);

    const total = sortedItems.reduce((sum, [, count]) => sum + count, 0);

    return (
      <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
        </View>

        {sortedItems.length > 0 ? (
          <View className="space-y-4">
            {sortedItems.map(([item, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <View key={item} className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <Text className="text-sm font-semibold text-green-600">{index + 1}</Text>
                      </View>
                      <Text className="flex-1 font-medium text-gray-700" numberOfLines={1}>
                        {item}
                      </Text>
                    </View>
                    <Text className="ml-2 font-bold text-gray-800">{count}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="w-10 text-xs text-gray-500">{percentage.toFixed(0)}%</Text>
                    {renderProgressBar(percentage, index === 0 ? '#00963f' : '#f7ac07')}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center py-4">
            <Ionicons name="stats-chart" size={40} color="#d1d5db" />
            <Text className="mt-2 text-gray-500">No data available</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ActivityIndicator size="large" color="#00963f" />
        <Text className="mt-4 text-gray-600">Loading statistics...</Text>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <Ionicons name="alert-circle" size={48} color="#6b7280" />
        <Text className="mt-4 text-gray-600">Failed to load statistics</Text>
        <TouchableOpacity
          onPress={loadStatistics}
          className="mt-4 rounded-xl bg-[#00963f] px-6 py-3">
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Gradient */}
      <LinearGradient
        colors={['#00963f', '#00b84d']}
        className="px-6 pb-8 pt-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="stats-chart" size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white">Statistics</Text>
          <Text className="text-gray-100">Data insights and analytics</Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="-mt-6 flex-1 px-5"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        {/* Overview Stats */}
        <View className="mb-5">
          {/* <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
            <Text className="text-xl font-bold text-gray-800">Overview</Text>
          </View> */}

          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%]">
              {renderStatCard(
                'Total Records',
                statistics.totalRecords,
                'Data entries',
                'document-text',
                '#3b82f6'
              )}
            </View>
            <View className="w-[48%]">
              {renderStatCard(
                'Total Land',
                `${statistics.totalLandSize.toFixed(1)} acres`,
                'Combined area',
                'earth',
                '#00963f'
              )}
            </View>
            <View className="w-[48%]">
              {renderStatCard(
                'Avg Land Size',
                `${statistics.averageLandSize.toFixed(1)} acres`,
                'Per record',
                'analytics',
                '#f7ac07'
              )}
            </View>
            <View className="w-[48%]">
              {renderStatCard(
                'Sync Rate',
                `${statistics.syncStats.syncRate.toFixed(1)}%`,
                `${statistics.syncStats.synced}/${statistics.totalRecords} synced`,
                'cloud-done',
                '#8b5cf6'
              )}
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-blue-500" />
            <Text className="text-xl font-bold text-gray-800">Sync Status</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#00963f" className="mr-3" />
                <Text className="text-gray-600">Synced Records</Text>
              </View>
              <Text className="font-bold text-[#00963f]">{statistics.syncStats.synced}</Text>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#f7ac07" className="mr-3" />
                <Text className="text-gray-600">Pending Records</Text>
              </View>
              <Text className="font-bold text-[#f7ac07]">{statistics.syncStats.pending}</Text>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={20} color="#8b5cf6" className="mr-3" />
                <Text className="text-gray-600">Sync Rate</Text>
              </View>
              <Text className="font-bold text-[#8b5cf6]">
                {statistics.syncStats.syncRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Top Crop Types */}
        {renderTopItems('Top Crop Types', statistics.cropTypeStats)}

        {/* Top Irrigation Methods */}
        {renderTopItems('Top Irrigation Methods', statistics.irrigationMethodStats)}

        {/* Monthly Collection Stats */}
        {renderTopItems('Monthly Collections', statistics.monthlyStats, 6)}

        {/* Quick Actions */}
        <View className="mb-5 rounded-2xl bg-white p-5 shadow-lg">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-[#00963f]" />
            <Text className="text-xl font-bold text-gray-800">Quick Actions</Text>
          </View>

          <View className="space-y-3">
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
              onPress={() => navigation.navigate('Home')}
              className="flex-row items-center justify-between rounded-xl bg-[#3b82f6] p-4">
              <View className="flex-row items-center">
                <Ionicons name="list" size={24} color="white" />
                <Text className="ml-3 font-semibold text-white">View All Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Summary */}
        <View className="rounded-2xl bg-white p-5 shadow-lg">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-gray-500" />
            <Text className="text-xl font-bold text-gray-800">Data Summary</Text>
          </View>

          <Text className="leading-6 text-gray-600">
            You have collected{' '}
            <Text className="font-bold text-[#00963f]">{statistics.totalRecords}</Text> agricultural
            data records covering{' '}
            <Text className="font-bold text-[#00963f]">
              {statistics.totalLandSize.toFixed(1)} acres
            </Text>{' '}
            of land. Your data sync rate is{' '}
            <Text className="font-bold text-[#00963f]">
              {statistics.syncStats.syncRate.toFixed(1)}%
            </Text>
            , with <Text className="font-bold text-[#f7ac07]">{statistics.syncStats.pending}</Text>{' '}
            records pending synchronization.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
