import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.accent, border: colors.border },
};

/**
 * Shows the auth screens when logged out and the app screens when logged in.
 * Because it reads `token` from Redux, logging in/out switches stacks automatically.
 */
export default function RootNavigator() {
  const { token, initializing } = useAppSelector(s => s.auth);

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerTitleStyle: { fontWeight: '700' } }}>
        {token ? (
          <>
            <Stack.Screen name="Tasks" component={TaskListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: '', presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
