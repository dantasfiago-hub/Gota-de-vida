import { onlyDigits } from './masks';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === parseInt(d[9], 10) && calc(10) === parseInt(d[10], 10);
}

export function parseBrDate(v: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function ageFromBirth(v: string): number | null {
  const d = parseBrDate(v);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function isValidPhone(v: string): boolean {
  const n = onlyDigits(v).length;
  return n === 10 || n === 11;
}

export interface RegisterInput {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
  accepted: boolean;
}

export type RegisterErrors = Partial<Record<keyof RegisterInput, string>>;

export function validateRegister(v: RegisterInput): RegisterErrors {
  const e: RegisterErrors = {};
  if (v.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.';
  if (!isValidCpf(v.cpf)) e.cpf = 'CPF inválido. Confira os 11 dígitos.';
  const age = ageFromBirth(v.birthDate);
  if (age === null) e.birthDate = 'Use o formato DD/MM/AAAA com uma data real.';
  else if (age < 16 || age > 120) e.birthDate = 'Data de nascimento fora do intervalo esperado.';
  if (!isValidEmail(v.email)) e.email = 'Informe um e-mail válido.';
  if (!isValidPhone(v.phone)) e.phone = 'Informe DDD + telefone.';
  if (v.password.length < 8) e.password = 'A senha deve ter ao menos 8 caracteres.';
  else if (!/\d/.test(v.password) || !/[A-Za-z]/.test(v.password)) e.password = 'Use letras e números na senha.';
  if (v.confirmPassword !== v.password) e.confirmPassword = 'As senhas não coincidem.';
  if (v.city.trim().length < 2) e.city = 'Informe a cidade.';
  if (v.state.trim().length !== 2) e.state = 'Use a sigla do estado (ex.: RN).';
  if (!v.accepted) e.accepted = 'É necessário aceitar os termos e a política de privacidade.';
  return e;
}
