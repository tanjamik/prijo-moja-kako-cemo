export interface CustomField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[]; // for select type
}

export interface Person {
  id: string;
  imePrezime: string;
  uloga: string;
  status: string;
  faza: string;
  reon: string;
  bm: string;
  telefon: string;
  email: string;
  auto: boolean;
  iskustvo: boolean;
  obukaOsnovna: boolean;
  obukaNapredna: boolean;
  rasporedjen: boolean;
  napomene: string;
  telegram?: string;
  kontaktPoint?: string;
  poreklo?: string;
  odPoverenja?: boolean;
  [key: string]: any; // To support dynamic custom fields
}

export type SortField = 'imePrezime' | 'uloga' | 'status' | 'faza' | 'reon' | 'bm' | 'telefon' | 'email' | string;
export type SortOrder = 'asc' | 'desc' | null;

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface PendingPerson {
  id: string;
  ime: string;
  prezime: string;
  tel: string;
  email: string;
  tg: string;
  reon: string;
  bmGlasa: string;
  uloga: string;
  auto: boolean;
  iskustvo: boolean;
  napomene: string;
}

export interface BirackoMesto {
  broj: string;
  naziv: string;
  adresa: string;
  reon: string;
  deli: boolean;
  sefBM: string[]; // Array of Person IDs
  kontrolori: string[]; // Array of Person IDs
}

export interface MobilniTim {
  id: string;
  reon: string;
  pokriva: string[]; // BM numbers
  kola: number;
  sefMT: string[]; // Array of Person IDs
  clanovi: string[]; // Array of Person IDs
}

export interface UcesnikObuke {
  pid: string;
  status: 'pozvan' | 'prisustvovao' | 'nije prisustvovao';
  komentar?: string;
}

export interface Obuka {
  id: string;
  naziv: string;
  tip: 'uživo' | 'online';
  datum: string;
  ucesnici: UcesnikObuke[];
}

export interface Kontakt {
  id: string;
  pid: string;
  datum: string;
  ko: string;
  rezultat: string;
}

export interface FinansijskaStavka {
  id: string;
  datum: string;
  tip: 'donacija' | 'rashod';
  opis: string;
  iznos: number;
}

export interface FilterState {
  q: string;
  uloga: string;
  status: string;
  faza: string;
  reon: string;
  auto: boolean | null;
  iskustvo: boolean | null;
  obukaOsnovna: boolean | null;
  obukaNapredna: boolean | null;
  rasporedjen: boolean | null;
  poreklo: string;
  odPoverenja: boolean | null;
}

