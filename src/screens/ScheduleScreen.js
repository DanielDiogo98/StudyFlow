import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import SessionCard from '../components/SessionCard';
import { colors } from '../theme/colors';

function formatSectionDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function ScheduleScreen() {
  const { loading, sessions, subjectsById, examsById, completeSession, missSession, regenerate } =
    useApp();

  const sections = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const future = sessions.filter((s) => s.date >= todayIso);
    const byDate = {};
    future.forEach((s) => {
      if (!byDate[s.date]) byDate[s.date] = [];
      byDate[s.date].push(s);
    });
    return Object.keys(byDate)
      .sort()
      .map((date) => ({
        title: formatSectionDate(date),
        data: byDate[date].sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
      }));
  }, [sessions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          {sections.length === 0
            ? 'Nenhuma sessão futura agendada ainda'
            : 'Sessões futuras organizadas por data'}
        </Text>
        <TouchableOpacity style={styles.regenBtn} onPress={() => regenerate()}>
          <Text style={styles.regenBtnText}>Recalcular</Text>
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Cadastre suas matérias, provas/trabalhos e disponibilidade nas abas abaixo para gerar
            o cronograma automaticamente.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerText: { flex: 1, fontSize: 13, color: colors.textMuted, marginRight: 12 },
  regenBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  regenBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
