import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Storage } from '../storage/storage';
import { colors } from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, regenerate } = useApp();

  const handleClearData = () => {
    Alert.alert(
      'Apagar todos os dados',
      'Isso vai remover matérias, provas, disponibilidade e cronograma salvos neste dispositivo. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await Storage.clearAll();
            Alert.alert('Pronto', 'Feche e abra o app novamente para começar do zero.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Disponibilidade</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Availability')}
        >
          <Text style={styles.rowLabel}>Meus dias e horários de estudo</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Lembretes de sessão de estudo</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Avisar com antecedência de</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() =>
                updateSettings({
                  reminderMinutesBefore: Math.max(5, settings.reminderMinutesBefore - 5),
                })
              }
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{settings.reminderMinutesBefore} min</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() =>
                updateSettings({
                  reminderMinutesBefore: Math.min(60, settings.reminderMinutesBefore + 5),
                })
              }
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sessões de estudo</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duração de cada sessão</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={async () => {
                const next = Math.max(30, settings.sessionDurationMinutes - 15);
                await updateSettings({ sessionDurationMinutes: next });
                await regenerate();
              }}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{settings.sessionDurationMinutes} min</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={async () => {
                const next = Math.min(180, settings.sessionDurationMinutes + 15);
                await updateSettings({ sessionDurationMinutes: next });
                await regenerate();
              }}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dados</Text>
        <Text style={styles.helperText}>
          Todos os seus dados ficam salvos apenas neste aparelho (AsyncStorage), sem necessidade de
          internet.
        </Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
          <Text style={styles.dangerBtnText}>Apagar todos os dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowLabel: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1, marginRight: 12 },
  rowChevron: { fontSize: 20, color: colors.textMuted },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  stepperValue: { marginHorizontal: 10, fontSize: 14, fontWeight: '700', color: colors.text, minWidth: 48, textAlign: 'center' },
  helperText: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 12 },
  dangerBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dangerBtnText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
