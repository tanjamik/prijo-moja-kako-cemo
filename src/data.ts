import { Person, CustomField, PendingPerson, BirackoMesto, MobilniTim, Obuka, Kontakt, FinansijskaStavka } from './types';

export const INITIAL_CUSTOM_FIELDS: CustomField[] = [];

export const AVAILABLE_ROLES = [
  'šef BM',
  'kontrolor',
  'vdv volonter',
  'šef MT',
  'clan MT',
  'cc operater'
];

export const AVAILABLE_STATUSES = [
  'potvrđen',
  'kontaktiran',
  'potencijalni',
  'odustao'
];

export const AVAILABLE_STAGES = [
  'Kontaktiran',
  'Potvrdio učešće',
  'Prošao osnovnu obuku',
  'Prošao naprednu obuku',
  'Raspoređen',
  'Potvrđen',
  '—',
  'Odustao'
];

export const REONI = [
  'Crveni krst',
  'Neimar',
  'Kalenić',
  'Čubura',
  'Vračarski plato'
];

export const INITIAL_PEOPLE: Person[] = [
  {
    id: '1',
    imePrezime: 'Milica Jovanović',
    uloga: 'šef BM',
    status: 'potvrđen',
    faza: 'Potvrđen',
    reon: 'Neimar',
    bm: '012',
    telefon: '064 111 2233',
    email: 'milica.j@mail.com',
    auto: true,
    iskustvo: true,
    obukaOsnovna: true,
    obukaNapredna: true,
    rasporedjen: true,
    napomene: 'Vrlo pouzdana, bila kontrolor 2023.',
    poreklo: 'Akcija',
    odPoverenja: true
  },
  {
    id: '2',
    imePrezime: 'Stefan Petrović',
    uloga: 'kontrolor',
    status: 'potvrđen',
    faza: 'Prošao osnovnu obuku',
    reon: 'Neimar',
    bm: '012',
    telefon: '063 998 1020',
    email: 'stefan.p@mail.com',
    auto: false,
    iskustvo: true,
    obukaOsnovna: true,
    obukaNapredna: false,
    rasporedjen: true,
    napomene: 'Iskusan kontrolor sa više izbornih ciklusa.',
    poreklo: 'Preporuka',
    odPoverenja: true
  },
  {
    id: '3',
    imePrezime: 'Ana Marković',
    uloga: 'vdv volonter',
    status: 'kontaktiran',
    faza: 'Kontaktiran',
    reon: 'Čubura',
    bm: '045',
    telefon: '065 334 5566',
    email: 'ana.m@mail.com',
    auto: true,
    iskustvo: false,
    obukaOsnovna: false,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: 'Zainteresovana, čeka termin obuke.'
  },
  {
    id: '4',
    imePrezime: 'Nikola Đorđević',
    uloga: 'šef MT',
    status: 'potvrđen',
    faza: 'Raspoređen',
    reon: 'Kalenić',
    bm: '031',
    telefon: '060 777 8899',
    email: 'nikola.dj@mail.com',
    auto: true,
    iskustvo: true,
    obukaOsnovna: true,
    obukaNapredna: true,
    rasporedjen: true,
    napomene: 'Ima kombi, može da vozi ceo mobilni tim.'
  },
  {
    id: '5',
    imePrezime: 'Jovana Ilić',
    uloga: 'clan MT',
    status: 'potvrđen',
    faza: 'Raspoređen',
    reon: 'Crveni krst',
    bm: '008',
    telefon: '064 222 3344',
    email: 'jovana.i@mail.com',
    auto: false,
    iskustvo: false,
    obukaOsnovna: true,
    obukaNapredna: false,
    rasporedjen: true,
    napomene: 'Aktivna u kampanji od marta.'
  },
  {
    id: '6',
    imePrezime: 'Marko Stanković',
    uloga: 'cc operater',
    status: 'potencijalni',
    faza: '—',
    reon: 'Vračarski plato',
    bm: '022',
    telefon: '063 555 6677',
    email: 'marko.s@mail.com',
    auto: false,
    iskustvo: false,
    obukaOsnovna: false,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: 'Prijavio se preko online forme, čeka odobrenje.',
    poreklo: 'Prijava preko forma',
    odPoverenja: false
  },
  {
    id: '7',
    imePrezime: 'Teodora Nikolić',
    uloga: 'kontrolor',
    status: 'kontaktiran',
    faza: 'Kontaktiran',
    reon: 'Čubura',
    bm: '045',
    telefon: '065 888 9900',
    email: 'teodora.n@mail.com',
    auto: true,
    iskustvo: true,
    obukaOsnovna: true,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: 'Potvrdila dolazak na osveženje znanja.'
  },
  {
    id: '8',
    imePrezime: 'Luka Pavlović',
    uloga: 'clan MT',
    status: 'odustao',
    faza: 'Odustao',
    reon: 'Neimar',
    bm: '013',
    telefon: '060 121 3141',
    email: 'luka.p@mail.com',
    auto: false,
    iskustvo: false,
    obukaOsnovna: false,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: 'Odustao zbog posla na terenu van Beograda.'
  },
  {
    id: '9',
    imePrezime: 'Sara Ristić',
    uloga: 'vdv volonter',
    status: 'potvrđen',
    faza: 'Raspoređen',
    reon: 'Kalenić',
    bm: '031',
    telefon: '064 909 8070',
    email: 'sara.r@mail.com',
    auto: true,
    iskustvo: false,
    obukaOsnovna: true,
    obukaNapredna: true,
    rasporedjen: true,
    napomene: 'Završila sve nivoe obuke.'
  },
  {
    id: '10',
    imePrezime: 'Filip Kostić',
    uloga: 'šef BM',
    status: 'kontaktiran',
    faza: 'Kontaktiran',
    reon: 'Crveni krst',
    bm: '008',
    telefon: '063 404 5060',
    email: 'filip.k@mail.com',
    auto: false,
    iskustvo: true,
    obukaOsnovna: false,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: 'Zainteresovan za poziciju šefa biračkog mesta.'
  }
];

export const INITIAL_PENDING: PendingPerson[] = [
  {
    id: '101',
    ime: 'Petar',
    prezime: 'Lukić',
    tel: '064 333 1212',
    email: 'petar.l@mail.com',
    tg: '@petarl',
    reon: 'Neimar',
    bmGlasa: '012',
    uloga: 'vdv volonter',
    auto: true,
    iskustvo: false,
    napomene: 'Prijavio se preko online forme.'
  },
  {
    id: '102',
    ime: 'Iva',
    prezime: 'Simić',
    tel: '065 222 8989',
    email: 'iva.s@mail.com',
    tg: '@ivas',
    reon: 'Čubura',
    bmGlasa: '045',
    uloga: 'clan MT',
    auto: false,
    iskustvo: true,
    napomene: 'Bila na izborima 2022 i 2023.'
  }
];

export const INITIAL_BM: BirackoMesto[] = [
  { broj: '008', naziv: 'OŠ Sveti Sava', adresa: 'Resavska 17', reon: 'Crveni krst', deli: true, sefBM: ['10'], kontrolori: [] },
  { broj: '012', naziv: 'Gimnazija "Svetozar Marković"', adresa: 'Cara Nikolaja 39', reon: 'Neimar', deli: false, sefBM: ['1'], kontrolori: ['2'] },
  { broj: '013', naziv: 'Vrtić Bajka', adresa: 'Maksima Gorkog 5', reon: 'Neimar', deli: false, sefBM: [], kontrolori: [] },
  { broj: '022', naziv: 'Dom kulture Vračar', adresa: 'Njegoševa 77', reon: 'Vračarski plato', deli: false, sefBM: [], kontrolori: [] },
  { broj: '031', naziv: 'OŠ Vladislav Ribnikar', adresa: 'Ulica užička 12', reon: 'Kalenić', deli: false, sefBM: [], kontrolori: [] },
  { broj: '045', naziv: 'Tehnička škola', adresa: 'Bulevar kralja Aleksandra 88', reon: 'Čubura', deli: true, sefBM: [], kontrolori: ['7'] }
];

export const INITIAL_MT: MobilniTim[] = [
  { id: 'MT-1', reon: 'Neimar', pokriva: ['012', '013'], kola: 1, sefMT: ['4'], clanovi: ['5'] },
  { id: 'MT-2', reon: 'Kalenić', pokriva: ['031'], kola: 1, sefMT: [], clanovi: ['9'] },
  { id: 'MT-3', reon: 'Čubura', pokriva: ['045'], kola: 0, sefMT: [], clanovi: [] }
];

export const INITIAL_OBUKE: Obuka[] = [
  {
    id: '1',
    naziv: 'Obuka za kontrolore',
    tip: 'uživo',
    datum: '2026-06-15',
    ucesnici: [
      { pid: '1', status: 'prisustvovao', komentar: '' },
      { pid: '2', status: 'prisustvovao', komentar: '' },
      { pid: '4', status: 'prisustvovao', komentar: '' },
      { pid: '5', status: 'pozvan', komentar: '' },
      { pid: '7', status: 'prisustvovao', komentar: '' }
    ]
  },
  {
    id: '2',
    naziv: 'Obuka za vdv',
    tip: 'online',
    datum: '2026-06-20',
    ucesnici: [
      { pid: '1', status: 'prisustvovao', komentar: '' },
      { pid: '4', status: 'prisustvovao', komentar: '' },
      { pid: '9', status: 'prisustvovao', komentar: '' },
      { pid: '2', status: 'nije prisustvovao', komentar: '' }
    ]
  },
  {
    id: '3',
    naziv: 'Obuka za call centar',
    tip: 'online',
    datum: '2026-06-25',
    ucesnici: [
      { pid: '3', status: 'pozvan', komentar: '' },
      { pid: '6', status: 'prisustvovao', komentar: '' },
      { pid: '8', status: 'nije prisustvovao', komentar: '' }
    ]
  }
];

export const INITIAL_KONTAKTI: Kontakt[] = [
  { id: '1', pid: '3', datum: '2026-06-10', ko: 'Milica J.', rezultat: 'Zainteresovana, traži termin obuke' },
  { id: '2', pid: '6', datum: '2026-06-08', ko: 'Stefan P.', rezultat: 'Javiće se kad reši smene na poslu' },
  { id: '3', pid: '7', datum: '2026-06-11', ko: 'Ana M.', rezultat: 'Potvrdila dolazak na osnovnu obuku' },
  { id: '4', pid: '8', datum: '2026-06-05', ko: 'Nikola Đ.', rezultat: 'Odustao zbog posla' }
];

export const INITIAL_FINANSIJE: FinansijskaStavka[] = [
  { id: '1', datum: '2026-06-01', tip: 'donacija', opis: 'Donacija — građani Vračara', iznos: 45000 },
  { id: '2', datum: '2026-06-03', tip: 'rashod', opis: 'Štampa materijala (majice, leci)', iznos: 18500 },
  { id: '3', datum: '2026-06-07', tip: 'donacija', opis: 'Donacija — lokalni preduzetnik', iznos: 30000 },
  { id: '4', datum: '2026-06-09', tip: 'rashod', opis: 'Gorivo za mobilne timove', iznos: 9200 },
  { id: '5', datum: '2026-06-12', tip: 'rashod', opis: 'Voda i hrana za izborni dan', iznos: 12000 }
];

export const ECANVASSER_DATA = [
  { bm: 'BM 008', pokucano: 420, podrska: 210, protiv: 90, neodluceni: 120 },
  { bm: 'BM 012', pokucano: 310, podrska: 140, protiv: 80, neodluceni: 90 },
  { bm: 'BM 013', pokucano: 260, podrska: 120, protiv: 55, neodluceni: 85 },
  { bm: 'BM 022', pokucano: 540, podrska: 300, protiv: 120, neodluceni: 120 },
  { bm: 'BM 031', pokucano: 180, podrska: 70, protiv: 40, neodluceni: 70 }
];

export const OPSTINE = [
  'Vračar',
  'Stari grad',
  'Savski venac',
  'Novi Beograd',
  'Zvezdara',
  'Palilula',
  'Voždovac'
];

export const OPSTINA_REONI: Record<string, string[]> = {
  'Vračar': ['Crveni krst', 'Neimar', 'Kalenić', 'Čubura', 'Vračarski plato'],
  'Stari grad': ['Dorćol', 'Terazije', 'Kosančićev venac', 'Skadarlija', 'Kopitareva gradina'],
  'Savski venac': ['Senjak', 'Dedinje', 'Topčider', 'Zeleni venac', 'Savamala'],
  'Novi Beograd': ['Fontana', 'Bežanijska kosa', 'Ušće', 'Ledine', 'Paviljoni'],
  'Zvezdara': ['Mirijevo', 'Lion', 'Bulbulder', 'Mali mokri lug', 'Konjarnik'],
  'Palilula': ['Borča', 'Karaburma', 'Kotež', 'Višnjica', 'Profesorska kolonija'],
  'Voždovac': ['Autokomanda', 'Dušanovac', 'Banjica', 'Braće Jerković', 'Kumodraž']
};

export function getReoniForOpstina(opstina: string): string[] {
  return OPSTINA_REONI[opstina] || OPSTINA_REONI['Vračar'];
}

function mapReon(reon: string, targetOpstina: string): string {
  const vracarList = OPSTINA_REONI['Vračar'];
  const targetList = OPSTINA_REONI[targetOpstina] || vracarList;
  const idx = vracarList.indexOf(reon);
  if (idx !== -1 && targetList[idx]) {
    return targetList[idx];
  }
  return targetList[0] || reon;
}

export function getInitialPeopleForOpstina(opstina: string): Person[] {
  if (opstina === 'Vračar') return INITIAL_PEOPLE;
  return INITIAL_PEOPLE.map(p => ({
    ...p,
    reon: mapReon(p.reon, opstina)
  }));
}

export function getInitialPendingForOpstina(opstina: string): PendingPerson[] {
  if (opstina === 'Vračar') return INITIAL_PENDING;
  return INITIAL_PENDING.map(p => ({
    ...p,
    reon: mapReon(p.reon, opstina)
  }));
}

export function getInitialBmForOpstina(opstina: string): BirackoMesto[] {
  if (opstina === 'Vračar') return INITIAL_BM;
  return INITIAL_BM.map(b => {
    let mappedNaziv = b.naziv;
    if (b.naziv.includes('Vračar')) {
      mappedNaziv = b.naziv.replace('Vračar', opstina);
    }
    return {
      ...b,
      naziv: mappedNaziv,
      reon: mapReon(b.reon, opstina)
    };
  });
}

export function getInitialMtForOpstina(opstina: string): MobilniTim[] {
  if (opstina === 'Vračar') return INITIAL_MT;
  return INITIAL_MT.map(m => ({
    ...m,
    reon: mapReon(m.reon, opstina)
  }));
}

export function getInitialFinansijeForOpstina(opstina: string): FinansijskaStavka[] {
  if (opstina === 'Vračar') return INITIAL_FINANSIJE;
  return INITIAL_FINANSIJE.map(f => {
    let mappedOpis = f.opis;
    if (f.opis.includes('Vračara')) {
      const genitiveNames: Record<string, string> = {
        'Stari grad': 'Starog grada',
        'Savski venac': 'Savskog venca',
        'Novi Beograd': 'Novog Beograda',
        'Zvezdara': 'Zvezdare',
        'Palilula': 'Palilule',
        'Voždovac': 'Voždovca'
      };
      const rep = genitiveNames[opstina] || opstina;
      mappedOpis = f.opis.replace('građani Vračara', `građani opštine ${opstina}`);
    }
    return {
      ...f,
      opis: mappedOpis
    };
  });
}

export function getInitialEcanvasserForOpstina(opstina: string): any[] {
  return ECANVASSER_DATA;
}

export function getInitialObukeForOpstina(opstina: string): Obuka[] {
  return INITIAL_OBUKE;
}

export function getInitialKontaktiForOpstina(opstina: string): Kontakt[] {
  return INITIAL_KONTAKTI;
}


