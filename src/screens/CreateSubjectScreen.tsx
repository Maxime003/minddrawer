import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubjectStore } from '../store/subjectStore';
import { RootStackParamList } from '../types/navigation';
import { ContextType, CONTEXT_LABELS } from '../types/subject';

type CreateSubjectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateSubjectScreen = () => {
  const navigation = useNavigation<CreateSubjectScreenNavigationProp>();
  const { createSubject } = useSubjectStore();

  const [title, setTitle] = useState('');
  const [context, setContext] = useState<ContextType>('course');
  const [rawNotes, setRawNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const contextTypes: ContextType[] = ['course', 'book', 'article', 'idea'];

  const isFormValid = title.trim().length > 0 && rawNotes.trim().length > 0;

  const handleGenerateMindMap = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    // Simulation d'un délai de génération (1 seconde)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const subjectId = createSubject({
        title: title.trim(),
        context,
        rawNotes: rawNotes.trim(),
      });

      // Navigation vers le sujet créé
      navigation.navigate('Subject', { id: subjectId });
    } catch (error) {
      console.error('Erreur lors de la création du sujet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nouvelle connaissance</Text>
        </View>

        {/* Champ Titre */}
        <View style={styles.section}>
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Introduction à React Native"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        {/* Sélecteur de Contexte */}
        <View style={styles.section}>
          <Text style={styles.label}>Contexte</Text>
          <View style={styles.chipsContainer}>
            {contextTypes.map((contextType) => (
              <TouchableOpacity
                key={contextType}
                style={[
                  styles.chip,
                  context === contextType && styles.chipSelected,
                ]}
                onPress={() => setContext(contextType)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    context === contextType && styles.chipTextSelected,
                  ]}
                >
                  {CONTEXT_LABELS[contextType]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Champ Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Collez ici le contenu à apprendre..."
            value={rawNotes}
            onChangeText={setRawNotes}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Bouton Générer la Mind Map */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!isFormValid || isLoading) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateMindMap}
          disabled={!isFormValid || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Générer la Mind Map</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
    paddingBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateSubjectScreen;
