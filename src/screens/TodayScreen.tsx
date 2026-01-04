import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';

type TodayScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper pour comparer les dates sans l'heure (YYYY-MM-DD)
const getDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper pour calculer le nombre de jours de retard
const getDaysOverdue = (reviewDate: Date): number => {
  const today = new Date();
  const todayOnly = getDateOnly(today);
  const reviewOnly = getDateOnly(reviewDate);
  
  const todayTime = new Date(todayOnly).getTime();
  const reviewTime = new Date(reviewOnly).getTime();
  
  const diffTime = todayTime - reviewTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const TodayScreen = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { subjects } = useSubjectStore();

  const subjectsDueToday = useMemo(() => {
    const today = new Date();
    const todayOnly = getDateOnly(today);
    
    return subjects.filter((subject) => {
      const reviewDate = new Date(subject.nextReviewAt);
      const reviewOnly = getDateOnly(reviewDate);
      return reviewOnly <= todayOnly;
    });
  }, [subjects]);

  const handleSubjectPress = (subjectId: string) => {
    navigation.navigate('Subject', { id: subjectId });
  };

  const handleCreateNewSubject = () => {
    navigation.navigate('CreateSubject');
  };

  const handleReviewPress = (subjectId: string, event: any) => {
    event.stopPropagation();
    navigation.navigate('Subject', { id: subjectId });
  };

  const renderSubjectCard = ({ item }: { item: typeof subjects[0] }) => {
    const reviewDate = new Date(item.nextReviewAt);
    const daysOverdue = getDaysOverdue(reviewDate);
    const isToday = daysOverdue === 0;
    const borderColor = isToday ? theme.colors.success : theme.colors.error;
    const badgeColor = isToday ? theme.colors.success : theme.colors.primary;
    
    return (
      <TouchableOpacity
        style={[styles.subjectCard, { borderLeftColor: borderColor }]}
        onPress={() => handleSubjectPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.subjectTitle}>{item.title}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {isToday ? 'À réviser' : `${daysOverdue}j de retard`}
            </Text>
          </View>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.cardContent}>
          <View style={styles.metadataRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.metadataText, { marginLeft: theme.spacing.xs }]}>
              {reviewDate.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.metadataText, { marginLeft: theme.spacing.xs }]}>~15 min</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={(e) => handleReviewPress(item.id, e)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reviewButtonGradient}
          >
            <Ionicons name="play" size={18} color={theme.colors.textPrimary} />
            <Text style={[styles.reviewButtonText, { marginLeft: theme.spacing.xs }]}>Réviser</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const todayDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Aujourd'hui</Text>
        <Text style={styles.date}>{todayDate}</Text>
      </View>

      {subjectsDueToday.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>Tout est à jour !</Text>
          <Text style={styles.emptyText}>Reviens demain.</Text>
        </View>
      ) : (
        <FlatList
          data={subjectsDueToday}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderSubjectCard}
        />
      )}

      {/* Bouton FAB pour créer un nouveau sujet */}
      <TouchableOpacity
        onPress={handleCreateNewSubject}
        activeOpacity={0.8}
        style={styles.fabContainer}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: 100, // Espace pour le FAB
  },
  subjectCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceHighlight,
    marginBottom: theme.spacing.m,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.l,
  },
  metadataText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  reviewButton: {
    alignSelf: 'flex-end',
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  reviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  reviewButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.m,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.l,
    bottom: theme.spacing.l,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
});

export default TodayScreen;

