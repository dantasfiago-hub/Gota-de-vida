import type { Campaign } from '@/types';

/** Participantes = inscritos de base (demo) + interessados reais registrados no app. */
export function participantCount(c: Campaign): number {
  return (c.baseParticipants ?? 0) + c.interested.length;
}

export function progressPct(c: Campaign): number {
  return Math.min(100, Math.round((participantCount(c) / Math.max(c.goal, 1)) * 100));
}
