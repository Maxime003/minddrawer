import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/AuthProvider';
import { SubjectProvider } from './src/store/subjectStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SubjectProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </SubjectProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

