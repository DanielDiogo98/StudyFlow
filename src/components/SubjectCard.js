import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProgressBar from './ProgressBar';
import { colors } from '../theme/colors';

export default function SubjectCard({ subject, progress, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: subject.color }]} />
        <Text style={styles.name} numberOfLines={1}>
          {subject.name}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.delete}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
      {progress && (
        <>
          <ProgressBar percent={progress.percent} color={subject.color} />
          <Text style={styles.progressLabel}>
            {progress.percent}% concluído · {Math.round(progress.doneMinutes / 60)}h de{' '}
            {Math.round(progress.totalMinutes / 60)}h
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  delete: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
});
