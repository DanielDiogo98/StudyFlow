// scheduler.js
// Motor de geração automática do cronograma de estudos.
//
// Atende:
//  RF06 - Gerar automaticamente um cronograma de estudos
//  RF09 - Reorganizar automaticamente o cronograma quando uma sessão não for concluída
//  RNF05 - Geração do cronograma em até 2 segundos (algoritmo O(n log n), roda em memória)
//
// O algoritmo é puro (sem efeitos colaterais) para ser fácil de testar:
// recebe o estado atual e devolve a nova lista de sessões.

import { v4 as uuidv4 } from 'uuid';

const MINUTES_IN_DAY = 24 * 60;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(minutes) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function dateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(date) {
  return dateOnly(date).toISOString().slice(0, 10);
}

/**
 * Gera a lista de blocos de tempo disponíveis (slots) entre `fromDate` (inclusive)
 * e `toDate` (inclusive), a partir dos blocos semanais de disponibilidade cadastrados
 * pelo usuário (RF05), fatiados em sessões de `sessionDurationMinutes`.
 */
function buildAvailableSlots({ availability, fromDate, toDate, sessionDurationMinutes }) {
  const slots = [];
  if (!availability || availability.length === 0) return slots;

  let cursor = dateOnly(fromDate);
  const end = dateOnly(toDate);

  while (cursor <= end) {
    const weekday = cursor.getDay(); // 0 = domingo ... 6 = sábado
    const blocksForDay = availability.filter((a) => a.weekday === weekday);

    blocksForDay.forEach((block) => {
      const start = toMinutes(block.startTime);
      const finish = toMinutes(block.endTime);
      for (let t = start; t + sessionDurationMinutes <= finish; t += sessionDurationMinutes) {
        slots.push({
          date: isoDate(cursor),
          startTime: toHHMM(t),
          endTime: toHHMM(t + sessionDurationMinutes),
          weekday,
        });
      }
    });

    cursor = addDays(cursor, 1);
  }

  // Ordena cronologicamente
  slots.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return slots;
}

/**
 * Calcula, para cada prova/trabalho, quantas horas de conteúdo ainda faltam,
 * descontando as sessões já concluídas.
 */
function computeRemainingHoursByExam(exams, sessions) {
  const remaining = {};
  exams.forEach((exam) => {
    const doneMinutes = sessions
      .filter((s) => s.examId === exam.id && s.status === 'completed')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalMinutes = exam.contentHours * 60;
    remaining[exam.id] = Math.max(0, totalMinutes - doneMinutes);
  });
  return remaining;
}

/**
 * Gera (ou regenera) o cronograma de estudos completo a partir de hoje.
 *
 * Estratégia:
 *  1. Sessões já concluídas (status === 'completed') nunca são apagadas — ficam como histórico.
 *  2. Sessões futuras pendentes são sempre recalculadas do zero a partir de `fromDate`,
 *     para refletir o estado mais atual de matérias/provas/disponibilidade.
 *  3. Provas/trabalhos são ordenados por proximidade da data (mais urgentes primeiro).
 *     Dentro da mesma urgência, quem tem mais conteúdo pendente por dia disponível
 *     ganha prioridade (evita empurrar tudo para a véspera).
 *  4. Os slots livres são preenchidos greedily (guloso) na ordem cronológica,
 *     respeitando a data limite de cada prova/trabalho.
 */
export function generateSchedule({
  exams,
  availability,
  sessions = [],
  fromDate = new Date(),
  sessionDurationMinutes = 60,
}) {
  const today = dateOnly(fromDate);

  // Sessões concluídas, perdidas ou de dias anteriores viram histórico:
  // nunca são recalculadas, só as futuras "pending" são regeradas do zero.
  const pastOrDoneSessions = sessions.filter(
    (s) => s.status === 'completed' || s.status === 'missed' || dateOnly(s.date) < today
  );

  const activeExams = exams.filter((exam) => dateOnly(exam.date) >= today);
  if (activeExams.length === 0) {
    return pastOrDoneSessions;
  }

  const lastExamDate = activeExams.reduce(
    (max, e) => (dateOnly(e.date) > max ? dateOnly(e.date) : max),
    today
  );

  const allSlots = buildAvailableSlots({
    availability,
    fromDate: today,
    toDate: lastExamDate,
    sessionDurationMinutes,
  });

  // Remove slots já ocupados por sessões concluídas (para não sobrepor horários)
  const occupied = new Set(
    pastOrDoneSessions.map((s) => `${s.date}|${s.startTime}`)
  );
  let freeSlots = allSlots.filter((slot) => !occupied.has(`${slot.date}|${slot.startTime}`));

  const remainingByExam = computeRemainingHoursByExam(exams, pastOrDoneSessions);

  // Urgência: prova mais próxima primeiro; empate resolvido por mais minutos/dia necessários
  const sortedExams = [...activeExams].sort((a, b) => {
    const daysA = Math.max(1, (dateOnly(a.date) - today) / MS_PER_DAY());
    const daysB = Math.max(1, (dateOnly(b.date) - today) / MS_PER_DAY());
    if (daysA !== daysB) return daysA - daysB;
    const densityA = remainingByExam[a.id] / daysA;
    const densityB = remainingByExam[b.id] / daysB;
    return densityB - densityA;
  });

  const newSessions = [];

  sortedExams.forEach((exam) => {
    let minutesNeeded = remainingByExam[exam.id] || 0;
    if (minutesNeeded <= 0) return;

    const deadline = isoDate(exam.date);
    const usableSlots = [];
    const leftoverSlots = [];

    freeSlots.forEach((slot) => {
      if (slot.date <= deadline) usableSlots.push(slot);
      else leftoverSlots.push(slot);
    });

    const takenIndexes = [];
    for (let i = 0; i < usableSlots.length && minutesNeeded > 0; i++) {
      const slot = usableSlots[i];
      newSessions.push({
        id: uuidv4(),
        examId: exam.id,
        subjectId: exam.subjectId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationMinutes: sessionDurationMinutes,
        status: 'pending',
      });
      minutesNeeded -= sessionDurationMinutes;
      takenIndexes.push(i);
    }

    const remainingUsable = usableSlots.filter((_, idx) => !takenIndexes.includes(idx));
    freeSlots = [...remainingUsable, ...leftoverSlots].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  });

  return [...pastOrDoneSessions, ...newSessions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });
}

function MS_PER_DAY() {
  return 1000 * 60 * 60 * 24;
}

/**
 * RF09 - Quando o usuário marca uma sessão como NÃO concluída (perdida),
 * o conteúdo dela volta para o "saldo pendente" da prova/trabalho e o
 * cronograma futuro é recalculado automaticamente para reencaixar esse
 * conteúdo nos próximos horários livres.
 */
export function reorganizeAfterMiss({
  sessionId,
  exams,
  availability,
  sessions,
  fromDate = new Date(),
  sessionDurationMinutes = 60,
}) {
  // A sessão marcada vira histórico com status "missed" (não conta como
  // concluída), e o conteúdo dela volta automaticamente para o saldo
  // pendente da prova/trabalho, sendo reencaixado nos próximos horários
  // livres pelo restante do algoritmo de `generateSchedule`.
  const updated = sessions.map((s) => (s.id === sessionId ? { ...s, status: 'missed' } : s));

  return generateSchedule({
    exams,
    availability,
    sessions: updated,
    fromDate,
    sessionDurationMinutes,
  });
}

/**
 * RF10 - Progresso por matéria: percentual concluído com base nas horas de
 * conteúdo já estudadas (sessões concluídas) sobre o total estimado.
 */
export function computeSubjectProgress({ subjects, exams, sessions }) {
  return subjects.map((subject) => {
    const subjectExams = exams.filter((e) => e.subjectId === subject.id);
    const totalMinutes = subjectExams.reduce((sum, e) => sum + e.contentHours * 60, 0);
    const doneMinutes = sessions
      .filter((s) => s.subjectId === subject.id && s.status === 'completed')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const percent = totalMinutes > 0 ? Math.min(100, Math.round((doneMinutes / totalMinutes) * 100)) : 0;
    return {
      subjectId: subject.id,
      totalMinutes,
      doneMinutes,
      percent,
    };
  });
}
