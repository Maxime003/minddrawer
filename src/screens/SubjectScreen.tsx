import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp, NativeStackNavigationProp } from '@react-navigation/native';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import MindMapCanvas from '../components/MindMapCanvas';
import { theme } from '../theme/theme';

type SubjectScreenRouteProp = RouteProp<RootStackParamList, 'Subject'>;
type SubjectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SubjectScreen = () => {
  const route = useRoute<SubjectScreenRouteProp>();
  const navigation = useNavigation<SubjectScreenNavigationProp>();
  const { subjects, updateNextReview, deleteSubject } = useSubjectStore();
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

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce sujet ?',
      'Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubject(subject.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le sujet.');
            }
          },
        },
      ]
    );
  };

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateNextReview(subject.id, difficulty);
    Alert.alert('Révision enregistrée', 'Votre évaluation a été sauvegardée.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>{subject.title}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Zone Mind Map - Plein écran */}
      <View style={styles.mindMapContainer}>
        {subject.mindMap && subject.mindMap.text ? (
          <MindMapCanvas rootNode={subject.mindMap} />
        ) : (
          <View style={styles.emptyMindMapContainer}>
            <Text style={styles.emptyMindMapText}>Génération en cours...</Text>
          </View>
        )}
      </View>

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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  mindMapContainer: {
    flex: 1, // Prend tout l'espace disponible
  },
  emptyMindMapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyMindMapText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceHighlight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  reviewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonEasy: {
    backgroundColor: theme.colors.success,
  },
  reviewButtonMedium: {
    backgroundColor: theme.colors.warning,
  },
  reviewButtonHard: {
    backgroundColor: theme.colors.error,
  },
  reviewButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    textAlign: 'center',
  },
  deleteButton: {
    padding: theme.spacing.s,
  },
  deleteButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
});

export default SubjectScreen;

