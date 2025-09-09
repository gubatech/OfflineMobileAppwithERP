import React from 'react';
import { Text } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Statistics':
        return '📊';
      case 'Profile':
        return '👤';
      case 'Settings':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return <Text style={{ fontSize: focused ? 24 : 20, color }}>{getIcon()}</Text>;
};
