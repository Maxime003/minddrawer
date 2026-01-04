import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import SubjectScreen from '../screens/SubjectScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateSubjectScreen from '../screens/CreateSubjectScreen';

// Auth
import { useAuth } from '../store/AuthProvider';

// Theme
import { theme } from '../theme/theme';

// Types
import { RootStackParamList, MainTabParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 10,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  // État de chargement : affiche un spinner pendant que Supabase vérifie la session
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Routes protégées : accessibles uniquement si l'utilisateur est connecté
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="Subject" component={SubjectScreen} />
            <Stack.Screen 
              name="CreateSubject" 
              component={CreateSubjectScreen}
              options={{ 
                title: 'Nouvelle connaissance',
                presentation: 'modal',
              }} 
            />
          </>
        ) : (
          // Route publique : LoginScreen uniquement si l'utilisateur n'est pas connecté
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default RootNavigator;

