import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, scaleAnim]);

  const getIconName = () => {
    switch (name) {
      case 'Home':
        return 'home';
      case 'Records':
        return 'file-text-o';
      case 'Statistics':
        return 'bar-chart';
      case 'Profile':
        return 'user';
      case 'Settings':
        return 'cog';
      default:
        return 'home';
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {focused ? (
        <View
          style={{
            backgroundColor: color,
            borderRadius: 8,
            padding: 8,
            shadowColor: color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}>
          <FontAwesome name={getIconName() as any} size={20} color="white" />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: 'transparent',
            borderRadius: 8,
            padding: 8,
          }}>
          <FontAwesome name={getIconName() as any} size={20} color={color} />
        </View>
      )}
    </Animated.View>
  );
};
