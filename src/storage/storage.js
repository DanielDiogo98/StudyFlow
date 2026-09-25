// storage.js
// Camada de persistência local usando AsyncStorage (RF12 / RNF02 / RNF04)
// Todo o app funciona 100% offline: nenhuma chamada de rede é feita aqui.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SUBJECTS: '@studyflow:subjects',
  EXAMS: '@studyflow:exams',
  AVAILABILITY: '@studyflow:availability',
  SESSIONS: '@studyflow:sessions',
  SETTINGS: '@studyflow:settings',
};

async function getItem(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`StudyFlow storage: falha ao ler ${key}`, e);
    return fallback;
  }
}

async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`StudyFlow storage: falha ao salvar ${key}`, e);
    return false;
  }
}

export const StorageKeys = KEYS;

export const Storage = {
  // Matérias (RF01)
  getSubjects: () => getItem(KEYS.SUBJECTS, []),
  saveSubjects: (subjects) => setItem(KEYS.SUBJECTS, subjects),

  // Provas e trabalhos (RF02, RF03, RF04)
  getExams: () => getItem(KEYS.EXAMS, []),
  saveExams: (exams) => setItem(KEYS.EXAMS, exams),

  // Disponibilidade de dias/horários (RF05)
  getAvailability: () => getItem(KEYS.AVAILABILITY, []),
  saveAvailability: (availability) => setItem(KEYS.AVAILABILITY, availability),

  // Sessões de estudo geradas pelo cronograma (RF06-RF10)
  getSessions: () => getItem(KEYS.SESSIONS, []),
  saveSessions: (sessions) => setItem(KEYS.SESSIONS, sessions),

  // Configurações gerais (ex: notificações - RF11)
  getSettings: () =>
    getItem(KEYS.SETTINGS, {
      notificationsEnabled: true,
      sessionDurationMinutes: 60,
      reminderMinutesBefore: 15,
    }),
  saveSettings: (settings) => setItem(KEYS.SETTINGS, settings),

  async clearAll() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
