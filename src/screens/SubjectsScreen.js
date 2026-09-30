import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import SubjectCard from '../components/SubjectCard';
import { colors } from '../theme/colors';

export default function SubjectsScreen({ navigation }) {
  const { subjects, progressById, deleteSubject } = useApp();

  const confirmDelete = (subject) => {
    Alert.alert(
      'Excluir matéria',
      `Excluir "${subject.name}"? Isso também removerá provas/trabalhos e sessões vinculadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteSubject(subject.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {subjects.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Ionicons name="book-outline" size={28} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>Nenhuma matéria cadastrada</Text>
          <Text style={styles.emptyText}>
            Adicione sua primeira matéria para começar a organizar os estudos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SubjectCard
              subject={item}
              progress={progressById[item.id]}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Adicionar matéria" style={styles.fab} onPress={() => navigation.navigate('SubjectForm')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 24, paddingBottom: 100, width: '100%', maxWidth: 760, alignSelf: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, maxWidth: 520, width: '100%', alignSelf: 'center' },
  emptyIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { textAlign: 'center', fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '400', marginTop: -2 },
});
