import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';

type LibraryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const { subjects, createSubject, resetForReview } = useSubjectStore();

  const handleCreateTestSubject = () => {
    createSubject({
      title: `Sujet de test ${subjects.length + 1}`,
      context: 'course',
      rawNotes: 'Notes de test pour vérifier le fonctionnement de la création de sujets.',
    });
  };

  const handleSubjectPress = (subjectId: string) => {
    navigation.navigate('Subject', { id: subjectId });
  };

  const handleResetForReview = (subjectId: string) => {
    resetForReview(subjectId);
    Alert.alert('Sujet prêt pour révision !', 'Le sujet apparaîtra maintenant dans l\'onglet "Aujourd\'hui".');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateTestSubject}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {subjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun sujet pour le moment</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={handleCreateTestSubject}
          >
            <Text style={styles.emptyAddButtonText}>Créer un sujet de test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subjectItem}
              onPress={() => handleSubjectPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.titleRow}>
                <Text style={styles.subjectTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => handleResetForReview(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.testButtonText}>♻️ Test</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subjectDate}>
                Prochaine révision: {new Date(item.nextReviewAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  subjectItem: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  testButton: {
    backgroundColor: '#ffd93d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  subjectDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LibraryScreen;

