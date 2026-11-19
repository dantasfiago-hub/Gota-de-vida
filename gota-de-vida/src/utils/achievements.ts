import type { Appointment, Campaign, Donation } from '@/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  /** texto de progresso, ex.: "2 de 3 doações" */
  progress: string;
}

export interface Impact {
  donations: number;
  campaignsSupported: number;
  collectiveCampaigns: number;
  achievementsEarned: number;
}

interface Input {
  userId: string;
  donations: Donation[];
  campaigns: Campaign[];
  appointments: Appointment[];
}

/**
 * Conquistas e indicadores calculados SOMENTE a partir de registros comprováveis:
 * doações com situação "Registrada" e campanhas com interesse declarado ou agendamento confirmado/concluído.
 * Não há ranking nem comparação por volume de sangue; a gamificação não incentiva doar fora do intervalo orientado pelo serviço de saúde.
 */
export function computeAchievements({ userId, donations, campaigns, appointments }: Input): { achievements: Achievement[]; impact: Impact } {
  const registered = donations.filter((d) => d.userId === userId && d.status === 'Registrada').length;

  const supportedIds = new Set<string>();
  campaigns.forEach((c) => { if (c.interested.includes(userId)) supportedIds.add(c.id); });
  appointments.forEach((a) => {
    if (a.userId === userId && a.campaignId && (a.status === 'Confirmado' || a.status === 'Concluído')) supportedIds.add(a.campaignId);
  });
  const supported = campaigns.filter((c) => supportedIds.has(c.id));
  const collective = supported.filter((c) => !!c.group).length;

  const list: Achievement[] = [
    {
      id: 'first',
      title: 'Primeira doação',
      description: 'Teve a primeira doação registrada pelo hemocentro.',
      earned: registered >= 1,
      progress: `${Math.min(registered, 1)} de 1 doação registrada`,
    },
    {
      id: 'recurring',
      title: 'Doador recorrente',
      description: 'Possui 3 ou mais doações registradas ao longo do tempo.',
      earned: registered >= 3,
      progress: `${Math.min(registered, 3)} de 3 doações registradas`,
    },
    {
      id: 'campaign',
      title: 'Apoiador de campanhas',
      description: 'Demonstrou interesse ou teve agendamento confirmado em uma campanha.',
      earned: supported.length >= 1,
      progress: `${Math.min(supported.length, 1)} de 1 campanha apoiada`,
    },
    {
      id: 'ambassador',
      title: 'Embaixador da doação',
      description: 'Participou de uma campanha coletiva e tem doação registrada.',
      earned: collective >= 1 && registered >= 1,
      progress: collective >= 1 ? (registered >= 1 ? 'Conquista obtida' : 'Falta uma doação registrada') : 'Participe de uma campanha coletiva',
    },
  ];

  return {
    achievements: list,
    impact: {
      donations: registered,
      campaignsSupported: supported.length,
      collectiveCampaigns: collective,
      achievementsEarned: list.filter((a) => a.earned).length,
    },
  };
}
