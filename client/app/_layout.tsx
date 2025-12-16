import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { PassportProvider } from '../context/PassportContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { preloadProvincesGeoJSON } from '../utils/geojsonLoader';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Preload provinces data khi app khởi động (tương tự ai-service load models)
  useEffect(() => {
    // Preload trong background, không block UI
    preloadProvincesGeoJSON();
  }, []);

  return (
    <AuthProvider>
      <PassportProvider>
        <ThemeProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="ai-food-mode" options={{ headerShown: false }} />
              <Stack.Screen name="ai-council" options={{ headerShown: false }} />
              <Stack.Screen name="culture-card" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </NavigationThemeProvider>
        </ThemeProvider>
      </PassportProvider>
    </AuthProvider>
  );
}
