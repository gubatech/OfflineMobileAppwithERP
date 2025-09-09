export type CropType = 
  | 'Wheat'
  | 'Rice'
  | 'Corn'
  | 'Soybean'
  | 'Cotton'
  | 'Tomato'
  | 'Potato'
  | 'Onion'
  | 'Carrot'
  | 'Lettuce'
  | 'Other';

export type IrrigationMethod = 
  | 'Drip Irrigation'
  | 'Sprinkler Irrigation'
  | 'Flood Irrigation'
  | 'Manual Watering'
  | 'Rain-fed'
  | 'Other';

export interface AgricultureData {
  id: string;
  farmerName: string;
  location: string;
  cropType: CropType;
  landSize: number;
  irrigationMethod: IrrigationMethod;
  dateCollected: string;
  imageUri?: string;
  isSynced: boolean;
}
