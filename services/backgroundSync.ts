import NetInfo from '@react-native-community/netinfo';
import { SyncService } from './sync';
import { StorageService } from './storage';

export class BackgroundSyncService {
  private static isInitialized = false;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static connectivityListener: (() => void) | null = null;
  private static isOnline = false;

  // Initialize background sync
  static initialize(): void {
    if (this.isInitialized) return;

    console.log('Initializing background sync service');

    // Set up connectivity listener
    this.connectivityListener = NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected === true;

      console.log(
        `Connectivity changed: ${wasOnline ? 'online' : 'offline'} -> ${this.isOnline ? 'online' : 'offline'}`
      );

      // If we just came online, trigger immediate sync
      if (!wasOnline && this.isOnline) {
        console.log('Device came online, triggering sync');
        this.triggerSync();
      }
    });

    // Set up periodic sync (every 5 minutes when online)
    this.startPeriodicSync();

    this.isInitialized = true;
  }

  // Start periodic sync
  private static startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(
      async () => {
        if (this.isOnline) {
          console.log('Periodic sync triggered');
          await this.triggerSync();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  // Trigger sync if conditions are met
  static async triggerSync(): Promise<void> {
    try {
      // Check if we have pending data
      const pendingData = await StorageService.getPendingData();
      if (pendingData.length === 0) {
        console.log('No pending data to sync');
        return;
      }

      // Check if already syncing
      if (SyncService.getIsSyncing()) {
        console.log('Sync already in progress, skipping');
        return;
      }

      // Check connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No internet connection, skipping sync');
        return;
      }

      console.log(`Starting background sync for ${pendingData.length} records`);
      const result = await SyncService.syncPendingData();

      if (result.success) {
        console.log(`Background sync successful: ${result.syncedCount} records synced`);
      } else {
        console.log(`Background sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  // Force sync (for manual triggers)
  static async forceSync(): Promise<{ success: boolean; message: string }> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return { success: false, message: 'No internet connection' };
      }

      const result = await SyncService.syncPendingData();
      return {
        success: result.success,
        message: result.success
          ? `${result.syncedCount} records synced successfully`
          : result.error || 'Sync failed',
      };
    } catch (error) {
      console.error('Force sync error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get connectivity status
  static getConnectivityStatus(): boolean {
    return this.isOnline;
  }

  // Get sync statistics
  static async getSyncStats(): Promise<{
    isOnline: boolean;
    pendingCount: number;
    lastSyncTime: string | null;
    isSyncing: boolean;
  }> {
    try {
      const stats = await SyncService.getSyncStats();
      return {
        isOnline: this.isOnline,
        pendingCount: stats.pendingRecords,
        lastSyncTime: stats.lastSyncTime,
        isSyncing: SyncService.getIsSyncing(),
      };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return {
        isOnline: this.isOnline,
        pendingCount: 0,
        lastSyncTime: null,
        isSyncing: false,
      };
    }
  }

  // Cleanup
  static cleanup(): void {
    console.log('Cleaning up background sync service');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.connectivityListener) {
      this.connectivityListener();
      this.connectivityListener = null;
    }

    this.isInitialized = false;
  }
}

