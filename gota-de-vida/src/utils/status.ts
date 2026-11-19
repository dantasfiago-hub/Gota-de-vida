import type { Appointment, Campaign, Exam, ExamStatus, NeedLevel } from '@/types';

export type Tone = 'red' | 'green' | 'amber' | 'blue' | 'gray';

export function appointmentTone(s: Appointment['status']): Tone {
  switch (s) {
    case 'Confirmado': return 'green';
    case 'Solicitado': return 'amber';
    case 'Concluído': return 'blue';
    default: return 'gray';
  }
}

export function campaignTone(s: Campaign['status']): Tone {
  return s === 'Aberta' ? 'green' : s === 'Em andamento' ? 'amber' : 'gray';
}

export function examStatus(e: Exam): { label: ExamStatus; tone: Tone } {
  if (!e.processed) return { label: 'Em processamento', tone: 'blue' };
  if (!e.validated) return { label: 'Aguardando validação', tone: 'amber' };
  if (e.released) return { label: 'Disponível', tone: 'green' };
  return { label: 'Não disponibilizado', tone: 'gray' };
}

export const NEED_COLORS: Record<NeedLevel, { bg: string; fg: string }> = {
  Estável: { bg: '#E6F4E7', fg: '#2E7D32' },
  Atenção: { bg: '#FFF3DC', fg: '#B26A00' },
  Crítico: { bg: '#FCE8E8', fg: '#8E1B1B' },
};

export const APPOINTMENT_DISCLAIMER =
  'O agendamento não garante, por si só, que você esteja apto a doar. A avaliação de aptidão é feita pelo serviço de hemoterapia no dia da doação.';
