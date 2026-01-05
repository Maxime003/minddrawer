import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
// 👇 1. Import indispensable pour le moteur de gestes
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/AuthProvider';
import { SubjectProvider } from './src/store/subjectStore';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SubjectProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </SubjectProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}