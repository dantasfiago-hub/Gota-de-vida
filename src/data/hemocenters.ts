import type { Hemocenter } from '@/types';

/**
 * DADOS DEMONSTRATIVOS. Nomes, endereços e contatos são FICTÍCIOS e não representam
 * instituições reais. Substituir por dados oficiais quando houver integração autorizada.
 */
export const hemocenters: Hemocenter[] = [
  {
    id: 'h1',
    name: 'Hemocentro Modelo – Natal (demonstrativo)',
    address: 'Rua Exemplo, 100 – endereço fictício',
    city: 'Natal',
    phone: '(84) 0000-0001',
    hours: 'Seg a sex, 07h às 17h',
    email: 'contato.natal@exemplo.invalid',
    lat: -5.7945,
    lng: -35.211,
  },
  {
    id: 'h2',
    name: 'Unidade de Coleta Modelo – Mossoró (demonstrativo)',
    address: 'Avenida Exemplo, 200 – endereço fictício',
    city: 'Mossoró',
    phone: '(84) 0000-0002',
    hours: 'Seg a sex, 07h às 16h',
    email: 'contato.mossoro@exemplo.invalid',
    lat: -5.1875,
    lng: -37.3441,
  },
  {
    id: 'h3',
    name: 'Unidade de Coleta Modelo – Caicó (demonstrativo)',
    address: 'Praça Exemplo, 300 – endereço fictício',
    city: 'Caicó',
    phone: '(84) 0000-0003',
    hours: 'Seg a qui, 08h às 15h',
    email: 'contato.caico@exemplo.invalid',
    lat: -6.4587,
    lng: -37.0977,
  },
  {
    id: 'h4',
    name: 'Unidade de Coleta Modelo – Currais Novos (demonstrativo)',
    address: 'Travessa Exemplo, 400 – endereço fictício',
    city: 'Currais Novos',
    phone: '(84) 0000-0004',
    hours: 'Ter e qui, 08h às 14h',
    email: 'contato.curraisnovos@exemplo.invalid',
    lat: -6.2606,
    lng: -36.5174,
  },
];
