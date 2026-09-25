import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

function daysUntil(dateIso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateIso}T00:00:00`);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Encerrado';
  if (diff === 0) return 'É hoje!';
  if (diff === 1) return 'Amanhã';
  return `Em ${diff} dias`;
}

export default function ExamsScreen({ navigation }) {
  const { exams, subjectsById, deleteExam, subjects } = useApp();

  const sorted = useMemo(() => [...exams].sort((a, b) => (a.date < b.date ? -1 : 1)), [exams]);

  const confirmDelete = (exam) => {
    Alert.alert('Excluir', `Excluir "${exam.title}"? As sessões de estudo dela serão removidas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteExam(exam.id) },
    ]);
  };

  const handleAdd = () => {
    if (subjects.length === 0) {
      Alert.alert('Cadastre uma matéria primeiro', 'Vá até a aba Matérias e adicione ao menos uma matéria.');
      return;
    }
    navigation.navigate('ExamForm');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>Nenhuma prova ou trabalho</Text>
          <Text style={styles.emptyText}>
            Cadastre suas provas e trabalhos com data de entrega para o StudyFlow montar seu
            cronograma.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const subject = subjectsById[item.subjectId];
            return (
              <TouchableOpacity
                style={styles.card}
                onLongPress={() => confirmDelete(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.stripe, { backgroundColor: subject?.color || colors.primary }]} />
                <View style={styles.cardContent}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.type}>{item.type === 'prova' ? 'PROVA' : 'TRABALHO'}</Text>
                    <Text style={styles.days}>{daysUntil(item.date)}</Text>
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>
                    {subject?.name || 'Matéria'} · {new Date(`${item.date}T00:00:00`).toLocaleDateString('pt-BR')} ·{' '}
                    {item.contentHours}h de conteúdo
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripe: { width: 6 },
  cardContent: { flex: 1, padding: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  type: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  days: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
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
