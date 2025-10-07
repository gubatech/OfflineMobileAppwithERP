import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';

interface ERPModule {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  gradient: string[];
}

export const HomeTabScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScale = useRef(new Animated.Value(1)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showTaskBottomSheet, setShowTaskBottomSheet] = useState(false);
  const [showLeaveBottomSheet, setShowLeaveBottomSheet] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Animation refs for cards
  const cardAnimations = useRef<{
    [key: string]: {
      cardScale: Animated.Value;
      iconScale: Animated.Value;
      glowAnim: Animated.Value;
    };
  }>({}).current;

  // Animation refs for category chips
  const chipAnimations = useRef<{
    [key: string]: {
      chipScale: Animated.Value;
      chipGlow: Animated.Value;
    };
  }>({}).current;

  // Background animation refs
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const backgroundRotate = useRef(new Animated.Value(0)).current;

  const categories = ['All', 'HR', 'Finance', 'Operations', 'Sales', 'Support'];

  const taskOptions = [
    { id: 'create-task', title: 'Create Tasks', icon: 'add-circle', color: '#10b981' },
    { id: 'create-quick-task', title: 'Create Quick Tasks', icon: 'flash', color: '#f59e0b' },
    { id: 'get-tasks', title: 'Get Tasks', icon: 'list', color: '#3b82f6' },
    { id: 'update-tasks', title: 'Update Tasks', icon: 'create', color: '#8b5cf6' },
    { id: 'update-progress', title: 'Update Task Progress', icon: 'trending-up', color: '#06b6d4' },
    {
      id: 'update-status',
      title: 'Update Task Status',
      icon: 'checkmark-circle',
      color: '#10b981',
    },
    { id: 'get-projects', title: 'Get Project List', icon: 'folder', color: '#f97316' },
    { id: 'get-status', title: 'Get Status List', icon: 'flag', color: '#ef4444' },
    { id: 'get-task-list', title: 'Get Task List', icon: 'grid', color: '#6366f1' },
    { id: 'get-task-by-id', title: 'Get Task by ID', icon: 'search', color: '#84cc16' },
    { id: 'get-dashboard', title: 'Get Task List Dashboard', icon: 'analytics', color: '#ec4899' },
  ];

  const leaveOptions = [
    { id: 'get-holiday-list', title: 'Get Holiday List', icon: 'calendar', color: '#10b981' },
    {
      id: 'make-leave-application',
      title: 'Make Leave Application',
      icon: 'add-circle',
      color: '#3b82f6',
    },
    { id: 'get-leave-type', title: 'Get Leave Type', icon: 'list', color: '#8b5cf6' },
    {
      id: 'get-leave-balance-dashboard',
      title: 'Get Leave Balance Dashboard',
      icon: 'analytics',
      color: '#f59e0b',
    },
    {
      id: 'get-leave-application-list',
      title: 'Get Leave Application List',
      icon: 'document-text',
      color: '#ef4444',
    },
  ];

  const erpModules: ERPModule[] = [
    {
      id: 'task',
      title: 'Task',
      icon: 'checkmark-circle',
      color: '#10b981',
      description: 'Manage and track tasks',
      category: 'Operations',
      gradient: ['#6ee7b7', '#34d399', '#10b981'],
    },
    {
      id: 'leave',
      title: 'Leave',
      icon: 'calendar',
      color: '#f59e0b',
      description: 'Manage leave requests',
      category: 'HR',
      gradient: ['#b45309', '#f59e0b', '#fde68a'],
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: 'time',
      color: '#3b82f6',
      description: 'Track employee attendance',
      category: 'HR',
      gradient: ['#1e40af', '#3b82f6', '#93c5fd'],
    },

    {
      id: 'expense',
      title: 'Expense',
      icon: 'card',
      color: '#8b5cf6',
      description: 'Track business expenses',
      category: 'Finance',
      gradient: ['#6d28d9', '#8b5cf6', '#c4b5fd'],
    },
    {
      id: 'salary',
      title: 'Salary',
      icon: 'cash',
      color: '#10b981',
      description: 'Manage salary payments',
      category: 'HR',
      gradient: ['#10b981', '#34d399', '#6ee7b7'],
    },
    {
      id: 'document',
      title: 'Document',
      icon: 'document-text',
      color: '#6366f1',
      description: 'Store and manage documents',
      category: 'Operations',
      gradient: ['#6366f1', '#818cf8', '#a5b4fc'],
    },
    {
      id: 'comment',
      title: 'Comment',
      icon: 'chatbubble',
      color: '#06b6d4',
      description: 'Add comments and notes',
      category: 'Operations',
      gradient: ['#06b6d4', '#22d3ee', '#67e8f9'],
    },
    {
      id: 'manager',
      title: 'Manager',
      icon: 'person',
      color: '#ec4899',
      description: 'Manage team members',
      category: 'HR',
      gradient: ['#be185d', '#ec4899', '#f9a8d4'],
    },
    {
      id: 'company',
      title: 'Company',
      icon: 'business',
      color: '#f97316',
      description: 'Company information',
      category: 'Operations',
      gradient: ['#f97316', '#fb923c', '#fdba74'],
    },
    {
      id: 'order',
      title: 'Order',
      icon: 'receipt',
      color: '#ef4444',
      description: 'Manage orders and sales',
      category: 'Sales',
      gradient: ['#ef4444', '#f87171', '#fca5a5'],
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: 'card',
      color: '#84cc16',
      description: 'Process payments',
      category: 'Finance',
      gradient: ['#84cc16', '#a3e635', '#bef264'],
    },
    {
      id: 'visit',
      title: 'Visit',
      icon: 'location',
      color: '#8b5cf6',
      description: 'Track site visits',
      category: 'Operations',
      gradient: ['#6d28d9', '#8b5cf6', '#c4b5fd'],
    },
    {
      id: 'petty-expenses',
      title: 'Petty Expenses',
      icon: 'wallet',
      color: '#f59e0b',
      description: 'Small expense tracking',
      category: 'Finance',
      gradient: ['#b45309', '#f59e0b', '#fde68a'],
    },
    {
      id: 'issue',
      title: 'Issue',
      icon: 'warning',
      color: '#ef4444',
      description: 'Report and track issues',
      category: 'Support',
      gradient: ['#b91c1c', '#ef4444', '#fca5a5'],
    },
  ];

  const filteredModules = erpModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper functions to get or create animations
  const getCardAnimations = (moduleId: string) => {
    if (!cardAnimations[moduleId]) {
      cardAnimations[moduleId] = {
        cardScale: new Animated.Value(1),
        iconScale: new Animated.Value(1),
        glowAnim: new Animated.Value(0),
      };
    }
    return cardAnimations[moduleId];
  };

  const getChipAnimations = (category: string) => {
    if (!chipAnimations[category]) {
      chipAnimations[category] = {
        chipScale: new Animated.Value(1),
        chipGlow: new Animated.Value(0),
      };
    }
    return chipAnimations[category];
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Start background animations
    const startBackgroundAnimations = () => {
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundScale, {
            toValue: 1.05,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle rotation animation
      Animated.loop(
        Animated.timing(backgroundRotate, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    };

    startBackgroundAnimations();
  }, [fadeAnim, slideAnim, headerScale, backgroundAnim, backgroundScale, backgroundRotate]);

  const handleModulePress = (module: ERPModule) => {
    if (module.id === 'task') {
      console.log('Opening Task bottom sheet...');
      setShowTaskBottomSheet(true);
    } else if (module.id === 'leave') {
      console.log('Opening Leave bottom sheet...');
      setShowLeaveBottomSheet(true);
    } else {
      console.log(`Opening ${module.title} module`);
    }
  };

  const handleTaskOptionPress = (option: any) => {
    console.log(`Selected task option: ${option.title}`);
    setShowTaskBottomSheet(false);
  };

  const handleLeaveOptionPress = (option: any) => {
    console.log(`Selected leave option: ${option.title}`);
    setShowLeaveBottomSheet(false);
  };

  const renderModule = (module: ERPModule, index: number) => {
    const { cardScale, iconScale, glowAnim } = getCardAnimations(module.id);

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 0.95,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1.1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Animated.View
        key={module.id}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 * (index % 2 === 0 ? 1 : 0.5)],
                extrapolate: 'clamp',
              }),
            },
            { scale: cardScale },
          ],
        }}>
        <TouchableOpacity
          onPress={() => handleModulePress(module)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="mb-6 rounded-3xl "
          activeOpacity={1}
          style={{
            shadowColor: module.color,
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 16,
          }}>
          {/* Enhanced Background Gradient */}
          <LinearGradient
            colors={[
              module.gradient[0],
              module.gradient[1],
              module.gradient[2],
              module.gradient[0],
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 rounded-3xl"
            style={{ opacity: 1, borderRadius: 20 }}
          />

          {/* Glow Effect */}
          <Animated.View
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 25,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
              backgroundColor: module.color,
              shadowColor: module.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 20,
            }}
          />

          <View className="p-6">
            {/* Header Row */}
            <View className="mb-4 flex-row items-center justify-between">
              <Animated.View
                style={{
                  transform: [{ scale: iconScale }],
                  backgroundColor: module.color + '15',
                  shadowColor: module.color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
                className="rounded-3xl p-4">
                <Ionicons name={module.icon as any} size={32} color="white" />
              </Animated.View>

              <View className="flex-row items-center text-white">
                <View
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: module.color + '12' }}>
                  <Text className="text-xs font-bold uppercase tracking-wide text-white">
                    {module.category}
                  </Text>
                </View>
                <View className="ml-3 rounded-full bg-gray-100 p-2">
                  <Ionicons name="chevron-forward" size={18} color={module.color} />
                </View>
              </View>
            </View>

            {/* Content */}
            <View className="mb-4">
              <Text className="mb-2 text-2xl font-bold text-white">{module.title}</Text>
              <Text className="text-base leading-6 text-white">{module.description}</Text>
            </View>

            {/* Enhanced Footer */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: module.color }}
                />
                <Text className="text-sm font-medium text-white">Tap to explore</Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="arrow-forward" size={16} color={module.color} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryChip = (category: string, index: number) => {
    const { chipScale, chipGlow } = getChipAnimations(category);

    const handleChipPressIn = () => {
      Animated.parallel([
        Animated.spring(chipScale, {
          toValue: 0.95,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(chipGlow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handleChipPressOut = () => {
      Animated.parallel([
        Animated.spring(chipScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(chipGlow, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const isSelected = selectedCategory === category;
    const chipColor = isSelected ? '#10b981' : '#6b7280';

    return (
      <Animated.View
        key={category}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 * index],
                extrapolate: 'clamp',
              }),
            },
            { scale: chipScale },
          ],
        }}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(category)}
          onPressIn={handleChipPressIn}
          onPressOut={handleChipPressOut}
          className={`mr-4 rounded-2xl px-6 py-4 ${isSelected ? 'bg-emerald-500' : 'bg-white'}`}
          style={{
            shadowColor: chipColor,
            shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
            shadowOpacity: isSelected ? 0.4 : 0.15,
            shadowRadius: isSelected ? 16 : 8,
            elevation: isSelected ? 12 : 4,
          }}>
          {/* Glow Effect */}
          <Animated.View
            style={{
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              borderRadius: 16,
              opacity: chipGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
              backgroundColor: chipColor,
              shadowColor: chipColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 12,
              elevation: 8,
            }}
          />

          <View className="flex-row items-center">
            <View
              className="mr-3 h-2 w-2 rounded-full"
              style={{ backgroundColor: isSelected ? 'white' : chipColor }}
            />
            <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              {category}
            </Text>
            {isSelected && (
              <View className="ml-2 rounded-full bg-white/20 p-1">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white"
      ref={scrollViewRef}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      {/* Enhanced Header with Animated Pattern Background */}
      <View className="overflow-hidden rounded-bl-3xl">
        <ImageBackground
          source={require('../../assets/patt.png')}
          resizeMode="cover"
          className="rounded-b-3xl"
          style={{
            paddingTop: insets.top + 16,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 1000,
          }}>
          {/* Animated Background Image Overlay */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [
                {
                  translateY: backgroundAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
                {
                  scale: backgroundScale,
                },
                {
                  rotate: backgroundRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '2deg'],
                  }),
                },
              ],
            }}>
            <ImageBackground
              source={require('../../assets/patt.png')}
              resizeMode="cover"
              className="absolute inset-0 rounded-b-3xl"
              style={{ opacity: 0.3 }}
            />
          </Animated.View>

          {/* Overlay Gradient */}
          <LinearGradient
            colors={['#047857', '#065f46', '#059669', '#10b981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 rounded-b-3xl"
            style={{ opacity: 0.85 }}
          />

          <Animated.View style={{ transform: [{ scale: headerScale }] }} className="mb-6">
            <View className="mb-4 flex-row items-center justify-between px-6">
              <View className="flex-1">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-3 rounded-2xl bg-white/20 p-2">
                    <Ionicons name="sunny" size={20} color="white" />
                  </View>
                  <Text className="text-lg font-medium text-white/90">Good morning!</Text>
                </View>
                <Text className="mb-1 text-3xl font-bold text-white">ERPNext</Text>
                <Text className="text-base text-white/80">Manage your business efficiently</Text>
              </View>

              <TouchableOpacity
                className="relative rounded-2xl bg-white/20 p-3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Ionicons name="notifications" size={24} color="white" />
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-900 bg-red-500">
                  <Text className="text-center text-xs font-bold text-white">3</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Enhanced Search Bar */}
            <View className="px-6">
              <Animated.View
                className={`mb-4 rounded-2xl bg-white p-4 ${
                  isSearchFocused ? 'shadow-lg' : 'shadow-sm'
                }`}
                style={{
                  shadowColor: isSearchFocused ? '#10b981' : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSearchFocused ? 0.2 : 0.1,
                  shadowRadius: isSearchFocused ? 16 : 8,
                  elevation: isSearchFocused ? 8 : 2,
                  transform: [{ scale: isSearchFocused ? 1.02 : 1 }],
                }}>
                <View className="flex-row items-center">
                  <Ionicons
                    name="search"
                    size={22}
                    color={isSearchFocused ? '#10b981' : '#9ca3af'}
                  />
                  <TextInput
                    placeholder="Search modules..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="ml-3 flex-1 text-base text-gray-800"
                    selectionColor="#10b981"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </View>

            {/* Enhanced Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2 pl-6"
              contentContainerStyle={{ paddingRight: 16 }}>
              {categories.map((category, index) => renderCategoryChip(category, index))}
            </ScrollView>
          </Animated.View>
        </ImageBackground>
      </View>

      {/* Modules Grid */}
      <ScrollView
        ref={scrollViewRef}
        className="-mt-8 mt-4 flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}>
        {filteredModules.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-xl font-semibold text-gray-400">No modules found</Text>
            <Text className="mt-2 text-center text-gray-400">
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          filteredModules.map((module, index) => renderModule(module, index))
        )}
      </ScrollView>

      {/* Task Bottom Sheet */}
      <BottomSheet
        visible={showTaskBottomSheet}
        onClose={() => setShowTaskBottomSheet(false)}
        title="Task Management"
        options={taskOptions}
        onOptionPress={handleTaskOptionPress}
      />

      {/* Leave Bottom Sheet */}
      <BottomSheet
        visible={showLeaveBottomSheet}
        onClose={() => setShowLeaveBottomSheet(false)}
        title="Leave Management"
        options={leaveOptions}
        onOptionPress={handleLeaveOptionPress}
      />
    </ScrollView>
  );
};
