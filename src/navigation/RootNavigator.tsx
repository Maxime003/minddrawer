import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import SubjectScreen from '../screens/SubjectScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Types
import { RootStackParamList, MainTabParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Subject" component={SubjectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

