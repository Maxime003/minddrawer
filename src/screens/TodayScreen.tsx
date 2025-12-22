import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSubjectStore } from '../store/subjectStore';

const TodayScreen = () => {
  const { subjects, createSubject, updateNextReview } = useSubjectStore();

  useEffect(() => {
    if (subjects.length === 0) {
      createSubject({
        title: 'Mon premier sujet',
        context: 'Apprendre React Native',
        rawNotes: 'Ceci est une note de test.',
      });
    }
  }, [subjects.length, createSubject]);

  const subjectsDueToday = useMemo(() => {
    const now = new Date();
    return subjects.filter((subject) => {
      const reviewDate = new Date(subject.nextReviewAt);
      return reviewDate <= now;
    });
  }, [subjects]);

  const handleDifficultyPress = (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    updateNextReview(subjectId, difficulty);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      
      {subjectsDueToday.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Rien à réviser aujourd'hui</Text>
        </View>
      ) : (
        <FlatList
          data={subjectsDueToday}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.subjectCard}>
              <Text style={styles.subjectTitle}>{item.title}</Text>
              <Text style={styles.subjectDate}>
                Due: {new Date(item.nextReviewAt).toLocaleDateString()}
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonHard]}
                  onPress={() => handleDifficultyPress(item.id, 'hard')}
                >
                  <Text style={styles.buttonText}>Hard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.buttonMedium]}
                  onPress={() => handleDifficultyPress(item.id, 'medium')}
                >
                  <Text style={styles.buttonText}>Medium</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.buttonEasy]}
                  onPress={() => handleDifficultyPress(item.id, 'easy')}
                >
                  <Text style={styles.buttonText}>Easy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subjectCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  subjectDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonHard: {
    backgroundColor: '#ff6b6b',
  },
  buttonMedium: {
    backgroundColor: '#ffd93d',
  },
  buttonEasy: {
    backgroundColor: '#6bcf7f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default TodayScreen;

