import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { SubjectProvider } from './src/store/subjectStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <SubjectProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SubjectProvider>
    </SafeAreaProvider>
  );
}

