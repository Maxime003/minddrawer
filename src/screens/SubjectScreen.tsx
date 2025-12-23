import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import MindMapNodeView from '../components/MindMapNodeView';

type SubjectScreenRouteProp = RouteProp<RootStackParamList, 'Subject'>;

const SubjectScreen = () => {
  const route = useRoute<SubjectScreenRouteProp>();
  const navigation = useNavigation();
  const { subjects, updateNextReview } = useSubjectStore();
  const insets = useSafeAreaInsets();

  const subjectId = route.params?.id;
  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  if (!subject) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sujet non trouvé</Text>
      </View>
    );
  }

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateNextReview(subject.id, difficulty);
    Alert.alert('Révision enregistrée', 'Votre évaluation a été sauvegardée.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // Calcul de la hauteur approximative de la zone de révision pour le padding du ScrollView
  const reviewSectionHeight = 120; // Hauteur approximative de la zone de révision

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: reviewSectionHeight + insets.bottom + 20 }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{subject.title}</Text>
        </View>

        {/* Zone Mind Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mind Map</Text>
          <View style={styles.mindMapContainer}>
            {subject.mindMap && subject.mindMap.text ? (
              <MindMapNodeView node={subject.mindMap} level={0} />
            ) : (
              <View style={styles.emptyMindMapContainer}>
                <Text style={styles.emptyMindMapText}>Génération en cours...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Zone Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{subject.rawNotes}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Zone Révision */}
      <View style={[styles.reviewContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Text style={styles.reviewTitle}>Évaluer la révision</Text>
        <View style={styles.reviewButtons}>
          <TouchableOpacity
            style={[styles.reviewButton, styles.reviewButtonEasy]}
            onPress={() => handleReview('easy')}
          >
            <Text style={styles.reviewButtonText}>Facile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewButton, styles.reviewButtonMedium]}
            onPress={() => handleReview('medium')}
          >
            <Text style={styles.reviewButtonText}>Moyen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewButton, styles.reviewButtonHard]}
            onPress={() => handleReview('hard')}
          >
            <Text style={styles.reviewButtonText}>Difficile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  mindMapContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyMindMapContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMindMapText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  notesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  reviewContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonEasy: {
    backgroundColor: '#6bcf7f',
  },
  reviewButtonMedium: {
    backgroundColor: '#ffd93d',
  },
  reviewButtonHard: {
    backgroundColor: '#ff6b6b',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});

export default SubjectScreen;

