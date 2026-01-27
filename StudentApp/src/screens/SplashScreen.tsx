import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Brief delay for splash effect
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚</Text>
      <Text style={styles.appName}>Student App</Text>
      <Text style={styles.subtitle}>Your personal portal</Text>
      <ActivityIndicator color="#2563eb" size="large" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
