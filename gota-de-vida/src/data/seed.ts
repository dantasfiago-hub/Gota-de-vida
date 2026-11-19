import type { Appointment, AppNotification, Campaign, Donation, Exam, User, BloodNeeds } from '@/types';
import { demoHash, isoPlus } from '@/utils/format';

/** Contas demonstrativas. Senha de ambas: demo1234 (hash simples; NÃO é segurança real). */
export const DEMO_PASSWORD = 'demo1234';

export const seedUsers: User[] = [
  {
    id: 'u_donor',
    role: 'donor',
    name: 'João Silva (demo)',
    cpf: '529.982.247-25', // CPF de teste com dígitos válidos, sem titular conhecido
    birthDate: '15/03/1998',
    email: 'doador@demo.app',
    phone: '(84) 90000-0001',
    city: 'Caicó',
    state: 'RN',
    bloodType: 'O+',
    passwordHash: demoHash(DEMO_PASSWORD),
    notificationPrefs: { campaigns: true, appointments: true, exams: true },
  },
  {
    id: 'u_admin',
    role: 'admin',
    name: 'Ana Souza (funcionária demo)',
    cpf: '111.444.777-35',
    birthDate: '20/07/1990',
    email: 'hemocentro@demo.app',
    phone: '(84) 90000-0002',
    city: 'Natal',
    state: 'RN',
    bloodType: 'A+',
    passwordHash: demoHash(DEMO_PASSWORD),
    hemocenterId: 'h1',
    notificationPrefs: { campaigns: true, appointments: true, exams: true },
  },
  {
    id: 'u_d2',
    role: 'donor',
    name: 'Maria Oliveira (demo)',
    cpf: '390.533.447-05',
    birthDate: '02/11/2004',
    email: 'maria@demo.app',
    phone: '(84) 90000-0003',
    city: 'Natal',
    state: 'RN',
    bloodType: 'A+',
    passwordHash: demoHash(DEMO_PASSWORD),
    notificationPrefs: { campaigns: true, appointments: true, exams: true },
  },
  {
    id: 'u_d3',
    role: 'donor',
    name: 'Carlos Lima (demo)',
    cpf: '168.995.350-09',
    birthDate: '09/09/1985',
    email: 'carlos@demo.app',
    phone: '(84) 90000-0004',
    city: 'Mossoró',
    state: 'RN',
    bloodType: 'B-',
    passwordHash: demoHash(DEMO_PASSWORD),
    notificationPrefs: { campaigns: true, appointments: true, exams: true },
  },
];

export const seedCampaigns = (): Campaign[] => [
  {
    id: 'c1',
    title: 'Campanha Universitária – Doe e Salve Vidas',
    hemocenterId: 'h3',
    city: 'Caicó',
    location: 'Campus (local fictício)',
    date: isoPlus(6),
    time: '08:00',
    description:
      'Campanha demonstrativa para estudantes e servidores. A aptidão para doar é avaliada pelo serviço de hemoterapia no local.',
    status: 'Aberta',
    goal: 30,
    group: 'Turma de Sistemas de Informação (demo)',
    baseParticipants: 23,
    interested: ['u_d2'],
  },
  {
    id: 'c2',
    title: 'Urgente: estoque de O negativo',
    hemocenterId: 'h1',
    city: 'Natal',
    location: 'Sede do hemocentro (demonstrativo)',
    date: isoPlus(2),
    time: '07:30',
    description: 'Apelo demonstrativo por doadores de todos os tipos, com atenção ao tipo O negativo.',
    status: 'Em andamento',
    goal: 50,
    interested: ['u_d3', 'u_d2'],
  },
  {
    id: 'c3',
    title: 'Dia de Doação – Empresas Parceiras',
    hemocenterId: 'h2',
    city: 'Mossoró',
    location: 'Unidade de coleta (demonstrativo)',
    date: isoPlus(14),
    time: '09:00',
    description: 'Mobilização coletiva entre empresas e grupos comunitários. Meta coletiva demonstrativa.',
    status: 'Aberta',
    goal: 40,
    group: 'Empresas parceiras (demo)',
    baseParticipants: 12,
    interested: [],
  },
  {
    id: 'c4',
    title: 'Campanha Encerrada – Semana do Doador',
    hemocenterId: 'h4',
    city: 'Currais Novos',
    location: 'Unidade de coleta (demonstrativo)',
    date: isoPlus(-20),
    time: '08:00',
    description: 'Campanha já encerrada, mantida para consulta de histórico.',
    status: 'Encerrada',
    goal: 25,
    interested: ['u_d3'],
  },
];

export const seedDonations = (): Donation[] => [
  { id: 'd1', userId: 'u_donor', date: isoPlus(-200), hemocenterId: 'h3', type: 'Sangue total', status: 'Registrada' },
  { id: 'd2', userId: 'u_donor', date: isoPlus(-90), hemocenterId: 'h1', type: 'Sangue total', status: 'Registrada' },
  { id: 'd3', userId: 'u_donor', date: isoPlus(-12), hemocenterId: 'h3', type: 'Sangue total', status: 'Em validação' },
  { id: 'd4', userId: 'u_d2', date: isoPlus(-30), hemocenterId: 'h1', type: 'Sangue total', status: 'Registrada' },
  { id: 'd5', userId: 'u_d3', date: isoPlus(-45), hemocenterId: 'h2', type: 'Plaquetas', status: 'Registrada' },
];

export const seedExams = (): Exam[] => [
  { id: 'e1', userId: 'u_donor', userName: 'João Silva (demo)', recordCode: 'REG-0001', donationId: 'd1', doneAt: isoPlus(-199), validated: true, released: true, releasedAt: isoPlus(-190), processed: true },
  { id: 'e2', userId: 'u_donor', userName: 'João Silva (demo)', recordCode: 'REG-0002', donationId: 'd2', doneAt: isoPlus(-89), validated: true, released: false, processed: true },
  { id: 'e3', userId: 'u_donor', userName: 'João Silva (demo)', recordCode: 'REG-0003', donationId: 'd3', doneAt: isoPlus(-11), validated: false, released: false, processed: true },
  { id: 'e4', userId: 'u_d2', userName: 'Maria Oliveira (demo)', recordCode: 'REG-0004', donationId: 'd4', doneAt: isoPlus(-29), validated: false, released: false, processed: false },
  { id: 'e5', userId: 'u_d3', userName: 'Carlos Lima (demo)', recordCode: 'REG-0005', donationId: 'd5', doneAt: isoPlus(-44), validated: true, released: false, processed: true },
];

export const seedAppointments = (): Appointment[] => [
  { id: 'a1', userId: 'u_donor', userName: 'João Silva (demo)', hemocenterId: 'h3', campaignId: 'c1', date: isoPlus(6), time: '08:30', status: 'Confirmado', createdAt: isoPlus(-1) },
  { id: 'a2', userId: 'u_d2', userName: 'Maria Oliveira (demo)', hemocenterId: 'h1', campaignId: 'c2', date: isoPlus(2), time: '09:00', status: 'Solicitado', createdAt: isoPlus(0) },
  { id: 'a3', userId: 'u_d3', userName: 'Carlos Lima (demo)', hemocenterId: 'h2', date: isoPlus(4), time: '10:00', status: 'Solicitado', createdAt: isoPlus(0) },
];

export const seedNotifications = (): AppNotification[] => [
  { id: 'n1', userId: 'u_donor', kind: 'agendamento', title: 'Agendamento confirmado', body: 'Seu agendamento foi confirmado. Confira os detalhes no app.', createdAt: isoPlus(-1), read: false },
  { id: 'n2', userId: 'u_donor', kind: 'campanha', title: 'Nova campanha perto de você', body: 'Há uma campanha aberta na sua cidade.', createdAt: isoPlus(-2), read: false },
  { id: 'n3', userId: 'u_donor', kind: 'exame', title: 'Há uma atualização disponível', body: 'Abra o app para ver novidades na área de exames.', createdAt: isoPlus(-5), read: true },
  { id: 'n4', userId: 'u_donor', kind: 'comunicado', title: 'Comunicado do hemocentro', body: 'Mensagem demonstrativa: obrigado por apoiar a doação de sangue.', createdAt: isoPlus(-8), read: true },
];

export const seedNeeds: BloodNeeds = {
  'A+': 'Estável',
  'A-': 'Atenção',
  'B+': 'Estável',
  'B-': 'Atenção',
  'AB+': 'Estável',
  'AB-': 'Atenção',
  'O+': 'Atenção',
  'O-': 'Crítico',
};
