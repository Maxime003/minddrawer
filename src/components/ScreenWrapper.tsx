import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  style,
  withPadding = false 
}) => {
  return (
    <LinearGradient
      // Dégradé subtil : Noir profond vers gris très foncé (haut gauche -> bas droite)
      colors={['#09090B', '#18181B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView 
        style={[
          styles.safeArea, 
          withPadding && styles.padding,
          style
        ]}
      >
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: theme.spacing.m,
  }
});