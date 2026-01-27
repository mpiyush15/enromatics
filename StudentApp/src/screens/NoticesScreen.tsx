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

export default function NoticesScreen({ navigation }) {
  const { branding, tenantId } = useContext(BrandingContext);
  const apiUrl = useContext(ApiContext);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      const response = await axios.get(
        `${apiUrl}/api/notices?tenantId=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      setNotices(response.data.notices || []);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
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
        <Text style={styles.title}>📢 Notices</Text>

        {loading ? (
          <ActivityIndicator size="large" color={branding?.primaryColor} />
        ) : notices.length > 0 ? (
          notices.map((notice, idx) => (
            <View
              key={idx}
              style={[
                styles.noticeCard,
                {
                  borderLeftColor: branding?.accentColor,
                },
              ]}
            >
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDate}>
                  📅 {new Date(notice.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.noticeBody}>{notice.content}</Text>
              {notice.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>⚠️ Important</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No notices yet</Text>
          </View>
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
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
  },
  noticeHeader: {
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 12,
    color: '#999',
  },
  noticeBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priorityBadge: {
    marginTop: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
