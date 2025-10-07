import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetOption {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: BottomSheetOption[];
  onOptionPress: (option: BottomSheetOption) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  onOptionPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(bottomSheetAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bottomSheetAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, bottomSheetAnim]);

  const handleOptionPress = (option: BottomSheetOption) => {
    onOptionPress(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Animated.View
        className="flex-1 justify-end"
        style={{
          backgroundColor: bottomSheetAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'],
          }),
        }}>
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />
        <Animated.View
          style={{
            transform: [
              {
                translateY: bottomSheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_HEIGHT * 0.1, 0],
                }),
              },
            ],
            height: SCREEN_HEIGHT * 0.8,
            paddingBottom: insets.bottom,
          }}
          className="rounded-t-3xl bg-white">
          {/* Handle */}
          <View className="items-center py-3">
            <View className="h-1 w-12 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4">
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="space-y-3">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleOptionPress(option)}
                  className="mt-4 flex-row items-center rounded-xl bg-gray-50 p-4"
                  style={{
                    backgroundColor: `${option.color}10`,
                    borderLeftWidth: 4,
                    borderLeftColor: option.color,
                  }}>
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: option.color }}>
                    <Ionicons name={option.icon as any} size={24} color="white" />
                  </View>
                  <Text className="flex-1 text-base font-semibold text-gray-900">
                    {option.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
