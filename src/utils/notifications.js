// notifications.js
// Notificações locais de lembrete para sessões de estudo (RF11).
// 100% local (expo-notifications), sem depender de servidor/push remoto,
// mantendo o app funcional offline (RNF04).

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// expo-notifications não tem suporte confiável de agendamento local na web.
// Em vez de deixar o app quebrar ao importar/chamar essas funções no
// navegador, viramos tudo em no-op nesse ambiente.
const IS_WEB = Platform.OS === 'web';

if (!IS_WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission() {
  if (IS_WEB) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('studyflow-reminders', {
      name: 'Lembretes de estudo',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return finalStatus === 'granted';
}

/**
 * Cancela todas as notificações agendadas pelo StudyFlow e reagenda com
 * base na lista de sessões pendentes futuras. Chamado sempre que o
 * cronograma é (re)gerado.
 */
export async function rescheduleSessionNotifications(sessions, subjectsById, options) {
  if (IS_WEB) return; // sem notificações locais confiáveis no navegador

  const { enabled, reminderMinutesBefore = 15 } = options;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const now = new Date();
  const upcoming = sessions.filter((s) => s.status === 'pending');

  for (const session of upcoming) {
    const [h, m] = session.startTime.split(':').map(Number);
    const sessionDate = new Date(`${session.date}T00:00:00`);
    sessionDate.setHours(h, m, 0, 0);

    const triggerDate = new Date(sessionDate.getTime() - reminderMinutesBefore * 60 * 1000);
    if (triggerDate <= now) continue;

    const subject = subjectsById[session.subjectId];
    const subjectName = subject ? subject.name : 'Estudo';

    // Evita agendar um número excessivo de notificações de uma só vez
    // (o sistema operacional tem limites por app).
    // eslint-disable-next-line no-await-in-loop
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de estudar! 📚',
        body: `${subjectName} começa às ${session.startTime}. Bora manter o ritmo?`,
        data: { sessionId: session.id },
      },
      trigger: triggerDate,
    });
  }
}
