import { AgricultureData } from '../types/agriculture';
import { StorageService } from './storage';
import { AuthService } from './auth';

const API_BASE_URL = 'https://example.com/api';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class SyncService {
  private static isSyncing = false;

  // Check if currently syncing
  static getIsSyncing(): boolean {
    return this.isSyncing;
  }

  // Sync all pending data
  static async syncPendingData(): Promise<{
    success: boolean;
    syncedCount: number;
    error?: string;
  }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, error: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      const pendingData = await StorageService.getPendingData();

      if (pendingData.length === 0) {
        this.isSyncing = false;
        return { success: true, syncedCount: 0 };
      }

      console.log(`Starting sync for ${pendingData.length} records`);

      const results = await Promise.allSettled(
        pendingData.map((data) => this.syncSingleRecord(data))
      );

      const successful = results.filter((result) => result.status === 'fulfilled');
      const failed = results.filter((result) => result.status === 'rejected');

      if (successful.length > 0) {
        const syncedIds = successful.map(
          (result) => (result as PromiseFulfilledResult<AgricultureData>).value.id
        );

        await StorageService.markAsSynced(syncedIds);
        await StorageService.updateSyncStatus(new Date().toISOString());
      }

      console.log(`Sync completed: ${successful.length} successful, ${failed.length} failed`);

      this.isSyncing = false;
      return {
        success: failed.length === 0,
        syncedCount: successful.length,
        error: failed.length > 0 ? `${failed.length} records failed to sync` : undefined,
      };
    } catch (error) {
      console.error('Sync error:', error);
      this.isSyncing = false;
      return {
        success: false,
        syncedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  // Sync a single record with retry mechanism
  private static async syncSingleRecord(data: AgricultureData): Promise<AgricultureData> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Syncing record ${data.id}, attempt ${attempt}`);

        // Get authentication token
        const token = await AuthService.getToken();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/sync`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            farmerName: data.farmerName,
            location: data.location,
            cropType: data.cropType,
            landSize: data.landSize,
            irrigationMethod: data.irrigationMethod,
            dateCollected: data.dateCollected,
            localId: data.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        await response.json();
        console.log(`Successfully synced record ${data.id}`);

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Sync attempt ${attempt} failed for record ${data.id}:`, lastError.message);

        if (attempt < MAX_RETRY_ATTEMPTS) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
        }
      }
    }

    throw lastError || new Error('Max retry attempts reached');
  }

  // Test API connectivity
  static async testConnectivity(): Promise<boolean> {
    try {
      // Get authentication token
      const token = await AuthService.getToken();

      const headers: Record<string, string> = {};

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers,
        timeout: 5000, // 5 second timeout
      });

      return response.ok;
    } catch (error) {
      console.log('Connectivity test failed:', error);
      return false;
    }
  }

  // Get sync statistics
  static async getSyncStats(): Promise<{
    totalRecords: number;
    syncedRecords: number;
    pendingRecords: number;
    lastSyncTime: string | null;
  }> {
    try {
      const allData = await StorageService.getAllData();
      const pendingData = await StorageService.getPendingData();
      const syncStatus = await StorageService.getSyncStatus();

      return {
        totalRecords: allData.length,
        syncedRecords: allData.length - pendingData.length,
        pendingRecords: pendingData.length,
        lastSyncTime: syncStatus.lastSyncTime,
      };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return {
        totalRecords: 0,
        syncedRecords: 0,
        pendingRecords: 0,
        lastSyncTime: null,
      };
    }
  }
}
