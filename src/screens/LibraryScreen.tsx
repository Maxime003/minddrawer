import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../theme/theme';

type LibraryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const { subjects, resetForReview } = useSubjectStore();

  const handleCreateNewSubject = () => {
    navigation.navigate('CreateSubject');
  };

  const handleSubjectPress = (subjectId: string) => {
    navigation.navigate('Subject', { id: subjectId });
  };

  const handleResetForReview = (subjectId: string) => {
    resetForReview(subjectId);
    Alert.alert('Sujet prêt !', 'Le sujet est de retour dans "Aujourd\'hui".');
  };

  return (
    <ScreenWrapper withPadding>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNewSubject}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* LISTE DES SUJETS */}
      {subjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>C'est vide ici</Text>
          <Text style={styles.emptyText}>
            Crée ton premier sujet pour commencer à apprendre.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleCreateNewSubject}
          >
            <Text style={styles.emptyButtonText}>Créer un sujet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSubjectPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {/* Bouton Test discret */}
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => handleResetForReview(item.id)}
                >
                  <Text style={styles.testButtonText}>♻️ Test</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.dateLabel}>Prochaine révision :</Text>
                <Text style={styles.dateValue}>
                  {new Date(item.nextReviewAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  createButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  createButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  
  // LISTE
  listContent: {
    paddingBottom: 100, // Espace pour le scroll
  },
  
  // CARTE (Glassmorphism Style)
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.card, // Ombre portée
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  
  // BOUTON TEST (Subtil)
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testButtonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  
  // FOOTER DE LA CARTE
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  dateLabel: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginRight: 6,
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.glow,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LibraryScreen;