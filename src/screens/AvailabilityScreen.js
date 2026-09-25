import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';

const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

function hhmmToDate(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToHHMM(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export default function AvailabilityScreen() {
  const { availability, setAvailabilityBlocks } = useApp();
  const [pickerFor, setPickerFor] = useState(null); // { weekday, field: 'start'|'end' }
  const [draftWeekday, setDraftWeekday] = useState(1);
  const [draftStart, setDraftStart] = useState('18:00');
  const [draftEnd, setDraftEnd] = useState('20:00');

  const blocksByWeekday = WEEKDAYS.map((wd) => ({
    ...wd,
    blocks: availability.filter((a) => a.weekday === wd.value),
  }));

  const addBlock = () => {
    if (draftStart >= draftEnd) {
      Alert.alert('Ops', 'O horário final deve ser depois do horário inicial.');
      return;
    }
    const newBlock = {
      id: `${draftWeekday}-${draftStart}-${draftEnd}-${Date.now()}`,
      weekday: draftWeekday,
      startTime: draftStart,
      endTime: draftEnd,
    };
    setAvailabilityBlocks([...availability, newBlock]);
  };

  const removeBlock = (id) => {
    setAvailabilityBlocks(availability.filter((a) => a.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.introText}>
          Defina os dias e horários em que você costuma estudar. O StudyFlow usará esses blocos
          para montar seu cronograma automaticamente.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Dia da semana</Text>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((wd) => (
              <TouchableOpacity
                key={wd.value}
                style={[styles.weekdayChip, draftWeekday === wd.value && styles.weekdayChipActive]}
                onPress={() => setDraftWeekday(wd.value)}
              >
                <Text
                  style={[
                    styles.weekdayChipText,
                    draftWeekday === wd.value && styles.weekdayChipTextActive,
                  ]}
                >
                  {wd.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Início</Text>
              {IS_WEB ? (
                <input
                  type="time"
                  value={draftStart}
                  onChange={(e) => e.target.value && setDraftStart(e.target.value)}
                  style={webTimeInputStyle}
                />
              ) : (
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerFor('start')}>
                  <Text style={styles.timeBtnText}>{draftStart}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Fim</Text>
              {IS_WEB ? (
                <input
                  type="time"
                  value={draftEnd}
                  onChange={(e) => e.target.value && setDraftEnd(e.target.value)}
                  style={webTimeInputStyle}
                />
              ) : (
                <TouchableOpacity style={styles.timeBtn} onPress={() => setPickerFor('end')}>
                  <Text style={styles.timeBtnText}>{draftEnd}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!IS_WEB && pickerFor && (
            <DateTimePicker
              value={hhmmToDate(pickerFor === 'start' ? draftStart : draftEnd)}
              mode="time"
              is24Hour
              display="default"
              onChange={(event, selected) => {
                setPickerFor(null);
                if (selected) {
                  const hhmm = dateToHHMM(selected);
                  if (pickerFor === 'start') setDraftStart(hhmm);
                  else setDraftEnd(hhmm);
                }
              }}
            />
          )}

          <TouchableOpacity style={styles.addBtn} onPress={addBlock}>
            <Text style={styles.addBtnText}>+ Adicionar bloco de disponibilidade</Text>
          </TouchableOpacity>
        </View>

        {blocksByWeekday.map((wd) => (
          <View key={wd.value} style={styles.dayGroup}>
            <Text style={styles.dayTitle}>{wd.label}</Text>
            {wd.blocks.length === 0 ? (
              <Text style={styles.noBlocks}>Sem horários definidos</Text>
            ) : (
              wd.blocks.map((b) => (
                <View key={b.id} style={styles.blockRow}>
                  <Text style={styles.blockText}>
                    {b.startTime} – {b.endTime}
                  </Text>
                  <TouchableOpacity onPress={() => removeBlock(b.id)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  introText: { fontSize: 13, color: colors.textMuted, marginBottom: 16, lineHeight: 19 },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  label: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  weekdayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekdayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  weekdayChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  weekdayChipTextActive: { color: '#fff' },
  timeRow: { flexDirection: 'row' },
  timeBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  timeBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  addBtn: {
    marginTop: 18,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  dayGroup: { marginBottom: 16 },
  dayTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  noBlocks: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  blockText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  removeText: { fontSize: 12, color: colors.danger, fontWeight: '600' },
});

const webTimeInputStyle = {
  backgroundColor: colors.background,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10,
  fontSize: 16,
  fontWeight: '600',
  color: colors.text,
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'center',
};
