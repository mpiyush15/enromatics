import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BrandingContext } from '../context/BrandingContext';
import { AuthContext } from '../context/AuthContext';
import { ApiContext } from '../../App';

export default function DashboardScreen({ navigation }) {
  const { branding, tenantId } = useContext(BrandingContext);
  const { user, logout } = useContext(AuthContext);
  const apiUrl = useContext(ApiContext);

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const studentId = await SecureStore.getItemAsync('studentId');

      if (!token || !studentId) return;

      const response = await axios.get(
        `${apiUrl}/api/students/${studentId}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
          timeout: 10000,
        }
      );

      setStudentData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!branding) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const dynamicStyles = {
    header: {
      backgroundColor: branding.primaryColor,
    },
    button: {
      backgroundColor: branding.accentColor,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Institute Branding */}
      <View style={[styles.header, dynamicStyles.header]}>
        {branding.logoUrl && (
          <Image
            source={{ uri: branding.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <Text style={styles.instituteName}>{branding.appName || 'Student Portal'}</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'Student'}</Text>
      </View>

      {/* Dashboard Content */}
      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: branding.primaryColor }]}>
            <Text style={styles.statLabel}>Attendance</Text>
            <Text style={styles.statValue}>
              {studentData?.attendance?.percentage || '--'}%
            </Text>
            <Text style={styles.statSubtext}>
              {studentData?.attendance?.present || 0}/{studentData?.attendance?.total || 0} days
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: branding.accentColor }]}>
            <Text style={styles.statLabel}>Average Marks</Text>
            <Text style={styles.statValue}>
              {studentData?.marks?.average || '--'}/100
            </Text>
            <Text style={styles.statSubtext}>
              {studentData?.marks?.subjects || 0} subjects
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.button]}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.buttonIcon}>📋</Text>
            <Text style={styles.buttonText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.button]}
            onPress={() => navigation.navigate('Marks')}
          >
            <Text style={styles.buttonIcon}>📊</Text>
            <Text style={styles.buttonText}>Marks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.button]}
            onPress={() => navigation.navigate('Notices')}
          >
            <Text style={styles.buttonIcon}>📢</Text>
            <Text style={styles.buttonText}>Notices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.button]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Notices */}
        {studentData?.recentNotices && studentData.recentNotices.length > 0 && (
          <View style={styles.noticesSection}>
            <Text style={styles.sectionTitle}>Latest Notices</Text>
            {studentData.recentNotices.slice(0, 3).map((notice, idx) => (
              <View key={idx} style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDate}>{notice.date}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 8,
  },
  instituteName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#999',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  noticesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 11,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
});
