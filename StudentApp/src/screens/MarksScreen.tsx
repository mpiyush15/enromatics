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

export default function MarksScreen({ navigation }) {
  const { branding, tenantId } = useContext(BrandingContext);
  const apiUrl = useContext(ApiContext);

  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const studentId = await SecureStore.getItemAsync('studentId');

      const response = await axios.get(
        `${apiUrl}/api/students/${studentId}/marks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      setMarks(response.data);
    } catch (error) {
      console.error('Failed to fetch marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#ef4444';
    return '#6b7280';
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
        <Text style={styles.title}>📊 Marks</Text>

        {loading ? (
          <ActivityIndicator size="large" color={branding?.primaryColor} />
        ) : (
          <>
            {/* Overall GPA */}
            <View style={[styles.card, { borderTopColor: branding?.primaryColor }]}>
              <Text style={styles.cardTitle}>Overall Average</Text>
              <Text style={styles.average}>
                {marks?.average || '--'}/100
              </Text>
              <Text style={styles.gradeText}>
                Grade: <Text style={styles.gradeBold}>{marks?.grade || 'N/A'}</Text>
              </Text>
            </View>

            {/* Subjects */}
            {marks?.subjects && marks.subjects.length > 0 && (
              <View style={styles.subjectsContainer}>
                <Text style={styles.sectionTitle}>Subject-wise Marks</Text>
                {marks.subjects.map((subject, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.subjectCard,
                      {
                        borderLeftColor: getGradeColor(subject.totalMarks || 0),
                      },
                    ]}
                  >
                    <View style={styles.subjectHeader}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text
                        style={[
                          styles.marksDisplay,
                          {
                            color: getGradeColor(subject.totalMarks || 0),
                          },
                        ]}
                      >
                        {subject.totalMarks || '--'}/100
                      </Text>
                    </View>
                    {subject.components && (
                      <View style={styles.componentsContainer}>
                        {subject.components.map((comp, cIdx) => (
                          <Text key={cIdx} style={styles.componentText}>
                            • {comp.name}: {comp.marks}/{comp.totalMarks}
                          </Text>
                        ))}
                      </View>
                    )}
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
  average: {
    fontSize: 40,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  gradeText: {
    fontSize: 14,
    color: '#666',
  },
  gradeBold: {
    fontWeight: '700',
    color: '#333',
  },
  subjectsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  marksDisplay: {
    fontSize: 16,
    fontWeight: '700',
  },
  componentsContainer: {
    marginTop: 8,
  },
  componentText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
