import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSubjectStore } from '../store/subjectStore';

const LibraryScreen = () => {
  const { subjects } = useSubjectStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>
      
      {subjects.length === 0 ? (
        <Text style={styles.emptyText}>No subjects yet</Text>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.subjectItem}>
              <Text style={styles.subjectTitle}>{item.title}</Text>
              <Text style={styles.subjectDate}>
                Next review: {item.nextReviewAt.toLocaleDateString()}
              </Text>
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
  },
  subjectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  subjectDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});

export default LibraryScreen;

