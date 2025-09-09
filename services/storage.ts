import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgricultureData } from '../types/agriculture';

const STORAGE_KEY = 'agriculture_data';
const SYNC_STATUS_KEY = 'sync_status';

export class StorageService {
  // Save agriculture data
  static async saveData(
    data: Omit<AgricultureData, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>
  ): Promise<AgricultureData> {
    try {
      const newData: AgricultureData = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSynced: false,
      };

      const existingData = await this.getAllData();
      const updatedData = [...existingData, newData];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return newData;
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  // Get all agriculture data
  static async getAllData(): Promise<AgricultureData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting data:', error);
      return [];
    }
  }

  // Get pending data (not synced)
  static async getPendingData(): Promise<AgricultureData[]> {
    try {
      const allData = await this.getAllData();
      return allData.filter((item) => !item.isSynced);
    } catch (error) {
      console.error('Error getting pending data:', error);
      return [];
    }
  }

  // Mark data as synced
  static async markAsSynced(ids: string[]): Promise<void> {
    try {
      const allData = await this.getAllData();
      const updatedData = allData.map((item) =>
        ids.includes(item.id)
          ? { ...item, isSynced: true, updatedAt: new Date().toISOString() }
          : item
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error marking data as synced:', error);
      throw error;
    }
  }

  // Update existing data
  static async updateData(id: string, updates: Partial<AgricultureData>): Promise<void> {
    try {
      const allData = await this.getAllData();
      const updatedData = allData.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  // Delete data
  static async deleteData(id: string): Promise<void> {
    try {
      const allData = await this.getAllData();
      const filteredData = allData.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  // Get sync status
  static async getSyncStatus(): Promise<{ lastSyncTime: string | null; pendingCount: number }> {
    try {
      const statusData = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      const pendingData = await this.getPendingData();

      return {
        lastSyncTime: statusData ? JSON.parse(statusData).lastSyncTime : null,
        pendingCount: pendingData.length,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { lastSyncTime: null, pendingCount: 0 };
    }
  }

  // Update sync status
  static async updateSyncStatus(lastSyncTime: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({ lastSyncTime }));
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  }

  // Clear all data (for testing purposes)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(SYNC_STATUS_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

