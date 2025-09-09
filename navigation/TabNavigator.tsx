import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTabScreen } from '../screens/tabs/HomeTabScreen';
import { StatisticsTabScreen } from '../screens/tabs/StatisticsTabScreen';
import { ProfileTabScreen } from '../screens/tabs/ProfileTabScreen';
import { SettingsTabScreen } from '../screens/tabs/SettingsTabScreen';
import { TabIcon } from '../components/TabIcon';

export type TabParamList = {
  Home: undefined;
  Statistics: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeTabScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsTabScreen}
        options={{
          title: 'Statistics',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTabScreen}
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
