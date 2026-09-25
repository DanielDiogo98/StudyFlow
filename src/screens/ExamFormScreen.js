import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export default function ExamFormScreen({ navigation }) {
  const { subjects, addExam } = useApp();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('prova'); // 'prova' | 'trabalho'
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [contentHours, setContentHours] = useState('4');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!subjectId) {
      Alert.alert('Ops', 'Selecione uma matéria.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Ops', 'Digite um título (ex: Prova de Álgebra, Trabalho de Física).');
      return;
    }
    const hours = Number(contentHours.replace(',', '.'));
    if (!hours || hours <= 0) {
      Alert.alert('Ops', 'Informe a quantidade estimada de horas de conteúdo (maior que zero).');
      return;
    }

    setSaving(true);
    await addExam({
      subjectId,
      title,
      type,
      date: toIsoDate(date),
      contentHours: hours,
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Matéria</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={subjectId} onValueChange={setSubjectId}>
              {subjects.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'prova' && styles.typeBtnActive]}
              onPress={() => setType('prova')}
            >
              <Text style={[styles.typeBtnText, type === 'prova' && styles.typeBtnTextActive]}>
                Prova
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'trabalho' && styles.typeBtnActive]}
              onPress={() => setType('trabalho')}
            >
              <Text style={[styles.typeBtnText, type === 'trabalho' && styles.typeBtnTextActive]}>
                Trabalho
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Prova de Álgebra Linear"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Data da prova/entrega</Text>
          {IS_WEB ? (
            <input
              type="date"
              value={toIsoDate(date)}
              min={toIsoDate(new Date())}
              onChange={(e) => {
                if (e.target.value) setDate(new Date(`${e.target.value}T00:00:00`));
              }}
              style={webInputStyle}
            />
          ) : (
            <>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
                <Text style={styles.dateBtnText}>{date.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  minimumDate={new Date()}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, selected) => {
                    setShowPicker(Platform.OS === 'ios');
                    if (selected) setDate(selected);
                  }}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Quantidade de conteúdo (em horas estimadas de estudo)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 6"
            placeholderTextColor={colors.textMuted}
            value={contentHours}
            onChangeText={setContentHours}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            Dica: pense em quantos capítulos/tópicos faltam e estime quantas horas precisaria para
            revisar tudo. O StudyFlow distribuirá esse tempo nos seus horários livres.
          </Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar e gerar cronograma'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8, marginTop: 18 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  pickerWrapper: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  typeRow: { flexDirection: 'row' },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: colors.card,
  },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { fontWeight: '600', color: colors.textMuted },
  typeBtnTextActive: { color: '#fff' },
  dateBtn: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBtnText: { fontSize: 16, color: colors.text },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 17 },
  saveBtn: {
    marginTop: 28,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const webInputStyle = {
  backgroundColor: colors.card,
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 14,
  paddingRight: 14,
  fontSize: 16,
  color: colors.text,
  width: '100%',
  boxSizing: 'border-box',
};
