import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, NativeStackNavigationProp } from '@react-navigation/native';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import MindMapCanvas from '../components/MindMapCanvas';
import { theme } from '../theme/theme';
import { ScreenWrapper } from '../components/ScreenWrapper'; // <-- Import du nouveau wrapper
import { BlurView } from 'expo-blur'; // Optionnel pour le header, sinon View simple

type SubjectScreenRouteProp = RouteProp<RootStackParamList, 'Subject'>;
type SubjectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SubjectScreen = () => {
  const route = useRoute<SubjectScreenRouteProp>();
  const navigation = useNavigation<SubjectScreenNavigationProp>();
  const { subjects, updateNextReview, deleteSubject } = useSubjectStore();

  const subjectId = route.params?.id;
  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  if (!subject) {
    return (
      <ScreenWrapper style={styles.centerContainer}>
        <Text style={styles.errorText}>Sujet introuvable</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ?',
      'Action irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteSubject(subject.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateNextReview(subject.id, difficulty);
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      {/* Header Minimaliste */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        
        {/* Titre tronqué si trop long */}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {subject.title}
        </Text>
        
        <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteButton]}>
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas Mind Map */}
      <View style={styles.contentArea}>
        {subject.mindMap ? (
          <MindMapCanvas rootNode={subject.mindMap} />
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Génération de la structure...</Text>
          </View>
        )}
      </View>

      {/* Footer Flottant (Glass Effect) */}
      <View style={styles.footerContainer}>
        <View style={styles.footerGlass}>
          <Text style={styles.footerLabel}>Difficulté ressentie</Text>
          
          <View style={styles.reviewGrid}>
            <TouchableOpacity
              style={[styles.reviewButton, styles.btnEasy]}
              onPress={() => handleReview('easy')}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>🤩</Text>
              <Text style={styles.btnText}>Facile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reviewButton, styles.btnMedium]}
              onPress={() => handleReview('medium')}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>🤔</Text>
              <Text style={styles.btnText}>Moyen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reviewButton, styles.btnHard]}
              onPress={() => handleReview('hard')}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>🥵</Text>
              <Text style={styles.btnText}>Difficile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // --- HEADER ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Rouge subtil
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  iconText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },

  // --- CONTENT ---
  contentArea: {
    flex: 1,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.textPrimary,
  },

  // --- FOOTER ---
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  footerGlass: {
    backgroundColor: theme.colors.surface, // Fallback glass
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  footerLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  // Couleurs des boutons (Subtiles avec bordures colorées)
  btnEasy: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  btnMedium: {
    borderColor: theme.colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  btnHard: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

export default SubjectScreen;