import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BrandingProvider } from './src/context/BrandingContext';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import MarksScreen from './src/screens/MarksScreen';
import NoticesScreen from './src/screens/NoticesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createNativeStackNavigator();

export const ApiContext = React.createContext();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Splash');
  const [apiUrl, setApiUrl] = useState('http://localhost:5050');

  useEffect(() => {
    // Set your actual backend URL here
    // For production: use your actual backend domain
    // For local testing: use http://192.168.x.x:5050
    const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.3:5050';
    setApiUrl(backendUrl);

    // Check if user already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const tenantId = await SecureStore.getItemAsync('tenantId');
      
      if (token && tenantId) {
        setInitialRoute('Dashboard');
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setInitialRoute('Login');
    }
  };

  return (
    <ApiContext.Provider value={apiUrl}>
      <BrandingProvider>
        <AuthProvider apiUrl={apiUrl}>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animationEnabled: true,
              }}
              initialRouteName={initialRoute}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Attendance" component={AttendanceScreen} />
              <Stack.Screen name="Marks" component={MarksScreen} />
              <Stack.Screen name="Notices" component={NoticesScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </BrandingProvider>
    </ApiContext.Provider>
  );
}
