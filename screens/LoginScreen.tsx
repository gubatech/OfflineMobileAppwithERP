import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
// SafeAreaView removed
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { ConnectivityStatus } from '../components/ConnectivityStatus';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface LoginScreenProps {
  navigation?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.identifier.trim()) {
      Alert.alert('Validation Error', 'Please enter your identifier');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.identifier, formData.password);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Login Successful! 🎉',
          text2: 'Welcome to Agriculture Data Collection',
          position: 'top',
          visibilityTime: 3000,
        });
        // Navigation will be handled automatically by the AuthContext
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: result.error || 'Invalid credentials',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="flex-1 bg-white">
      <ConnectivityStatus />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Background Gradient */}
        <LinearGradient
          colors={['#00963f', '#00b84d']}
          className="absolute left-0 right-0 top-0 h-1/3"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-8 py-8">
            {/* Header */}
            <View className="mb-8 items-center">
              <View className="mb-4 rounded-2xl bg-white/20 p-5">
                <Ionicons name="leaf" size={48} color="white" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-white">Agriculture Data</Text>
              <Text className="text-lg text-white/90">Collection App</Text>
            </View>

            {/* Login Form Card */}
            <View className="mb-6 rounded-2xl bg-white p-6 shadow-2xl shadow-black/30">
              <Text className="mb-2 text-center text-2xl font-bold text-gray-800">
                Welcome Back
              </Text>
              <Text className="mb-6 text-center text-gray-500">Sign in to continue your work</Text>

              {/* Username Input */}
              <View className="mb-5">
                <Text className="mb-2 ml-1 text-sm font-medium text-gray-700">Username</Text>
                <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <Ionicons name="person" size={20} color="#6b7280" className="mr-3" />
                  <TextInput
                    className="flex-1 text-base text-gray-800"
                    placeholder="Enter your username"
                    placeholderTextColor="#9ca3af"
                    value={formData.identifier}
                    onChangeText={(value) => handleInputChange('identifier', value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="mb-2 ml-1 text-sm font-medium text-gray-700">Password</Text>
                <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <Ionicons name="lock-closed" size={20} color="#6b7280" className="mr-3" />
                  <TextInput
                    className="flex-1 text-base text-gray-800"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`rounded-xl py-4 shadow-lg ${isLoading ? 'bg-gray-400' : 'bg-[#00963f]'}`}>
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 text-center text-lg font-semibold text-white">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Demo Credentials */}
            <View className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="information-circle" size={18} color="#1d4ed8" className="mr-2" />
                <Text className="text-sm font-medium text-blue-800">Demo Mode</Text>
              </View>
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <Ionicons name="person" size={14} color="#3b82f6" className="mr-2" />
                  <Text className="text-xs text-blue-600">Username: Any username</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="key" size={14} color="#3b82f6" className="mr-2" />
                  <Text className="text-xs text-blue-600">Password: Any password</Text>
                </View>
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="information-circle" size={12} color="#f59e0b" className="mr-1" />
                  <Text className="text-xs text-orange-600">Demo mode - API disabled</Text>
                </View>
              </View>
            </View>

            {/* App Features */}
            <View className="rounded-xl border border-gray-100 bg-white p-4">
              <View className="mb-3 flex-row justify-between">
                <View className="flex-1 items-center">
                  <View className="mb-1 rounded-lg bg-green-100 p-2">
                    <Ionicons name="cloud-upload" size={20} color="#00963f" />
                  </View>
                  <Text className="text-center text-xs text-gray-600">Auto-Sync</Text>
                </View>
                <View className="flex-1 items-center">
                  <View className="mb-1 rounded-lg bg-green-100 p-2">
                    <Ionicons name="wifi-off" size={20} color="#00963f" />
                  </View>
                  <Text className="text-center text-xs text-gray-600">Offline-First</Text>
                </View>
                <View className="flex-1 items-center">
                  <View className="mb-1 rounded-lg bg-green-100 p-2">
                    <Ionicons name="shield-checkmark" size={20} color="#00963f" />
                  </View>
                  <Text className="text-center text-xs text-gray-600">Secure</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <Text className="text-center text-xs text-gray-400">
                Agriculture Data Collection System
              </Text>
              <Text className="mt-1 text-center text-xs text-gray-400">Version 1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
