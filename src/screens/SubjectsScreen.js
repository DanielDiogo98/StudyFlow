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
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Nenhuma matéria cadastrada</Text>
          <Text style={styles.emptyText}>
            Toque no botão + para adicionar a primeira matéria que você quer estudar.
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

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SubjectForm')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '400', marginTop: -2 },
});
