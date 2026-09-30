import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SEU PLANEJAMENTO</Text>
        <Text style={styles.title}>Plano de hoje</Text>
        <Text style={styles.subtitle}>{formatToday()}</Text>
        {todaySessions.length > 0 && (
          <View style={styles.progress}>
            <ProgressBar percent={completedCount / todaySessions.length * 100} height={5} />
            <Text style={styles.summary}>
              {completedCount}/{todaySessions.length} sessões concluídas
            </Text>
          </View>
        )}
      </View>

      {todaySessions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Ionicons name="calendar-outline" size={28} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>Nada agendado para hoje</Text>
          <Text style={styles.emptyText}>
            Adicione suas matérias e atividades, depois defina seus horários em Ajustes.
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
  header: { padding: 24, paddingTop: 32, width: '100%', maxWidth: 760, alignSelf: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  progress: { marginTop: 22 },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  summary: { marginTop: 8, fontSize: 13, fontWeight: '600', color: colors.primary },
  list: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32, width: '100%', maxWidth: 760, alignSelf: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, maxWidth: 520, width: '100%', alignSelf: 'center' },
  emptyIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { textAlign: 'center', fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
