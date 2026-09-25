import 'react-native-get-random-values';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '../storage/storage';
import { generateSchedule, reorganizeAfterMiss, computeSubjectProgress } from '../utils/scheduler';
import { requestNotificationPermission, rescheduleSessionNotifications } from '../utils/notifications';
import { colorForIndex } from '../theme/colors';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    sessionDurationMinutes: 60,
    reminderMinutesBefore: 15,
  });

  // Carrega tudo do AsyncStorage ao iniciar (RF12 / RNF04 - offline-first)
  useEffect(() => {
    (async () => {
      const [s, e, a, sess, conf] = await Promise.all([
        Storage.getSubjects(),
        Storage.getExams(),
        Storage.getAvailability(),
        Storage.getSessions(),
        Storage.getSettings(),
      ]);
      setSubjects(s);
      setExams(e);
      setAvailability(a);
      setSettings(conf);

      // RF09: sessões de dias anteriores que ficaram "pending" (o usuário não
      // marcou nem como concluída nem como perdida) são tratadas como não
      // concluídas automaticamente, e o cronograma futuro é reorganizado.
      const todayIso = new Date().toISOString().slice(0, 10);
      const hasStalePending = sess.some((s2) => s2.status === 'pending' && s2.date < todayIso);

      if (hasStalePending) {
        const cleaned = sess.map((s2) =>
          s2.status === 'pending' && s2.date < todayIso ? { ...s2, status: 'missed' } : s2
        );
        const regenerated = generateSchedule({
          exams: e,
          availability: a,
          sessions: cleaned,
          fromDate: new Date(),
          sessionDurationMinutes: conf.sessionDurationMinutes,
        });
        setSessions(regenerated);
        await Storage.saveSessions(regenerated);
        try {
          const map = {};
          s.forEach((sub) => {
            map[sub.id] = sub;
          });
          await rescheduleSessionNotifications(regenerated, map, {
            enabled: conf.notificationsEnabled,
            reminderMinutesBefore: conf.reminderMinutesBefore,
          });
        } catch (err) {
          console.warn('StudyFlow: falha ao reagendar notificações na inicialização', err);
        }
      } else {
        setSessions(sess);
      }

      setLoading(false);
    })();
  }, []);

  const subjectsById = useMemo(() => {
    const map = {};
    subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  const examsById = useMemo(() => {
    const map = {};
    exams.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [exams]);

  const notifyAndPersistSessions = useCallback(
    async (newSessions) => {
      setSessions(newSessions);
      await Storage.saveSessions(newSessions);
      try {
        await rescheduleSessionNotifications(newSessions, subjectsById, {
          enabled: settings.notificationsEnabled,
          reminderMinutesBefore: settings.reminderMinutesBefore,
        });
      } catch (e) {
        // Falha silenciosa: notificações são um "nice to have", não podem travar o app
        console.warn('StudyFlow: falha ao reagendar notificações', e);
      }
    },
    [subjectsById, settings]
  );

  // ---------- Matérias (RF01) ----------
  const addSubject = useCallback(
    async (name) => {
      const newSubject = { id: uuidv4(), name: name.trim(), color: colorForIndex(subjects.length) };
      const updated = [...subjects, newSubject];
      setSubjects(updated);
      await Storage.saveSubjects(updated);
      return newSubject;
    },
    [subjects]
  );

  const deleteSubject = useCallback(
    async (subjectId) => {
      const updatedSubjects = subjects.filter((s) => s.id !== subjectId);
      const updatedExams = exams.filter((e) => e.subjectId !== subjectId);
      const updatedSessions = sessions.filter((s) => s.subjectId !== subjectId);
      setSubjects(updatedSubjects);
      setExams(updatedExams);
      await Storage.saveSubjects(updatedSubjects);
      await Storage.saveExams(updatedExams);
      await notifyAndPersistSessions(updatedSessions);
    },
    [subjects, exams, sessions, notifyAndPersistSessions]
  );

  // ---------- Provas e trabalhos (RF02, RF03, RF04) ----------
  const addExam = useCallback(
    async ({ subjectId, title, type, date, contentHours }) => {
      const newExam = {
        id: uuidv4(),
        subjectId,
        title: title.trim(),
        type, // 'prova' | 'trabalho'
        date, // ISO yyyy-mm-dd
        contentHours: Number(contentHours) || 1,
        createdAt: new Date().toISOString(),
      };
      const updatedExams = [...exams, newExam];
      setExams(updatedExams);
      await Storage.saveExams(updatedExams);
      await regenerate(updatedExams, availability, sessions);
      return newExam;
    },
    [exams, availability, sessions]
  );

  const deleteExam = useCallback(
    async (examId) => {
      const updatedExams = exams.filter((e) => e.id !== examId);
      setExams(updatedExams);
      await Storage.saveExams(updatedExams);
      await regenerate(updatedExams, availability, sessions);
    },
    [exams, availability, sessions]
  );

  // ---------- Disponibilidade (RF05) ----------
  const setAvailabilityBlocks = useCallback(
    async (blocks) => {
      setAvailability(blocks);
      await Storage.saveAvailability(blocks);
      await regenerate(exams, blocks, sessions);
    },
    [exams, sessions]
  );

  // ---------- Geração do cronograma (RF06 / RNF05) ----------
  const regenerate = useCallback(
    async (examsArg = exams, availabilityArg = availability, sessionsArg = sessions) => {
      const newSessions = generateSchedule({
        exams: examsArg,
        availability: availabilityArg,
        sessions: sessionsArg,
        fromDate: new Date(),
        sessionDurationMinutes: settings.sessionDurationMinutes,
      });
      await notifyAndPersistSessions(newSessions);
      return newSessions;
    },
    [exams, availability, sessions, settings, notifyAndPersistSessions]
  );

  // ---------- Sessões: concluir (RF08) / não concluir -> reorganiza (RF09) ----------
  const completeSession = useCallback(
    async (sessionId) => {
      const updated = sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'completed' } : s
      );
      await notifyAndPersistSessions(updated);
    },
    [sessions, notifyAndPersistSessions]
  );

  const missSession = useCallback(
    async (sessionId) => {
      const reorganized = reorganizeAfterMiss({
        sessionId,
        exams,
        availability,
        sessions,
        fromDate: new Date(),
        sessionDurationMinutes: settings.sessionDurationMinutes,
      });
      await notifyAndPersistSessions(reorganized);
    },
    [exams, availability, sessions, settings, notifyAndPersistSessions]
  );

  // ---------- Configurações / notificações (RF11) ----------
  const updateSettings = useCallback(
    async (partial) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      await Storage.saveSettings(updated);
      if (partial.notificationsEnabled) {
        await requestNotificationPermission();
      }
      await rescheduleSessionNotifications(sessions, subjectsById, {
        enabled: updated.notificationsEnabled,
        reminderMinutesBefore: updated.reminderMinutesBefore,
      });
    },
    [settings, sessions, subjectsById]
  );

  // ---------- Progresso por matéria (RF10) ----------
  const progressBySubject = useMemo(
    () => computeSubjectProgress({ subjects, exams, sessions }),
    [subjects, exams, sessions]
  );

  const progressById = useMemo(() => {
    const map = {};
    progressBySubject.forEach((p) => {
      map[p.subjectId] = p;
    });
    return map;
  }, [progressBySubject]);

  const todaySessions = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return sessions
      .filter((s) => s.date === todayIso)
      .sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
  }, [sessions]);

  const value = {
    loading,
    subjects,
    exams,
    availability,
    sessions,
    settings,
    subjectsById,
    examsById,
    progressById,
    progressBySubject,
    todaySessions,
    addSubject,
    deleteSubject,
    addExam,
    deleteExam,
    setAvailabilityBlocks,
    regenerate,
    completeSession,
    missSession,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa ser usado dentro de um <AppProvider>');
  return ctx;
}
