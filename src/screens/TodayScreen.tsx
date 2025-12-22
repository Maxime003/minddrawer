import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';

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
  const { subjects, createSubject } = useSubjectStore();

  useEffect(() => {
    if (subjects.length === 0) {
      createSubject({
        title: 'Mon premier sujet',
        context: 'course',
        rawNotes: 'Ceci est une note de test.',
      });
    }
  }, [subjects.length, createSubject]);

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
    // Pour l'instant, juste un console.log
    // Plus tard, navigation vers CreateScreen
    console.log('Créer un nouveau sujet');
    // navigation.navigate('CreateSubject');
  };

  const renderSubjectCard = ({ item }: { item: typeof subjects[0] }) => {
    const reviewDate = new Date(item.nextReviewAt);
    const daysOverdue = getDaysOverdue(reviewDate);
    const isToday = daysOverdue === 0;
    
    return (
      <TouchableOpacity
        style={styles.subjectCard}
        onPress={() => handleSubjectPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.subjectTitle}>{item.title}</Text>
          <View style={[styles.badge, isToday ? styles.badgeToday : styles.badgeOverdue]}>
            <Text style={styles.badgeText}>
              {isToday ? 'À réviser' : `${daysOverdue}j de retard`}
            </Text>
          </View>
        </View>
        <Text style={styles.subjectDate}>
          {reviewDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aujourd'hui</Text>
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
        style={styles.fab}
        onPress={handleCreateNewSubject}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Espace pour le FAB
  },
  subjectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeToday: {
    backgroundColor: '#4a90e2',
  },
  badgeOverdue: {
    backgroundColor: '#ff6b6b',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  subjectDate: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
});

export default TodayScreen;

