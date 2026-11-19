import type { Appointment, AppNotification, BloodNeeds, Campaign, Donation, Exam, Hemocenter, NeedLevel, BloodType } from '@/types';
import { hemocenters } from '@/data/hemocenters';
import { seedAppointments, seedCampaigns, seedDonations, seedExams, seedNeeds, seedNotifications } from '@/data/seed';
import { todayIso, uid } from '@/utils/format';
import { delay, load, save } from './storage';
import { listUsers } from './authService';

// ---------- Hemocentros ----------
export async function listHemocenters(): Promise<Hemocenter[]> {
  await delay(150);
  return hemocenters;
}
export async function getHemocenter(id: string): Promise<Hemocenter | undefined> {
  return hemocenters.find((h) => h.id === id);
}

// ---------- Campanhas ----------
const C_KEY = 'campaigns';
export async function listCampaigns(): Promise<Campaign[]> {
  await delay(250);
  return load<Campaign[]>(C_KEY, seedCampaigns);
}
export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return (await load<Campaign[]>(C_KEY, seedCampaigns)).find((c) => c.id === id);
}
export async function saveCampaign(input: Omit<Campaign, 'id' | 'interested' | 'baseParticipants'> & { id?: string }): Promise<Campaign> {
  await delay(300);
  const all = await load<Campaign[]>(C_KEY, seedCampaigns);
  if (input.id) {
    const idx = all.findIndex((c) => c.id === input.id);
    if (idx < 0) throw new Error('Campanha não encontrada.');
    all[idx] = { ...all[idx], ...input } as Campaign;
    await save(C_KEY, all);
    return all[idx];
  }
  const created: Campaign = { ...input, id: uid('c'), interested: [] };
  await save(C_KEY, [created, ...all]);
  return created;
}
export async function deleteCampaign(id: string): Promise<void> {
  await delay(250);
  const all = await load<Campaign[]>(C_KEY, seedCampaigns);
  await save(C_KEY, all.filter((c) => c.id !== id));
}
export async function toggleInterest(campaignId: string, userId: string): Promise<Campaign> {
  const all = await load<Campaign[]>(C_KEY, seedCampaigns);
  const c = all.find((x) => x.id === campaignId);
  if (!c) throw new Error('Campanha não encontrada.');
  c.interested = c.interested.includes(userId) ? c.interested.filter((i) => i !== userId) : [...c.interested, userId];
  await save(C_KEY, all);
  return c;
}
export async function listInterestedNames(campaignId: string): Promise<string[]> {
  const c = await getCampaign(campaignId);
  if (!c) return [];
  const users = await listUsers();
  return c.interested.map((id) => users.find((u) => u.id === id)?.name ?? 'Usuário').filter(Boolean);
}

// ---------- Agendamentos ----------
const A_KEY = 'appointments';
export async function listAppointments(userId?: string): Promise<Appointment[]> {
  await delay(250);
  const all = await load<Appointment[]>(A_KEY, seedAppointments);
  const filtered = userId ? all.filter((a) => a.userId === userId) : all;
  return [...filtered].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
}
export async function createAppointment(input: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Promise<Appointment> {
  await delay(500);
  const all = await load<Appointment[]>(A_KEY, seedAppointments);
  const clash = all.find(
    (a) => a.userId === input.userId && a.date === input.date && a.status !== 'Cancelado',
  );
  if (clash) throw new Error('Você já possui um agendamento nesta data.');
  const taken = all.find(
    (a) => a.hemocenterId === input.hemocenterId && a.date === input.date && a.time === input.time && a.status !== 'Cancelado',
  );
  if (taken) throw new Error('Este horário acabou de ser ocupado. Escolha outro.');
  const created: Appointment = { ...input, id: uid('a'), status: 'Solicitado', createdAt: todayIso() };
  await save(A_KEY, [created, ...all]);
  return created;
}
export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  await delay(250);
  const all = await load<Appointment[]>(A_KEY, seedAppointments);
  const a = all.find((x) => x.id === id);
  if (!a) throw new Error('Agendamento não encontrado.');
  a.status = status;
  await save(A_KEY, all);
}
export async function takenSlots(hemocenterId: string, date: string): Promise<string[]> {
  const all = await load<Appointment[]>(A_KEY, seedAppointments);
  return all.filter((a) => a.hemocenterId === hemocenterId && a.date === date && a.status !== 'Cancelado').map((a) => a.time);
}

// ---------- Doações ----------
const D_KEY = 'donations';
export async function listDonations(userId?: string): Promise<Donation[]> {
  await delay(250);
  const all = await load<Donation[]>(D_KEY, seedDonations);
  const f = userId ? all.filter((d) => d.userId === userId) : all;
  return [...f].sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---------- Exames (demonstrativo) ----------
const E_KEY = 'exams';
export async function listExams(userId?: string): Promise<Exam[]> {
  await delay(250);
  const all = await load<Exam[]>(E_KEY, seedExams);
  const f = userId ? all.filter((e) => e.userId === userId) : all;
  return [...f].sort((a, b) => (a.doneAt < b.doneAt ? 1 : -1));
}
export async function setExamRelease(id: string, released: boolean): Promise<void> {
  await delay(300);
  const all = await load<Exam[]>(E_KEY, seedExams);
  const e = all.find((x) => x.id === id);
  if (!e) throw new Error('Exame não encontrado.');
  if (released && !e.validated) throw new Error('Valide o exame antes de liberar.');
  e.released = released;
  e.releasedAt = released ? todayIso() : undefined;
  await save(E_KEY, all);
  if (released) {
    // notificação genérica: sem dados de saúde no texto
    await addNotification({ userId: e.userId, kind: 'exame', title: 'Há uma atualização disponível', body: 'Abra o app para ver novidades.' });
  }
}
export async function setExamValidation(id: string, validated: boolean): Promise<void> {
  await delay(250);
  const all = await load<Exam[]>(E_KEY, seedExams);
  const e = all.find((x) => x.id === id);
  if (!e) throw new Error('Exame não encontrado.');
  e.validated = validated;
  if (!validated) { e.released = false; e.releasedAt = undefined; }
  await save(E_KEY, all);
}

// ---------- Notificações ----------
const N_KEY = 'notifications';
export async function listNotifications(userId: string): Promise<AppNotification[]> {
  await delay(200);
  const all = await load<AppNotification[]>(N_KEY, seedNotifications);
  return all.filter((n) => n.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
  const all = await load<AppNotification[]>(N_KEY, seedNotifications);
  all.unshift({ ...n, id: uid('n'), createdAt: todayIso(), read: false });
  await save(N_KEY, all);
}
export async function markNotificationRead(id: string): Promise<void> {
  const all = await load<AppNotification[]>(N_KEY, seedNotifications);
  const n = all.find((x) => x.id === id);
  if (n) n.read = true;
  await save(N_KEY, all);
}
export async function markAllRead(userId: string): Promise<void> {
  const all = await load<AppNotification[]>(N_KEY, seedNotifications);
  all.forEach((n) => { if (n.userId === userId) n.read = true; });
  await save(N_KEY, all);
}

// ---------- Necessidades de sangue (demonstrativo) ----------
const NEED_KEY = 'needs';
export async function getNeeds(): Promise<BloodNeeds> {
  return load<BloodNeeds>(NEED_KEY, () => seedNeeds);
}
export async function setNeed(type: Exclude<BloodType, 'Não sei'>, level: NeedLevel): Promise<BloodNeeds> {
  const needs = await getNeeds();
  needs[type] = level;
  await save(NEED_KEY, needs);
  return { ...needs };
}

// ---------- Comunicados (área do hemocentro) ----------
export interface Announcement { id: string; title: string; body: string; createdAt: string }
const ANN_KEY = 'announcements';
export async function listAnnouncements(): Promise<Announcement[]> {
  return load<Announcement[]>(ANN_KEY, () => [
    { id: 'an1', title: 'Comunicado de exemplo', body: 'Mensagem demonstrativa do hemocentro.', createdAt: todayIso() },
  ]);
}
/** Envia o comunicado como notificação para todos os doadores (genérico, sem dados de saúde). */
export async function broadcastAnnouncement(title: string, body: string): Promise<number> {
  await delay(400);
  const list = await listAnnouncements();
  await save(ANN_KEY, [{ id: uid('an'), title, body, createdAt: todayIso() }, ...list]);
  const donors = (await listUsers()).filter((u) => u.role === 'donor');
  const all = await load<AppNotification[]>(N_KEY, seedNotifications);
  donors.forEach((d) => all.unshift({ id: uid('n'), userId: d.id, kind: 'comunicado', title, body, createdAt: todayIso(), read: false }));
  await save(N_KEY, all);
  return donors.length;
}
