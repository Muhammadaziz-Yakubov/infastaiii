import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import DashboardScreen from '../screens/main/DashboardScreen';
import NewTasksScreen from '../screens/main/NewTasksScreen';
import NewGoalsScreen from '../screens/main/NewGoalsScreen';
import NewFinanceScreen from '../screens/main/NewFinanceScreen';
import MoreScreen from '../screens/main/MoreScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'checkbox' : 'checkbox-outline';
              break;
            case 'Finance':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Goals':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Asosiy' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={NewTasksScreen}
        options={{ tabBarLabel: 'Vazifalar' }}
      />
      <Tab.Screen 
        name="Finance" 
        component={NewFinanceScreen}
        options={{ tabBarLabel: 'Moliya' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={NewGoalsScreen}
        options={{ tabBarLabel: 'Maqsadlar' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{ tabBarLabel: "Ko'proq" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 16,
    right: 16,
    height: 65,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 6,
    paddingTop: 6,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
  },
  activeIconContainer: {
    backgroundColor: '#EFF6FF',
  },
});

export default MainNavigator;
