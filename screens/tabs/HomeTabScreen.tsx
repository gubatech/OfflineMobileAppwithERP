import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgricultureData } from '../../types/agriculture';
import { StorageService } from '../../services/storage';
import { SyncService } from '../../services/sync';
import { ConnectivityStatus } from '../../components/ConnectivityStatus';
import { useAuth } from '../../contexts/AuthContext';

interface HomeTabScreenProps {
  navigation: any;
}

export const HomeTabScreen: React.FC<HomeTabScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
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

  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const progressAnim = useMemo(() => new Animated.Value(0), []);

  const loadData = useCallback(async () => {
    try {
      const allData = await StorageService.getAllData();
      const stats = await SyncService.getSyncStats();

      // Sort by date collected (newest first)
      const sortedData = allData.sort(
        (a, b) => new Date(b.dateCollected).getTime() - new Date(a.dateCollected).getTime()
      );

      console.log('Loaded data:', sortedData.length, 'items');
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

  // Animation functions
  const startAnimations = useCallback(() => {
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
    ]).start();
  }, [fadeAnim, slideAnim]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const animateProgress = useCallback(
    (progress: number) => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim]
  );

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoading && data.length > 0) {
      startAnimations();
    }
  }, [isLoading, data.length, startAnimations]);

  useEffect(() => {
    if (isSyncing) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, startPulseAnimation, pulseAnim]);

  useEffect(() => {
    const progress =
      syncStats.totalRecords > 0 ? syncStats.syncedRecords / syncStats.totalRecords : 0;
    animateProgress(progress);
  }, [syncStats, animateProgress]);

  const renderSyncStatus = (isSynced: boolean) => (
    <View
      style={[
        styles.syncIndicator,
        isSynced ? styles.synced : styles.pending,
      ]}
    />
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDataItem = ({ item, index }: { item: AgricultureData; index: number }) => (
    <View
      style={[
        styles.dataItem,
        index === data.length - 1 ? styles.lastItem : styles.itemMargin,
      ]}>
      <View style={styles.dataItemHeader}>
        <Text style={styles.farmerName}>{item.farmerName}</Text>
        <View style={styles.syncContainer}>
          {renderSyncStatus(item.isSynced)}
          <Text style={styles.syncText}>{item.isSynced ? 'Synced' : 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.dataDetails}>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Location:</Text> {item.location}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Crop:</Text> {item.cropType}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Land Size:</Text> {item.landSize} acres
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Irrigation:</Text> {item.irrigationMethod}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Date:</Text> {formatDate(item.dateCollected)}
        </Text>
      </View>

      {/* Image Display */}
      {item.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.fieldImage} />
        </View>
      )}

      <View style={styles.dataActions}>
        <TouchableOpacity
          onPress={() => handleDeleteRecord(item.id, item.farmerName)}
          style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    const agriculturalTips = [
      '🌾 Monitor soil moisture regularly for optimal crop growth',
      '🌱 Use crop rotation to maintain soil fertility',
      '💧 Implement efficient irrigation systems to conserve water',
      '📊 Track weather patterns to plan planting schedules',
      '🌿 Regular pest monitoring helps prevent crop damage',
      '📈 Keep detailed records for better decision making',
    ];

    const randomTip = agriculturalTips[Math.floor(Math.random() * agriculturalTips.length)];

    const onboardingSteps = [
      {
        icon: '📝',
        title: 'Step 1: Collect Data',
        description: 'Tap the "Add Data" button to start recording your agricultural information',
        action: 'Add your first field data',
      },
      {
        icon: '📷',
        title: 'Step 2: Take Photos',
        description: 'Capture field images to document crop conditions and progress',
        action: 'Document your fields',
      },
      {
        icon: '☁️',
        title: 'Step 3: Auto Sync',
        description: 'Your data automatically syncs when internet is available',
        action: 'Stay connected',
      },
      {
        icon: '📊',
        title: 'Step 4: View Analytics',
        description: 'Check the Statistics tab to see insights and trends',
        action: 'Analyze your data',
      },
    ];

    return (
      <View
        style={[
          styles.emptyState,
          {
            paddingBottom: insets.bottom,
          },
        ]}>
          <ScrollView 
          
           showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <View style={styles.emptyStateIcon}>
          <Text style={styles.emoji}>🌱</Text>
        </View>

        <Text style={styles.emptyStateTitle}>Welcome to Smart Farming!</Text>
        <Text style={styles.emptyStateSubtitle}>
          Your digital agriculture companion for data-driven farming decisions
        </Text>

        {/* No Data Indicator */}
        <View style={styles.noDataIndicator}>
          <View style={styles.noDataHeader}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataTitle}>No Data Yet</Text>
          </View>
          <Text style={styles.noDataDescription}>
            You haven&apos;t collected any agricultural data yet. Follow the guide below to get
            started!
          </Text>
        </View>

        {/* Onboarding Steps */}
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingHeader}>
            <Text style={styles.onboardingIcon}>🚀</Text>
            <Text style={styles.onboardingTitle}>Getting Started Guide</Text>
          </View>

          <Text style={styles.onboardingSubtitle}>
            Follow these simple steps to begin your smart farming journey:
          </Text>

          {onboardingSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
                <Text style={styles.stepAction}>{step.action}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Agricultural Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Today&apos;s Agricultural Tip</Text>
          </View>
          <Text style={styles.tipText}>{randomTip}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Why Track Agricultural Data?</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25%</Text>
              <Text style={styles.statLabel}>Yield Increase</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>30%</Text>
              <Text style={styles.statLabel}>Water Savings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>40%</Text>
              <Text style={styles.statLabel}>Cost Reduction</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50%</Text>
              <Text style={styles.statLabel}>Better Decisions</Text>
            </View>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What You Can Track</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌾</Text>
              <Text style={styles.featureText}>Crop Types & Varieties</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📏</Text>
              <Text style={styles.featureText}>Land Size & Boundaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💧</Text>
              <Text style={styles.featureText}>Irrigation Methods</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📷</Text>
              <Text style={styles.featureText}>Field Photos</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Performance Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>☁️</Text>
              <Text style={styles.featureText}>Cloud Sync</Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DataCollection')}
          className='bg-green-600 rounded-lg px-6 py-3 shadow-lg flex-row items-center justify-center mt-4 mb-8 text-white'
          
          >
          <Text className='text-white font-bold'>🚀 Start Collecting Data</Text>
        </TouchableOpacity>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Statistics')}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📊 View Statistics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ActivityIndicator size="large" color="#00963f" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00963f" />
      <ConnectivityStatus />
      
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={['#00963f', '#f7a607']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Agriculture Data</Text>
              {user && <Text style={styles.welcomeText}>Welcome, {user.user_name}</Text>}
            </View>
            <LinearGradient
              colors={['#00963f', '#00cc55']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <TouchableOpacity onPress={() => navigation.navigate('DataCollection')}>
                <Text style={styles.primaryButtonText}>+ Add Data</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Sync Status Card */}
          <View style={styles.syncCard}>
            <View style={styles.syncCardHeader}>
              <Text style={styles.syncCardTitle}>Sync Status</Text>
              <LinearGradient
                colors={
                  isSyncing || syncStats.pendingRecords === 0
                    ? ['#cccccc', '#aaaaaa']
                    : ['#f7ac07', '#ffc107']
                }
                style={[
                  styles.syncButton,
                  (isSyncing || syncStats.pendingRecords === 0) && styles.disabledButton,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <TouchableOpacity
                  onPress={handleSync}
                  disabled={isSyncing || syncStats.pendingRecords === 0}>
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Sync Progress</Text>
                <Text style={styles.progressLabel}>
                  {syncStats.totalRecords > 0
                    ? Math.round((syncStats.syncedRecords / syncStats.totalRecords) * 100)
                    : 0}
                  %
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: syncStats.totalRecords > 0 
                        ? `${(syncStats.syncedRecords / syncStats.totalRecords) * 100}%` 
                        : '0%',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View>
                <Text style={styles.statText}>Total Records: {syncStats.totalRecords}</Text>
                <Text style={[styles.statText, styles.syncedText]}>
                  Synced: {syncStats.syncedRecords}
                </Text>
              </View>
              <View style={styles.statsRight}>
                <Text style={[styles.statText, styles.pendingText]}>
                  Pending: {syncStats.pendingRecords}
                </Text>
                {syncStats.lastSyncTime && (
                  <Text style={styles.lastSyncText}>
                    Last sync: {formatDate(syncStats.lastSyncTime)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Data List or Empty State */}
      <View style={styles.mainContent}>
        {data.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={data}
            renderItem={({ item, index }) => renderDataItem({ item, index })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#00963f']}
                tintColor="#00963f"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#6c757d',
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  syncCard: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  syncCardHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  syncButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  syncButtonText: {
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabels: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00963f',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 14,
    color: '#6c757d',
  },
  syncedText: {
    color: '#00963f',
    fontWeight: '500',
  },
  pendingText: {
    color: '#f7ac07',
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#a0aec0',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  dataItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemMargin: {
    marginBottom: 12,
  },
  lastItem: {
    marginBottom: 0,
  },
  dataItemHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  farmerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  syncContainer: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIndicator: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  synced: {
    backgroundColor: '#00963f',
  },
  pending: {
    backgroundColor: '#f7ac07',
  },
  syncText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6c757d',
  },
  dataDetails: {
    marginBottom: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#4a5568',
  },
  detailLabel: {
    fontWeight: '500',
    color: '#2d3748',
  },
  dataActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    borderRadius: 4,
    backgroundColor: '#fed7d7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#c53030',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
    height: 64,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#e6fffa',
  },
  emoji: {
    fontSize: 32,
  },
  emptyStateTitle: {
    marginBottom: 8,
    fontSize: 18,
    color: '#6c757d',
  },
  emptyStateSubtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#a0aec0',
  },
  imageContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  fieldImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  // Enhanced Empty State Styles
  tipCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f7ac07',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00963f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#4a5568',
    flex: 1,
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4a5568',
    fontWeight: '500',
    fontSize: 14,
  },
  // Onboarding Styles
  onboardingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#00963f',
  },
  onboardingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  onboardingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00963f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  stepDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
    lineHeight: 18,
  },
  stepAction: {
    fontSize: 12,
    color: '#00963f',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  // No Data Indicator Styles
  noDataIndicator: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noDataIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  noDataDescription: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});
