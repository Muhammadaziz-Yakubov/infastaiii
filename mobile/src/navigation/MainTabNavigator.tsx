import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { 
  Home, 
  CheckSquare, 
  Target, 
  DollarSign, 
  Trophy, 
  User 
} from 'lucide-react-native';

// Import screens
import DashboardScreen from '@/screens/main/DashboardScreen';
import TasksScreen from '@/screens/main/TasksScreen';
import GoalsScreen from '@/screens/main/GoalsScreen';
import FinanceScreen from '@/screens/main/FinanceScreen';
import ChallengesScreen from '@/screens/main/ChallengesScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

// Stack navigators for each tab
const DashboardStack = createNativeStackNavigator();
const TasksStack = createNativeStackNavigator();
const GoalsStack = createNativeStackNavigator();
const FinanceStack = createNativeStackNavigator();
const ChallengesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Tab Navigator
const Tab = createBottomTabNavigator();

// Stack Screen Components
const DashboardStackScreen = () => (
  <DashboardStack.Navigator>
    <DashboardStack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
  </DashboardStack.Navigator>
);

const TasksStackScreen = () => (
  <TasksStack.Navigator>
    <TasksStack.Screen 
      name="TasksMain" 
      component={TasksScreen}
      options={{ headerShown: false }}
    />
  </TasksStack.Navigator>
);

const GoalsStackScreen = () => (
  <GoalsStack.Navigator>
    <GoalsStack.Screen 
      name="GoalsMain" 
      component={GoalsScreen}
      options={{ headerShown: false }}
    />
  </GoalsStack.Navigator>
);

const FinanceStackScreen = () => (
  <FinanceStack.Navigator>
    <FinanceStack.Screen 
      name="FinanceMain" 
      component={FinanceScreen}
      options={{ headerShown: false }}
    />
  </FinanceStack.Navigator>
);

const ChallengesStackScreen = () => (
  <ChallengesStack.Navigator>
    <ChallengesStack.Screen 
      name="ChallengesMain" 
      component={ChallengesScreen}
      options={{ headerShown: false }}
    />
  </ChallengesStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            switch (route.name) {
              case 'Dashboard':
                iconName = <Home size={size} color={color} />;
                break;
              case 'Tasks':
                iconName = <CheckSquare size={size} color={color} />;
                break;
              case 'Goals':
                iconName = <Target size={size} color={color} />;
                break;
              case 'Finance':
                iconName = <DollarSign size={size} color={color} />;
                break;
              case 'Challenges':
                iconName = <Trophy size={size} color={color} />;
                break;
              case 'Profile':
                iconName = <User size={size} color={color} />;
                break;
              default:
                iconName = <Home size={size} color={color} />;
            }

            return iconName;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStackScreen}
          options={{ title: 'Asosiy' }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TasksStackScreen}
          options={{ title: 'Vazifalar' }}
        />
        <Tab.Screen 
          name="Goals" 
          component={GoalsStackScreen}
          options={{ title: 'Maqsadlar' }}
        />
        <Tab.Screen 
          name="Finance" 
          component={FinanceStackScreen}
          options={{ title: 'Moliya' }}
        />
        <Tab.Screen 
          name="Challenges" 
          component={ChallengesStackScreen}
          options={{ title: 'Challengelar' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStackScreen}
          options={{ title: 'Profil' }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainTabNavigator;
