import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import SessionCard from '../components/SessionCard';
import { colors } from '../theme/colors';

function formatToday() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function HomeScreen() {
  const { loading, todaySessions, subjectsById, examsById, completeSession, missSession } =
    useApp();

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const completedCount = todaySessions.filter((s) => s.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Plano de hoje</Text>
        <Text style={styles.subtitle}>{formatToday()}</Text>
        {todaySessions.length > 0 && (
          <Text style={styles.summary}>
            {completedCount}/{todaySessions.length} sessões concluídas
          </Text>
        )}
      </View>

      {todaySessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>Nada agendado para hoje</Text>
          <Text style={styles.emptyText}>
            Cadastre matérias, provas/trabalhos e sua disponibilidade para o StudyFlow gerar seu
            cronograma automaticamente.
          </Text>
        </View>
      ) : (
        <FlatList
          data={todaySessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              subject={subjectsById[item.subjectId]}
              exam={examsById[item.examId]}
              onComplete={item.status === 'pending' ? () => completeSession(item.id) : undefined}
              onMiss={item.status === 'pending' ? () => missSession(item.id) : undefined}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  summary: { marginTop: 8, fontSize: 13, fontWeight: '600', color: colors.primary },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
