import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BrandingContext } from '../context/BrandingContext';
import { ApiContext } from '../../App';

// Simple date formatter (replacing moment.js)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

export default function AttendanceScreen({ navigation }) {
  const { branding, tenantId } = useContext(BrandingContext);
  const apiUrl = useContext(ApiContext);

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const studentId = await SecureStore.getItemAsync('studentId');

      const response = await axios.get(
        `${apiUrl}/api/students/${studentId}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: branding?.primaryColor }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>📋 Attendance</Text>

        {loading ? (
          <ActivityIndicator size="large" color={branding?.primaryColor} />
        ) : (
          <>
            {/* Attendance Summary */}
            <View style={[styles.card, { borderTopColor: branding?.primaryColor }]}>
              <Text style={styles.cardTitle}>Overall Attendance</Text>
              <Text style={styles.percentage}>
                {attendance?.percentage || '--'}%
              </Text>
              <Text style={styles.summary}>
                Present: {attendance?.present || 0} | Absent: {attendance?.absent || 0} | Leave: {attendance?.leave || 0}
              </Text>
            </View>

            {/* Attendance Details */}
            {attendance?.records && attendance.records.length > 0 && (
              <View style={styles.recordsContainer}>
                <Text style={styles.sectionTitle}>Recent Records</Text>
                {attendance.records.slice(0, 15).map((record, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.recordCard,
                      {
                        backgroundColor:
                          record.status === 'present'
                            ? '#dcfce7'
                            : record.status === 'absent'
                            ? '#fee2e2'
                            : '#fef3c7',
                      },
                    ]}
                  >
                    <Text style={styles.recordDate}>{record.date}</Text>
                    <Text
                      style={[
                        styles.recordStatus,
                        {
                          color:
                            record.status === 'present'
                              ? '#15803d'
                              : record.status === 'absent'
                              ? '#dc2626'
                              : '#b45309',
                        },
                      ]}
                    >
                      {record.status?.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopWidth: 4,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  percentage: {
    fontSize: 40,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summary: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  recordsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  recordStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
});
