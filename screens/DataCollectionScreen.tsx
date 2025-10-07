import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
// View removed
import { StorageService } from '../services/storage';
import { CropType, IrrigationMethod } from '../types/agriculture';
import { ConnectivityStatus } from '../components/ConnectivityStatus';

interface DataCollectionScreenProps {
  navigation: any;
}

export const DataCollectionScreen: React.FC<DataCollectionScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    farmerName: '',
    location: '',
    cropType: '',
    landSize: '',
    irrigationMethod: '',
    dateCollected: new Date().toISOString().split('T')[0], // Today's date
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const cropTypes: CropType[] = [
    'Wheat',
    'Rice',
    'Corn',
    'Soybean',
    'Cotton',
    'Tomato',
    'Potato',
    'Onion',
    'Carrot',
    'Lettuce',
    'Other',
  ];

  const irrigationMethods: IrrigationMethod[] = [
    'Drip Irrigation',
    'Sprinkler Irrigation',
    'Flood Irrigation',
    'Manual Watering',
    'Rain-fed',
    'Other',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.farmerName.trim()) {
      Alert.alert('Validation Error', 'Please enter farmer name');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter location');
      return false;
    }
    if (!formData.cropType) {
      Alert.alert('Validation Error', 'Please select crop type');
      return false;
    }
    if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
      Alert.alert('Validation Error', 'Please enter valid land size');
      return false;
    }
    if (!formData.irrigationMethod) {
      Alert.alert('Validation Error', 'Please select irrigation method');
      return false;
    }
    return true;
  };

  // Camera and Image Picker Functions
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Image', 'Choose how you want to add an image', [
      { text: 'Camera', onPress: takePicture },
      { text: 'Gallery', onPress: selectFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await StorageService.saveData({
        farmerName: formData.farmerName.trim(),
        location: formData.location.trim(),
        cropType: formData.cropType,
        landSize: parseFloat(formData.landSize),
        irrigationMethod: formData.irrigationMethod,
        dateCollected: formData.dateCollected,
        imageUri: imageUri || undefined,
      });

      Alert.alert('Success', 'Agricultural data saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              farmerName: '',
              location: '',
              cropType: '',
              landSize: '',
              irrigationMethod: '',
              dateCollected: new Date().toISOString().split('T')[0],
            });
            setImageUri(null);
            // Navigate to home tab
            navigation.navigate('MainTabs');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPicker = (title: string, field: string, options: string[], selectedValue: string) => (
    <View className="mb-4">
      <Text className="mb-2 text-base font-medium text-gray-700">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row space-x-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleInputChange(field, option)}
              className={`rounded-full border px-4 py-2 ${
                selectedValue === option
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white'
              }`}>
              <Text
                className={`text-sm ${selectedValue === option ? 'text-white' : 'text-gray-700'}`}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ConnectivityStatus />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1 px-4">
          <View className="py-6">
            <Text className="mb-2 text-2xl font-bold text-gray-800">Collect Agricultural Data</Text>
            <Text className="mb-6 text-gray-600">
              Enter the details below to collect agricultural information
            </Text>

            {/* Farmer Name */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-700">Farmer Name *</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800"
                placeholder="Enter farmer name"
                value={formData.farmerName}
                onChangeText={(value) => handleInputChange('farmerName', value)}
              />
            </View>

            {/* Location */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-700">Location *</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800"
                placeholder="Enter location (village, district, state)"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
              />
            </View>

            {/* Crop Type Picker */}
            {renderPicker('Crop Type *', 'cropType', cropTypes, formData.cropType)}

            {/* Land Size */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-700">Land Size (acres) *</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800"
                placeholder="Enter land size in acres"
                value={formData.landSize}
                onChangeText={(value) => handleInputChange('landSize', value)}
                keyboardType="numeric"
              />
            </View>

            {/* Irrigation Method Picker */}
            {renderPicker(
              'Irrigation Method *',
              'irrigationMethod',
              irrigationMethods,
              formData.irrigationMethod
            )}

            {/* Date Collected */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-700">Date Collected *</Text>
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800"
                value={formData.dateCollected}
                onChangeText={(value) => handleInputChange('dateCollected', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Image Section */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-medium text-gray-700">
                Field Image (Optional)
              </Text>

              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
                    <Text style={styles.removeImageText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={showImageOptions} style={styles.addImageButton}>
                  <Text style={styles.addImageText}>📷 Add Image</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`rounded-lg py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-green-500'}`}>
              <Text className="text-center text-lg font-semibold text-white">
                {isSubmitting ? 'Saving...' : 'Save Data'}
              </Text>
            </TouchableOpacity>

            {/* View Data Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              className="mt-3 rounded-lg bg-blue-500 py-4">
              <Text className="text-center text-lg font-semibold text-white">
                View Collected Data
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageText: {
    color: 'white',
    fontWeight: '500',
  },
  addImageButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addImageText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
