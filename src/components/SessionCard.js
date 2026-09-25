import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const STATUS_LABEL = {
  pending: 'Pendente',
  completed: 'Concluída',
  missed: 'Não concluída',
};

export default function SessionCard({ session, subject, exam, onComplete, onMiss }) {
  const isPending = session.status === 'pending';
  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: subject?.color || colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.time}>
            {session.startTime} – {session.endTime}
          </Text>
          <Text
            style={[
              styles.status,
              session.status === 'completed' && { color: colors.secondary },
              session.status === 'missed' && { color: colors.danger },
            ]}
          >
            {STATUS_LABEL[session.status]}
          </Text>
        </View>
        <Text style={styles.subject}>{subject?.name || 'Matéria'}</Text>
        {exam && (
          <Text style={styles.examTitle} numberOfLines={1}>
            {exam.type === 'prova' ? '📝 ' : '📄 '}
            {exam.title}
          </Text>
        )}
        {isPending && (onComplete || onMiss) && (
          <View style={styles.actions}>
            {onComplete && (
              <TouchableOpacity style={[styles.btn, styles.btnDone]} onPress={onComplete}>
                <Text style={styles.btnDoneText}>Concluir</Text>
              </TouchableOpacity>
            )}
            {onMiss && (
              <TouchableOpacity style={[styles.btn, styles.btnMiss]} onPress={onMiss}>
                <Text style={styles.btnMissText}>Não deu tempo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripe: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  time: {
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  subject: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  examTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  btnDone: {
    backgroundColor: colors.secondary,
  },
  btnDoneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  btnMiss: {
    backgroundColor: colors.primaryLight,
  },
  btnMissText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 12,
  },
});
