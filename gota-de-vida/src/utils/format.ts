export function todayIso(): string {
  return toIso(new Date());
}

export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function isoPlus(n: number): string {
  return toIso(addDays(new Date(), n));
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function monthName(i: number): string {
  return MONTHS[i];
}

export function weekdayShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS_SHORT[new Date(y, m - 1, d).getDay()];
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Hash simples SOMENTE para demonstração. Em produção use Supabase Auth / bcrypt no servidor. */
export function demoHash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return `demo$${(h >>> 0).toString(16)}`;
}

/** Dias corridos desde uma data ISO (YYYY-MM-DD) até hoje. */
export function daysSince(iso: string): number {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  const then = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((today - then) / 86400000));
}
