export type Role = 'donor' | 'admin';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Não sei';
export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sei'];

export interface User {
  id: string;
  role: Role;
  name: string;
  cpf: string;
  birthDate: string; // DD/MM/AAAA
  email: string;
  phone: string;
  city: string;
  state: string;
  bloodType: BloodType;
  passwordHash: string; // DEMO: hash simples, NÃO é segurança real
  hemocenterId?: string; // para funcionários
  notificationPrefs: { campaigns: boolean; appointments: boolean; exams: boolean };
}

export interface Hemocenter {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  email: string;
  lat: number;
  lng: number;
}

export type CampaignStatus = 'Aberta' | 'Em andamento' | 'Encerrada';

export interface Campaign {
  id: string;
  title: string;
  hemocenterId: string;
  city: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  status: CampaignStatus;
  goal: number;
  interested: string[]; // ids de usuários
  /** campanha coletiva: turma, empresa, grupo ou instituição organizadora */
  group?: string;
  /** participantes fictícios já inscritos (demo), somados aos interessados reais */
  baseParticipants?: number;
}

export type AppointmentStatus = 'Solicitado' | 'Confirmado' | 'Cancelado' | 'Concluído';

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  hemocenterId: string;
  campaignId?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  date: string;
  hemocenterId: string;
  type: string;
  status: 'Registrada' | 'Em validação';
}

export type ExamStatus = 'Em processamento' | 'Aguardando validação' | 'Disponível' | 'Não disponibilizado';

export interface Exam {
  id: string;
  userId: string;
  userName: string;
  recordCode: string;
  donationId: string;
  doneAt: string;
  validated: boolean;
  released: boolean;
  releasedAt?: string;
  processed: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  kind: 'campanha' | 'comunicado' | 'agendamento' | 'doacao' | 'exame';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type NeedLevel = 'Estável' | 'Atenção' | 'Crítico';
export type BloodNeeds = Record<Exclude<BloodType, 'Não sei'>, NeedLevel>;
