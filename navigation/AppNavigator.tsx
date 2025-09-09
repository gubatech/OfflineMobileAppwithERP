import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { DataCollectionScreen } from '../screens/DataCollectionScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../contexts/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  DataCollection: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#10b981',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {isAuthenticated ? (
          // Authenticated screens
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{
                headerShown: false, // Hide header for tab navigator
              }}
            />
            <Stack.Screen
              name="DataCollection"
              component={DataCollectionScreen}
              options={{
                title: 'Collect Data',
              }}
            />
          </>
        ) : (
          // Unauthenticated screens
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false, // Hide header for login screen
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export { AppNavigator };
