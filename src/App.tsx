import React, { useState, useEffect, useRef } from 'react';
import { Person, CustomField, FilterState, SortState, SortField, SortOrder, PendingPerson, BirackoMesto, MobilniTim, Obuka, Kontakt, FinansijskaStavka } from './types';
import { 
  INITIAL_PEOPLE, 
  INITIAL_CUSTOM_FIELDS, 
  INITIAL_PENDING, 
  INITIAL_BM, 
  INITIAL_MT, 
  INITIAL_OBUKE, 
  INITIAL_KONTAKTI, 
  INITIAL_FINANSIJE, 
  AVAILABLE_ROLES, 
  AVAILABLE_STATUSES, 
  AVAILABLE_STAGES, 
  REONI,
  OPSTINE,
  OPSTINA_REONI,
  getReoniForOpstina,
  getInitialPeopleForOpstina,
  getInitialPendingForOpstina,
  getInitialBmForOpstina,
  getInitialMtForOpstina,
  getInitialFinansijeForOpstina,
  getInitialEcanvasserForOpstina,
  getInitialObukeForOpstina,
  getInitialKontaktiForOpstina
} from './data';

import { exportToExcel, importFromExcel } from './components/ExcelHelper';
import FilterPanel from './components/FilterPanel';
import PersonModal from './components/PersonModal';
import CustomFieldModal from './components/CustomFieldModal';
import ImportPreviewModal from './components/ImportPreviewModal';

// --- Import Modular Tab Components ---
import DashboardTab from './components/DashboardTab';
import CalendarTab from './components/CalendarTab';
import PendingTab from './components/PendingTab';
import BMTab from './components/BMTab';
import MTTab from './components/MTTab';
import AssignTab from './components/AssignTab';
import ObukeTab from './components/ObukeTab';
import KomunikacijaTab from './components/KomunikacijaTab';
import FinansijeTab from './components/FinansijeTab';
import ECanvasserTab from './components/ECanvasserTab';

import {
  Search,
  SlidersHorizontal,
  CheckSquare,
  Download,
  Upload,
  Settings,
  Plus,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Info,
  RefreshCw,
  Square,
  LayoutDashboard,
  Users,
  FileText,
  MapPin,
  Car,
  Link,
  Calendar,
  PhoneCall,
  Coins,
  Map,
  Check,
  ClipboardList,
  UserCheck,
  UserX,
  Sparkles,
  Zap,
  Globe,
  ChevronRight,
  Shield,
  Truck,
  GraduationCap,
  Pin,
  Menu,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

const TOUR_STEPS = [
  {
    title: "Dobrodošli u Koordinator! 🌟",
    description: "Ovo je vaš centralni operativni sistem za upravljanje logistikom, ljudima i terenom. Ovaj vodič će vas provesti kroz apsolutno svaku sekciju sistema kako biste potpuno razumeli sve njegove mogućnosti i uspešno vodili kampanju.",
    tab: null,
    elementId: null,
  },
  {
    title: "1. Režim pristupa i privilegije 🔑",
    description: "U bočnom meniju možete menjati nivo prava pristupa. 'Regionalni koordinator' može da menja bazu, raspoređuje ljude i kreira timove, dok je 'Član opštinskog tima' bezbedan mod samo za čitanje podataka.",
    tab: null,
    elementId: "role-switcher-tour",
  },
  {
    title: "2. Kontrolna tabla (Dashboard) 📊",
    description: "Kompletan grafički i statistički prikaz vaše opštine u realnom vremenu. Ovde pratite ukupno registrovanu snagu, procente regrutacije po fazama, pokrivenost biračkih mesta i najnovije aktivnosti na terenu.",
    tab: "dashboard",
    elementId: "sidebar-tab-dashboard",
  },
  {
    title: "3. Kalendar i Taskovi 📅",
    description: "Planirajte ključne sastanke, predizborne aktivnosti i rokove. Ovde možete dodavati zadatke za ceo tim, filtrirati ih po statusu i pratiti njihovo izvršenje direktno na interaktivnom kalendaru.",
    tab: "kalendar",
    elementId: "sidebar-tab-kalendar",
  },
  {
    title: "4. Spisak svih ljudi (Baza) 👥",
    description: "Ovo je glavno skladište svih vaših saradnika, volontera i kontrolora. Ovde možete detaljno pretraživati bazu, filtrirati ljude po raznim kriterijumima, kreirati sopstvene kolone (Custom Fields), i vršiti kompletan uvoz i izvoz u Excel format.",
    tab: "people",
    elementId: "sidebar-tab-people",
  },
  {
    title: "5. Nove prijave (Online regrutacija) 📝",
    description: "Sekcija za verifikaciju i odobravanje novih saradnika koji su se prijavili preko online formulara. Svaku prijavu možete detaljno pregledati, stupiti u kontakt sa tom osobom i jednim klikom je odobriti u glavnu bazu ili odbiti.",
    tab: "pending",
    elementId: "sidebar-tab-pending",
  },
  {
    title: "6. Biračka mesta (BM) 🗳️",
    description: "Pregled i upravljanje svim biračkim mestima na teritoriji opštine. Svako biračko mesto ima detaljne informacije o lokaciji, broju upisanih birača, kao i automatski obračunatu pokrivenost kontrolorima radi lakšeg praćenja deficita.",
    tab: "bm",
    elementId: "sidebar-tab-bm",
  },
  {
    title: "7. Mobilni timovi (MT) 🚗",
    description: "Formiranje i logistika brzih mobilnih timova koji su zaduženi za podršku na terenu tokom izbornog dana. Ovde definišete koordinate, dodeljujete vozače, vozila i koordinatore timova radi brze reakcije.",
    tab: "mt",
    elementId: "sidebar-tab-mt",
  },
  {
    title: "8. Raspoređivanje na dužnosti 🎯",
    description: "Interaktivni radni prostor na kome možete direktno dodeljivati ljude iz baze na biračka mesta ili u mobilne timove. Sistem u realnom vremenu vizuelno signalizira gde imamo deficit, a gde suficit ljudstva.",
    tab: "assign",
    elementId: "sidebar-tab-assign",
  },
  {
    title: "9. Evidencija i statusi obuka 🎓",
    description: "Praćenje obuka koje organizujete. Sistem podržava tri ključna tipa obuke: za kontrolore, za vdv (od vrata do vrata) i za call centar. Možete voditi tabelarni prozivnik prisustva, unositi komentare i pratiti ko je uspešno prošao obuku.",
    tab: "obuke",
    elementId: "sidebar-tab-obuke",
  },
  {
    title: "10. Komunikacija i dnevnici kontakata 📞",
    description: "Sistem za praćenje svih telefonskih poziva i direktne komunikacije. Ovde beležite svaki razgovor, ishod poziva (nedostupan, potvrdio dolazak, odbio), i upisujete detaljne beleške kako bi ceo tim bio u toku.",
    tab: "komunikacija",
    elementId: "sidebar-tab-komunikacija",
  },
  {
    title: "11. Finansije i Donacije 🪙",
    description: "Transparentno finansijsko poslovanje opštine. Ovde vodite evidenciju svih uplaćenih donacija, troškova za materijal, gorivo, zakup kancelarija i isplate dnevnih naknada, uz automatski obračun ukupnog budžeta i preostalog salda.",
    tab: "finansije",
    elementId: "sidebar-tab-finansije",
  },
  {
    title: "12. Teren i eCanvasser ankete 🗺️",
    description: "Praćenje aktivnosti na terenu i rad od vrata do vrata (door-to-door). Ovde možete simulirati anketiranje birača na mapi, beležiti sigurne glasove, raspoloženje građana i pratiti procente uspešnosti po biračkim mestima.",
    tab: "ecanvasser",
    elementId: "sidebar-tab-ecanvasser",
  }
];

export default function App() {
  // --- Persistent States ---
  const [people, setPeople] = useState<Person[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [pending, setPending] = useState<PendingPerson[]>([]);
  const [bm, setBm] = useState<BirackoMesto[]>([]);
  const [mt, setMt] = useState<MobilniTim[]>([]);
  const [obuke, setObuke] = useState<Obuka[]>([]);
  const [kontakti, setKontakti] = useState<Kontakt[]>([]);
  const [finansije, setFinansije] = useState<FinansijskaStavka[]>([]);

  // --- Digital Guide / Tour State ---
  const [tourStep, setTourStep] = useState<number | null>(null);

  const getTourOrActiveClasses = (tabName: string, stepIndex: number) => {
    if (tourStep !== null) {
      if (tourStep === stepIndex) {
        return 'ring-2 ring-blue-500 bg-[#1b202a] text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] font-bold scale-[1.02] relative z-50';
      }
      return 'text-[#9aa3b2] opacity-20 blur-[1px] pointer-events-none';
    }
    return currentTab === tabName
      ? 'bg-[#1b202a] text-white font-bold'
      : 'text-[#9aa3b2] hover:text-white hover:bg-white/2';
  };

  // --- Mobile Responsive Sidebar Menu Toggle ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Core Layout/Role Switcher State ---
  const [role, setRole] = useState<'coord' | 'team'>('coord');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedOpstina, setSelectedOpstina] = useState<string>(() => {
    return localStorage.getItem('struktura_selected_opstina') || 'Novi Beograd';
  });

  const getStorageKey = (baseKey: string) => {
    if (selectedOpstina === 'Vračar') {
      return baseKey;
    }
    const suffix = selectedOpstina.toLowerCase().replace(/\s+/g, '_');
    return `${baseKey}_${suffix}`;
  };

  // --- Ljudi Screen Filtering & Sorting State ---
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    uloga: '',
    status: '',
    faza: '',
    reon: '',
    auto: null,
    iskustvo: null,
    obukaOsnovna: null,
    obukaNapredna: null,
    rasporedjen: null,
    poreklo: '',
    odPoverenja: null
  });

  const [sortState, setSortState] = useState<SortState>({
    field: 'imePrezime',
    order: 'asc'
  });

  // --- UI Interactivity State ---
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // --- Modals State ---
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [showResetDropdown, setShowResetDropdown] = useState(false);

  // --- Column Visibility State (Webflow CRM style) ---
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('struktura_visible_columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      imePrezime: true,
      uloga: true,
      status: true,
      faza: true,
      bm: true,
      telefon: true,
      email: true
    };
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const isColumnVisible = (key: string) => visibleColumns[key] !== false;

  const toggleColumnVisibility = (key: string) => {
    const newVal = !isColumnVisible(key);
    const updated = {
      ...visibleColumns,
      [key]: newVal
    };
    setVisibleColumns(updated);
    localStorage.setItem('struktura_visible_columns', JSON.stringify(updated));
  };

  const ALL_COLUMNS = [
    { key: 'imePrezime', label: 'Ime i prezime' },
    { key: 'uloga', label: 'Uloga' },
    { key: 'status', label: 'Status' },
    { key: 'faza', label: 'Faza' },
    { key: 'bm', label: 'Biračko mesto' },
    { key: 'telefon', label: 'Telefon' },
    { key: 'email', label: 'Email' },
    ...customFields.map((cf) => ({ key: cf.key, label: cf.label }))
  ];

  // --- Import Preview State ---
  const [importPreviewPeople, setImportPreviewPeople] = useState<Partial<Person>[]>([]);
  const [importPreviewErrors, setImportPreviewErrors] = useState<string[]>([]);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [isImportNoticeOpen, setIsImportNoticeOpen] = useState(false);

  // --- Toast/Notification State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initial Database Loading Loop ---
  useEffect(() => {
    const keyPeople = getStorageKey('struktura_people');
    const keyFields = getStorageKey('struktura_custom_fields');
    const keyPending = getStorageKey('struktura_pending');
    const keyBm = getStorageKey('struktura_bm');
    const keyMt = getStorageKey('struktura_mt');
    const keyObuke = getStorageKey('struktura_obuke');
    const keyKontakti = getStorageKey('struktura_kontakti');
    const keyFinansije = getStorageKey('struktura_finansije');

    const savedPeople = localStorage.getItem(keyPeople);
    const savedFields = localStorage.getItem(keyFields);
    const savedPending = localStorage.getItem(keyPending);
    const savedBm = localStorage.getItem(keyBm);
    const savedMt = localStorage.getItem(keyMt);
    const savedObuke = localStorage.getItem(keyObuke);
    const savedKontakti = localStorage.getItem(keyKontakti);
    const savedFinansije = localStorage.getItem(keyFinansije);
    const savedRole = localStorage.getItem('struktura_role');
    const savedTab = localStorage.getItem('struktura_tab');

    // Get customized initial data
    const initPeople = getInitialPeopleForOpstina(selectedOpstina);
    const initFields = INITIAL_CUSTOM_FIELDS;
    const initPending = getInitialPendingForOpstina(selectedOpstina);
    const initBm = getInitialBmForOpstina(selectedOpstina);
    const initMt = getInitialMtForOpstina(selectedOpstina);
    const initObuke = getInitialObukeForOpstina(selectedOpstina);
    const initKontakti = getInitialKontaktiForOpstina(selectedOpstina);
    const initFinansije = getInitialFinansijeForOpstina(selectedOpstina);

    let loadedPeople: Person[] = savedPeople ? JSON.parse(savedPeople) : initPeople;
    let loadedFields: CustomField[] = savedFields ? JSON.parse(savedFields) : initFields;

    // Automatsko čišćenje "velicinaMajice" ukoliko postoji u lokalnoj memoriji
    if (loadedFields.some(f => f.key === 'velicinaMajice')) {
      loadedFields = loadedFields.filter(f => f.key !== 'velicinaMajice');
      loadedPeople = loadedPeople.map(p => {
        const { velicinaMajice, ...rest } = p;
        return rest;
      });
      localStorage.setItem(keyFields, JSON.stringify(loadedFields));
      localStorage.setItem(keyPeople, JSON.stringify(loadedPeople));
    }

    let loadedObuke: Obuka[] = savedObuke ? JSON.parse(savedObuke) : initObuke;
    // Ako postoje stare zastarele obuke, zameniti ih sa nove tri standardne obuke
    if (loadedObuke.some(o => o.naziv.toLowerCase().includes('posmatrač') || o.naziv.toLowerCase().includes('zapisnic') || o.naziv.toLowerCase().includes('osnovna') || o.naziv.toLowerCase().includes('napredna'))) {
      loadedObuke = initObuke;
      localStorage.setItem(keyObuke, JSON.stringify(loadedObuke));
    }

    setPeople(loadedPeople);
    setCustomFields(loadedFields);
    setPending(savedPending ? JSON.parse(savedPending) : initPending);
    setBm(savedBm ? JSON.parse(savedBm) : initBm);
    setMt(savedMt ? JSON.parse(savedMt) : initMt);
    setObuke(loadedObuke);
    setKontakti(savedKontakti ? JSON.parse(savedKontakti) : initKontakti);
    setFinansije(savedFinansije ? JSON.parse(savedFinansije) : initFinansije);
    
    if (savedRole === 'team') setRole('team');
    if (savedTab) setCurrentTab(savedTab);

    // Initial state seed to localStorage if not exists
    if (!savedPeople) localStorage.setItem(keyPeople, JSON.stringify(initPeople));
    if (!savedFields) localStorage.setItem(keyFields, JSON.stringify(initFields));
    if (!savedPending) localStorage.setItem(keyPending, JSON.stringify(initPending));
    if (!savedBm) localStorage.setItem(keyBm, JSON.stringify(initBm));
    if (!savedMt) localStorage.setItem(keyMt, JSON.stringify(initMt));
    if (!savedObuke) localStorage.setItem(keyObuke, JSON.stringify(initObuke));
    if (!savedKontakti) localStorage.setItem(keyKontakti, JSON.stringify(initKontakti));
    if (!savedFinansije) localStorage.setItem(keyFinansije, JSON.stringify(initFinansije));

    const savedTourCompleted = localStorage.getItem('struktura_tour_completed');
    if (savedTourCompleted !== 'true') {
      setTimeout(() => {
        setTourStep(0);
      }, 1200);
    }
  }, [selectedOpstina]);

  // --- Notification Toast Trigger ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- Digital Guide / Tour Helpers ---
  const handleGoToStep = (step: number) => {
    if (step < 0 || step >= TOUR_STEPS.length) return;
    setTourStep(step);
    const targetTab = TOUR_STEPS[step].tab;
    if (targetTab) {
      setCurrentTab(targetTab);
      localStorage.setItem('struktura_tab', targetTab);
    }
  };

  const handleCompleteTour = () => {
    setTourStep(null);
    localStorage.setItem('struktura_tour_completed', 'true');
    triggerToast("Digitalni vodič je uspešno završen!");
  };

  const handleSkipTour = () => {
    setTourStep(null);
    localStorage.setItem('struktura_tour_completed', 'true');
    triggerToast("Digitalna tura je isključena.");
  };

  const handleResetTour = () => {
    setTourStep(0);
    setCurrentTab('dashboard');
    localStorage.setItem('struktura_tab', 'dashboard');
    triggerToast("Digitalni vodič je ponovo pokrenut!");
  };

  // --- Database Sync State Helpers ---
  const updatePeopleDatabase = (newList: Person[]) => {
    setPeople(newList);
    localStorage.setItem(getStorageKey('struktura_people'), JSON.stringify(newList));
  };

  const updatePendingDatabase = (newList: PendingPerson[]) => {
    setPending(newList);
    localStorage.setItem(getStorageKey('struktura_pending'), JSON.stringify(newList));
  };

  const updateBmDatabase = (newList: BirackoMesto[]) => {
    setBm(newList);
    localStorage.setItem(getStorageKey('struktura_bm'), JSON.stringify(newList));
  };

  const updateMtDatabase = (newList: MobilniTim[]) => {
    setMt(newList);
    localStorage.setItem(getStorageKey('struktura_mt'), JSON.stringify(newList));
  };

  const updateObukeDatabase = (newList: Obuka[]) => {
    setObuke(newList);
    localStorage.setItem(getStorageKey('struktura_obuke'), JSON.stringify(newList));
  };

  const updateKontaktiDatabase = (newList: Kontakt[]) => {
    setKontakti(newList);
    localStorage.setItem(getStorageKey('struktura_kontakti'), JSON.stringify(newList));
  };

  const updateFinansijeDatabase = (newList: FinansijskaStavka[]) => {
    setFinansije(newList);
    localStorage.setItem(getStorageKey('struktura_finansije'), JSON.stringify(newList));
  };

  const updateCustomFieldsDatabase = (newList: CustomField[]) => {
    setCustomFields(newList);
    localStorage.setItem(getStorageKey('struktura_custom_fields'), JSON.stringify(newList));
  };

  const handleRoleChange = (newRole: 'coord' | 'team') => {
    setRole(newRole);
    localStorage.setItem('struktura_role', newRole);
    triggerToast(`Režim rada promenjen na: ${newRole === 'coord' ? 'Regionalni koordinator' : 'Član opštinskog tima'}`);
  };

  const handleTabChange = (newTab: string) => {
    setCurrentTab(newTab);
    localStorage.setItem('struktura_tab', newTab);
    setIsMobileMenuOpen(false);
  };

  // --- CRUD Handlers (Ljudi screen) ---
  const handleSavePerson = (savedPerson: Person) => {
    const exists = people.some((p) => p.id === savedPerson.id);
    let updated: Person[];
    if (exists) {
      updated = people.map((p) => (p.id === savedPerson.id ? savedPerson : p));
      triggerToast(`Uspšno izmenjeni podaci za: ${savedPerson.imePrezime}`);
    } else {
      updated = [savedPerson, ...people];
      triggerToast(`Uspšno dodata osoba: ${savedPerson.imePrezime}`);
    }
    updatePeopleDatabase(updated);
    setIsPersonModalOpen(false);
    setSelectedPerson(null);
  };

  const handleDeletePerson = (id: string) => {
    const personToDelete = people.find((p) => p.id === id);
    const updated = people.filter((p) => p.id !== id);
    updatePeopleDatabase(updated);
    
    // Clear selections and assignment references
    const newSelected = new Set(selectedRows);
    newSelected.delete(id);
    setSelectedRows(newSelected);

    // Clean references in BM
    const cleanedBm = bm.map(b => ({
      ...b,
      sefBM: b.sefBM.filter(pid => pid !== id),
      kontrolori: b.kontrolori.filter(pid => pid !== id)
    }));
    updateBmDatabase(cleanedBm);

    // Clean references in MT
    const cleanedMt = mt.map(m => ({
      ...m,
      sefMT: m.sefMT.filter(pid => pid !== id),
      clanovi: m.clanovi.filter(pid => pid !== id)
    }));
    updateMtDatabase(cleanedMt);

    setIsPersonModalOpen(false);
    setSelectedPerson(null);
    triggerToast(`Obrisan/a: ${personToDelete?.imePrezime || 'korisnik'}`);
  };

  // --- Bulk Actions ---
  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (confirm(`Da li ste sigurni da želite obrisati selektovane osobe (${selectedRows.size})?`)) {
      const updated = people.filter((p) => !selectedRows.has(p.id));
      updatePeopleDatabase(updated);

      // Clean BM references
      const cleanedBm = bm.map(b => ({
        ...b,
        sefBM: b.sefBM.filter(pid => !selectedRows.has(pid)),
        kontrolori: b.kontrolori.filter(pid => !selectedRows.has(pid))
      }));
      updateBmDatabase(cleanedBm);

      // Clean MT references
      const cleanedMt = mt.map(m => ({
        ...m,
        sefMT: m.sefMT.filter(pid => !selectedRows.has(pid)),
        clanovi: m.clanovi.filter(pid => !selectedRows.has(pid))
      }));
      updateMtDatabase(cleanedMt);

      setSelectedRows(new Set());
      setIsSelecting(false);
      triggerToast(`Uspešno obrisano ${selectedRows.size} osoba.`);
    }
  };

  // --- Custom Fields ---
  const handleAddCustomField = (newField: CustomField) => {
    const updated = [...customFields, newField];
    updateCustomFieldsDatabase(updated);
    triggerToast(`Dodata nova kolona: ${newField.label}`);
  };

  const handleRemoveCustomField = (key: string) => {
    const fieldToRemove = customFields.find((cf) => cf.key === key);
    const updatedFields = customFields.filter((cf) => cf.key !== key);
    
    // Wipe key from objects
    const updatedPeople = people.map((p) => {
      const clone = { ...p };
      delete clone[key];
      return clone;
    });

    updateCustomFieldsDatabase(updatedFields);
    updatePeopleDatabase(updatedPeople);
    triggerToast(`Obrisana kolona: ${fieldToRemove?.label || key}`);
  };

  // --- Excel Import/Export handlers ---
  const handleExportClick = () => {
    exportToExcel(people, customFields);
    triggerToast('Preuzimanje Excel tabele je započeto...');
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importFromExcel(file, customFields)
      .then(({ people: importedData, errors }) => {
        setImportPreviewPeople(importedData);
        setImportPreviewErrors(errors);
        setIsImportPreviewOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
      })
      .catch((err) => {
        triggerToast(`Greška pri učitavanju: ${err}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  const handleConfirmImport = (mode: 'append' | 'replace') => {
    const defaultFields = {
      auto: false,
      iskustvo: false,
      obukaOsnovna: false,
      obukaNapredna: false,
      rasporedjen: false,
      napomene: 'Uvezeno iz Excela',
      faza: 'Kontaktiran',
      status: 'kontaktiran'
    };

    const newPeopleToInsert: Person[] = importPreviewPeople.map((d, index) => ({
      ...(defaultFields as any),
      ...d,
      id: `EX-${Date.now()}-${index}`
    }));

    const combined = mode === 'replace' ? newPeopleToInsert : [...newPeopleToInsert, ...people];
    updatePeopleDatabase(combined);
    setIsImportPreviewOpen(false);
    setImportPreviewPeople([]);
    setImportPreviewErrors([]);
    triggerToast(`Uspešno uvezeno ${newPeopleToInsert.length} osoba u bazu.`);
  };


  // --- Pending approvals state engine ---
  const handleApprovePending = (item: PendingPerson) => {
    // Check duplication by phone or email
    const duplicate = people.some(p => p.telefon === item.tel || (item.email && p.email === item.email));
    
    if (duplicate) {
      if (!confirm(`Osoba sa telefonom ${item.tel} ili emailom ${item.email} već postoji u bazi. Želite li ipak da je upišete?`)) {
        return;
      }
    }

    const promotedPerson: Person = {
      id: `P-${Date.now()}`,
      imePrezime: `${item.ime} ${item.prezime}`,
      uloga: item.uloga,
      status: 'potvrđen',
      faza: 'Potvrđen',
      reon: '',
      bm: item.bmGlasa,
      telefon: item.tel,
      email: item.email,
      auto: item.auto,
      iskustvo: item.iskustvo,
      obukaOsnovna: false,
      obukaNapredna: false,
      rasporedjen: false,
      napomene: item.napomene || 'Prijavljen/a preko online signup forme.'
    };

    // Update lists
    updatePeopleDatabase([promotedPerson, ...people]);
    updatePendingDatabase(pending.filter(p => p.id !== item.id));
    triggerToast(`Prijava odobrena. ${promotedPerson.imePrezime} je upisan/a u primarnu bazu.`);
  };

  const handleRejectPending = (id: string) => {
    const toRemove = pending.find(p => p.id === id);
    if (confirm(`Da li ste sigurni da želite obrisati prijavu kandidata ${toRemove?.ime} ${toRemove?.prezime}?`)) {
      updatePendingDatabase(pending.filter(p => p.id !== id));
      triggerToast('Prijava je odbijena i obrisana.');
    }
  };

  // --- Biračka Mesta additions/removals ---
  const handleAddBM = (newBM: BirackoMesto) => {
    updateBmDatabase([...bm, newBM]);
    triggerToast(`Dodato biračko mesto BM ${newBM.broj}`);
  };

  const handleDeleteBM = (broj: string) => {
    updateBmDatabase(bm.filter(b => b.broj !== broj));
    
    // Clear references from assigned people
    const updatedPeople = people.map(p => {
      if (p.bm === broj) {
        return { ...p, bm: '', rasporedjen: false };
      }
      return p;
    });
    updatePeopleDatabase(updatedPeople);
    triggerToast(`Uklonjeno biračko mesto ${broj}`);
  };

  // --- Mobilni Timovi additions/removals ---
  const handleAddMT = (newMT: MobilniTim) => {
    updateMtDatabase([...mt, newMT]);
    triggerToast(`Kreiran mobilni tim: Tim ${newMT.id}`);
  };

  const handleDeleteMT = (id: string) => {
    updateMtDatabase(mt.filter(m => m.id !== id));
    triggerToast(`Uklonjen mobilni tim ${id}`);
  };

  // --- Assignment Workflows (Sychronize assignments) ---
  const handleAssign = (
    pid: string,
    tipAngazmana: 'Kontrola izbora' | 'VDV' | 'Call centar' | 'Logistika',
    targetId: string,
    targetRole: string,
    dodatneOpcije?: { jeStudent?: 'Da' | 'Ne' }
  ) => {
    const personToAssign = people.find(p => p.id === pid);
    if (!personToAssign) return;

    // Clean up old assignments of this person first
    let cleanedBm = bm.map(b => ({
      ...b,
      sefBM: b.sefBM.filter(id => id !== pid),
      kontrolori: b.kontrolori.filter(id => id !== pid)
    }));

    let cleanedMt = mt.map(m => ({
      ...m,
      sefMT: m.sefMT.filter(id => id !== pid),
      clanovi: m.clanovi.filter(id => id !== pid)
    }));

    // Perform new assignment insertion if tipAngazmana is Kontrola izbora
    if (tipAngazmana === 'Kontrola izbora') {
      cleanedBm = cleanedBm.map(b => {
        if (b.broj === targetId) {
          if (targetRole === 'sef_bm') {
            return {
              ...b,
              sefBM: [...b.sefBM.filter(id => id !== pid), pid]
            };
          } else {
            return {
              ...b,
              kontrolori: [...b.kontrolori.filter(id => id !== pid), pid]
            };
          }
        }
        return b;
      });
    }

    // Update Person record
    const updatedPeople = people.map(p => {
      if (p.id === pid) {
        return {
          ...p,
          rasporedjen: true,
          bm: tipAngazmana === 'Kontrola izbora' ? targetId : '',
          tipAngazmana: tipAngazmana,
          dodelaBM: tipAngazmana === 'Kontrola izbora' ? targetId : undefined,
          dodelaUloga: tipAngazmana === 'Kontrola izbora' ? targetRole : undefined,
          jeStudent: tipAngazmana === 'VDV' ? (dodatneOpcije?.jeStudent || 'Ne') : undefined,
          faza: 'Raspoređen'
        };
      }
      return p;
    });

    // Save
    updatePeopleDatabase(updatedPeople);
    updateBmDatabase(cleanedBm);
    updateMtDatabase(cleanedMt);
    triggerToast(`Korisnik ${personToAssign.imePrezime} uspešno raspoređen.`);
  };

  const handleRemoveAssignment = (pid: string) => {
    const personObj = people.find(p => p.id === pid);
    if (!personObj) return;

    // Clean lists
    const cleanedBm = bm.map(b => ({
      ...b,
      sefBM: b.sefBM.filter(id => id !== pid),
      kontrolori: b.kontrolori.filter(id => id !== pid)
    }));

    const cleanedMt = mt.map(m => ({
      ...m,
      sefMT: m.sefMT.filter(id => id !== pid),
      clanovi: m.clanovi.filter(id => id !== pid)
    }));

    // Update Person
    const updatedPeople = people.map(p => {
      if (p.id === pid) {
        return {
          ...p,
          rasporedjen: false,
          bm: '',
          faza: 'Potvrđen'
        };
      }
      return p;
    });

    updatePeopleDatabase(updatedPeople);
    updateBmDatabase(cleanedBm);
    updateMtDatabase(cleanedMt);
    triggerToast(`Uklonjen raspored za volontera ${personObj.imePrezime}`);
  };

  // --- Obuka Training updates ---
  const handleAddObuka = (newObuka: Obuka) => {
    updateObukeDatabase([...obuke, newObuka]);
    triggerToast(`Zakažana nova obuka: ${newObuka.naziv}`);
  };

  const handleDeleteObuka = (obukaId: string) => {
    const updatedObuke = obuke.filter(o => o.id !== obukaId);
    updateObukeDatabase(updatedObuke);
    triggerToast('Obuka je izbrisana.');
  };

  const handleUpdateAttendance = (obukaId: string, pid: string, status: 'pozvan' | 'prisustvovao' | 'nije prisustvovao', komentar?: string) => {
    const updatedObuke = obuke.map(o => {
      if (o.id === obukaId) {
        const exists = o.ucesnici.some(u => u.pid === pid);
        const nextUcesnici = exists
          ? o.ucesnici.map(u => u.pid === pid ? { ...u, status, komentar: komentar || '' } : u)
          : [...o.ucesnici, { pid, status, komentar: komentar || '' }];
        return {
          ...o,
          ucesnici: nextUcesnici
        };
      }
      return o;
    });

    updateObukeDatabase(updatedObuke);

    // If marked as 'prisustvovao', immediately upgrade their flags in people db!
    if (status === 'prisustvovao') {
      const activeObuka = updatedObuke.find(o => o.id === obukaId);
      const isOsnovna = activeObuka?.naziv.toLowerCase().includes('osnovn') || activeObuka?.naziv.toLowerCase().includes('kontrolor');
      const isNapredna = activeObuka?.naziv.toLowerCase().includes('napredn') || activeObuka?.naziv.toLowerCase().includes('vdv') || activeObuka?.naziv.toLowerCase().includes('call') || activeObuka?.naziv.toLowerCase().includes('kol');

      const updatedPeople = people.map(p => {
        if (p.id === pid) {
          return {
            ...p,
            obukaOsnovna: isOsnovna ? true : p.obukaOsnovna,
            obukaNapredna: isNapredna ? true : p.obukaNapredna,
            faza: isNapredna ? 'Prošao naprednu obuku' : isOsnovna ? 'Prošao osnovnu obuku' : p.faza
          };
        }
        return p;
      });
      updatePeopleDatabase(updatedPeople);
    }
  };

  // --- Komunikacija logger ---
  const handleAddKontakt = (newKontakt: Kontakt, nextStatus?: string) => {
    updateKontaktiDatabase([newKontakt, ...kontakti]);

    if (nextStatus) {
      const updatedPeople = people.map(p => {
        if (p.id === newKontakt.pid) {
          return {
            ...p,
            status: nextStatus,
            faza: nextStatus === 'potvrđen' ? 'Potvrdio učešće' : p.faza
          };
        }
        return p;
      });
      updatePeopleDatabase(updatedPeople);
    }
    triggerToast('Zabeležen razgovor i uspešno sačuvan u bazu.');
  };

  // --- Finansije additions/removals ---
  const handleAddStavka = (newStavka: FinansijskaStavka) => {
    updateFinansijeDatabase([newStavka, ...finansije]);
    triggerToast('Stavka upisana u blagajnu.');
  };

  const handleDeleteStavka = (id: string) => {
    updateFinansijeDatabase(finansije.filter(f => f.id !== id));
    triggerToast('Stavka obrisana iz blagajne.');
  };

  // --- Database System Resets ---
  const handleReset = (type: 'all' | 'people' | 'assignments' | 'finances') => {
    if (type === 'all') {
      if (confirm(`Da li ste sigurni da želite obrisati bazu podataka za opštinu ${selectedOpstina}? Sve promene za ovu opštinu će biti izgubljene.`)) {
        const initPeople = getInitialPeopleForOpstina(selectedOpstina);
        const initFields = INITIAL_CUSTOM_FIELDS;
        const initPending = getInitialPendingForOpstina(selectedOpstina);
        const initBm = getInitialBmForOpstina(selectedOpstina);
        const initMt = getInitialMtForOpstina(selectedOpstina);
        const initObuke = getInitialObukeForOpstina(selectedOpstina);
        const initKontakti = getInitialKontaktiForOpstina(selectedOpstina);
        const initFinansije = getInitialFinansijeForOpstina(selectedOpstina);

        setPeople(initPeople);
        setCustomFields(initFields);
        setPending(initPending);
        setBm(initBm);
        setMt(initMt);
        setObuke(initObuke);
        setKontakti(initKontakti);
        setFinansije(initFinansije);

        localStorage.setItem(getStorageKey('struktura_people'), JSON.stringify(initPeople));
        localStorage.setItem(getStorageKey('struktura_custom_fields'), JSON.stringify(initFields));
        localStorage.setItem(getStorageKey('struktura_pending'), JSON.stringify(initPending));
        localStorage.setItem(getStorageKey('struktura_bm'), JSON.stringify(initBm));
        localStorage.setItem(getStorageKey('struktura_mt'), JSON.stringify(initMt));
        localStorage.setItem(getStorageKey('struktura_obuke'), JSON.stringify(initObuke));
        localStorage.setItem(getStorageKey('struktura_kontakti'), JSON.stringify(initKontakti));
        localStorage.setItem(getStorageKey('struktura_finansije'), JSON.stringify(initFinansije));
        
        triggerToast(`Baza podataka za opštinu ${selectedOpstina} je resetovana.`);
      }
    } else if (type === 'people') {
      if (confirm(`Da li želite da resetujete samo listu Ljudi za opštinu ${selectedOpstina}?`)) {
        updatePeopleDatabase(getInitialPeopleForOpstina(selectedOpstina));
        triggerToast('Spisak ljudi je resetovan.');
      }
    } else if (type === 'assignments') {
      if (confirm('Da li želite da poništite sve rasporede na biračkim mestima i mobilnim timovima?')) {
        const resetBm = bm.map(b => ({ ...b, sefBM: [], kontrolori: [] }));
        const resetMt = mt.map(m => ({ ...m, sefMT: [], clanovi: [] }));
        const resetPeople = people.map(p => ({ ...p, rasporedjen: false, bm: '' }));
        
        updateBmDatabase(resetBm);
        updateMtDatabase(resetMt);
        updatePeopleDatabase(resetPeople);
        triggerToast('Svi rasporedi su poništeni.');
      }
    } else if (type === 'finances') {
      if (confirm('Da li želite da resetujete finansijsku knjigu na početno stanje?')) {
        updateFinansijeDatabase(INITIAL_FINANSIJE);
        triggerToast('Finansijska knjiga je resetovana.');
      }
    }
    setShowResetDropdown(false);
  };

  // --- Filtering & Sorting execution for the primary table ---
  const handleToggleSort = (field: SortField) => {
    let order: SortOrder = 'asc';
    if (sortState.field === field) {
      if (sortState.order === 'asc') order = 'desc';
      else if (sortState.order === 'desc') order = null;
    }
    setSortState({ field, order });
  };

  const filteredAndSortedPeople = React.useMemo(() => {
    let result = [...people];

    // Search query match
    if (filters.q) {
      const qLower = filters.q.toLowerCase();
      result = result.filter(
        (p) =>
          p.imePrezime.toLowerCase().includes(qLower) ||
          p.telefon.includes(qLower) ||
          (p.email && p.email.toLowerCase().includes(qLower)) ||
          p.bm.includes(qLower) ||
          p.uloga.toLowerCase().includes(qLower)
      );
    }

    // Role filter
    if (filters.uloga) {
      if (filters.uloga === 'bez uloge') {
        result = result.filter((p) => !p.uloga || p.uloga.trim() === '' || p.uloga.toLowerCase() === 'bez uloge');
      } else {
        result = result.filter((p) => {
          if (!p.uloga) return false;
          const roles = p.uloga.toLowerCase().split(',').map((r) => r.trim());
          return roles.includes(filters.uloga.toLowerCase());
        });
      }
    }

    // Status filter
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }

    // Stage filter
    if (filters.faza) {
      result = result.filter((p) => p.faza === filters.faza);
    }

    // Boolean checks
    if (filters.auto !== null) {
      result = result.filter((p) => p.auto === filters.auto);
    }
    if (filters.iskustvo !== null) {
      result = result.filter((p) => p.iskustvo === filters.iskustvo);
    }
    if (filters.obukaOsnovna !== null) {
      result = result.filter((p) => p.obukaOsnovna === filters.obukaOsnovna);
    }
    if (filters.obukaNapredna !== null) {
      result = result.filter((p) => p.obukaNapredna === filters.obukaNapredna);
    }
    if (filters.rasporedjen !== null) {
      result = result.filter((p) => p.rasporedjen === filters.rasporedjen);
    }
    if (filters.poreklo) {
      result = result.filter((p) => p.poreklo === filters.poreklo);
    }
    if (filters.odPoverenja !== null) {
      result = result.filter((p) => !!p.odPoverenja === filters.odPoverenja);
    }

    // Sorting block
    const { field, order } = sortState;
    if (field && order) {
      result.sort((a, b) => {
        let valA = a[field] ?? '';
        let valB = b[field] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [people, filters, sortState]);

  // Handle Multi selection toggles
  const handleToggleSelectAll = () => {
    if (selectedRows.size === filteredAndSortedPeople.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAndSortedPeople.map((p) => p.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  // Check read-only state for current role
  const isReadOnly = role === 'team';

  return (
    <div className="min-h-screen bg-[#090b0f] text-gray-100 flex font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#0c0e12] border-r border-[#1e222b] flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } flex-shrink-0 ${tourStep !== null && tourStep !== 0 ? 'z-50' : 'z-40'}`}>
        
        {/* Upper Sidebar Header */}
        <div className="transition-all duration-300 flex-1 flex flex-col min-h-0">
          {/* Logo Branding */}
          <div className={`p-6 border-b border-[#1e222b] flex items-center justify-between transition-all duration-300 ${
            tourStep !== null && tourStep !== 0 ? 'blur-[1.5px] opacity-20 pointer-events-none' : ''
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base">
                K
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white leading-none font-sans">KOORDINATOR</h1>
                <p className="text-[10px] text-[#9aa3b2] mt-1 uppercase tracking-widest font-semibold">Opština {selectedOpstina}</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 md:hidden"
              title="Zatvori meni"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

            {/* Role Switcher Widget */}
            <div 
              id="role-switcher-tour" 
              className={`mt-5 mx-4 p-2.5 bg-[#101318] rounded-xl border transition-all duration-300 ${
                tourStep === 1 
                  ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.35)] relative z-50 bg-[#161a22] scale-[1.02]' 
                  : tourStep !== null && tourStep !== 0
                    ? 'border-[#1e222b] blur-[1.5px] opacity-20 pointer-events-none'
                    : 'border-[#1e222b]'
              }`}
            >
              <div className="text-[9px] text-[#9aa3b2] uppercase tracking-wider font-extrabold mb-1.5 px-1">Režim pristupa</div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleRoleChange('coord')}
                  className={`w-full py-2 px-2.5 text-[11px] font-bold rounded-lg text-left transition-all flex items-center justify-between ${
                    role === 'coord'
                      ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-extrabold'
                      : 'text-gray-400 hover:text-white hover:bg-white/2 border border-transparent'
                  }`}
                >
                  <span>Regionalni koordinator</span>
                  {role === 'coord' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
                <button
                  onClick={() => handleRoleChange('team')}
                  className={`w-full py-2 px-2.5 text-[11px] font-bold rounded-lg text-left transition-all flex items-center justify-between ${
                    role === 'team'
                      ? 'bg-amber-600/15 border border-amber-500/30 text-amber-400 font-extrabold'
                      : 'text-gray-400 hover:text-white hover:bg-white/2 border border-transparent'
                  }`}
                >
                  <span>Član opštinskog tima</span>
                  {role === 'team' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              </div>
            </div>

            {/* Active Municipality Selector for Coordinator Mode */}
            {role === 'coord' && (
              <div 
                className={`mt-4 mx-4 p-3 bg-[#101318] rounded-xl border border-[#1e222b] transition-all duration-300 ${
                  tourStep !== null && tourStep !== 0 ? 'blur-[1.5px] opacity-20 pointer-events-none' : ''
                }`}
              >
                <div className="text-[9px] text-[#9aa3b2] uppercase tracking-wider font-extrabold mb-1.5 px-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>Aktivna opština</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedOpstina}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedOpstina(val);
                      localStorage.setItem('struktura_selected_opstina', val);
                      triggerToast(`Učitana baza podataka za opštinu: ${val}`);
                    }}
                    className="w-full bg-[#161a22] hover:bg-[#1b202a] text-xs font-bold text-white rounded-lg px-2.5 py-2 border border-[#232935] cursor-pointer transition-colors focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    {OPSTINE.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#9aa3b2]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

          {/* Navigation Links */}
          <nav className="p-4 space-y-5 overflow-y-auto">
            {/* Group: PREGLED */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-extrabold text-[#9aa3b2] uppercase tracking-wider px-3 transition-all duration-300 ${
                tourStep !== null ? 'opacity-20' : ''
              }`}>Pregled i Analitika</div>
              <button
                id="sidebar-tab-dashboard"
                onClick={() => handleTabChange('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('dashboard', 2)}`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Kontrolna tabla</span>
              </button>

              <button
                id="sidebar-tab-kalendar"
                onClick={() => handleTabChange('kalendar')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('kalendar', 3)}`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Kalendar i Taskovi</span>
              </button>
            </div>

            {/* Group: EVIDENCIJA */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-extrabold text-[#9aa3b2] uppercase tracking-wider px-3 transition-all duration-300 ${
                tourStep !== null ? 'opacity-20' : ''
              }`}>Regrutacija & Ljudi</div>
              
              {/* Ljudi / Core list */}
              <button
                id="sidebar-tab-people"
                onClick={() => handleTabChange('people')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('people', 4)}`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Spisak ljudi (Baza)</span>
              </button>

              {/* Form Pending submissions */}
              <button
                id="sidebar-tab-pending"
                onClick={() => handleTabChange('pending')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('pending', 5)}`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4.5 h-4.5" />
                  <span>Nove prijave</span>
                </div>
                {pending.length > 0 && (
                  <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                )}
              </button>

              {/* Polling Stations */}
              <button
                id="sidebar-tab-bm"
                onClick={() => handleTabChange('bm')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('bm', 6)}`}
              >
                <MapPin className="w-4.5 h-4.5" />
                <span>Biračka mesta (BM)</span>
              </button>

              {/* Mobile Teams */}
              <button
                id="sidebar-tab-mt"
                onClick={() => handleTabChange('mt')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('mt', 7)}`}
              >
                <Truck className="w-4.5 h-4.5" />
                <span>Mobilni timovi (MT)</span>
              </button>
            </div>

            {/* Group: OPERACIJE */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-extrabold text-[#9aa3b2] uppercase tracking-wider px-3 transition-all duration-300 ${
                tourStep !== null ? 'opacity-20' : ''
              }`}>Operacije & Rad</div>
              
              {/* Assignment workspace */}
              <button
                id="sidebar-tab-assign"
                onClick={() => handleTabChange('assign')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('assign', 8)}`}
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>Raspoređivanje</span>
              </button>

              {/* Trainings */}
              <button
                id="sidebar-tab-obuke"
                onClick={() => handleTabChange('obuke')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('obuke', 9)}`}
              >
                <GraduationCap className="w-4.5 h-4.5" />
                <span>Obuke</span>
              </button>

              {/* Contacts log */}
              <button
                id="sidebar-tab-komunikacija"
                onClick={() => handleTabChange('komunikacija')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('komunikacija', 10)}`}
              >
                <PhoneCall className="w-4.5 h-4.5" />
                <span>Komunikacija</span>
              </button>
            </div>

            {/* Group: LOGISTIKA */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-extrabold text-[#9aa3b2] uppercase tracking-wider px-3 transition-all duration-300 ${
                tourStep !== null ? 'opacity-20' : ''
              }`}>Logistika & Teren</div>
              
              {/* Finances */}
              <button
                id="sidebar-tab-finansije"
                onClick={() => handleTabChange('finansije')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('finansije', 11)}`}
              >
                <Coins className="w-4.5 h-4.5" />
                <span>Finansije i Donacije</span>
              </button>

              {/* eCanvasser Terrain analytics */}
              <button
                id="sidebar-tab-ecanvasser"
                onClick={() => handleTabChange('ecanvasser')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${getTourOrActiveClasses('ecanvasser', 12)}`}
              >
                <Map className="w-4.5 h-4.5" />
                <span>Teren (eCanvasser)</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Lower Sidebar Settings */}
        <div className={`p-4 border-t border-[#1e222b] relative space-y-2 transition-all duration-300 ${
          tourStep !== null && tourStep !== 0 ? 'blur-[1.5px] opacity-20 pointer-events-none' : ''
        }`}>
          <button
            onClick={handleResetTour}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-400 hover:text-white bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/25 hover:border-blue-500/50 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Digitalni vodič 🌟</span>
          </button>

          <div
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-500 rounded-xl"
          >
            <Settings className="w-4.5 h-4.5 text-gray-600" />
            <span>Sistemska podešavanja</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      <div className={`flex-1 flex flex-col min-w-0 bg-[#090b0f] overflow-y-auto transition-all duration-300 ${
        tourStep !== null ? 'relative z-50' : ''
      }`}>
        
        {/* Top Header bar with status and notifications */}
        <header className={`px-4 md:px-8 py-4 border-b border-[#1e222b] flex items-center justify-between bg-[#0c0e12]/95 backdrop-blur-xs sticky top-0 z-30 transition-all duration-300 ${
          tourStep !== null ? 'opacity-20 blur-[1px] pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl md:hidden shrink-0"
              title="Otvori meni"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold text-white capitalize font-sans flex items-center gap-2 truncate">
                {currentTab === 'dashboard' && 'Kontrolna tabla analitike'}
                {currentTab === 'kalendar' && 'Kalendar i Taskovi'}
                {currentTab === 'people' && 'Spisak svih ljudi u bazi'}
                {currentTab === 'pending' && 'Prijave sa online forme'}
                {currentTab === 'bm' && 'Evidencija biračkih mesta'}
                {currentTab === 'mt' && 'Upravljanje mobilnim timovima'}
                {currentTab === 'assign' && 'Glavni panel za raspoređivanje'}
                {currentTab === 'obuke' && 'Dnevnik i prozivnici obuka'}
                {currentTab === 'komunikacija' && 'Istorija obavljenih razgovora'}
                {currentTab === 'finansije' && 'Blagajna i Finansije'}
                {currentTab === 'ecanvasser' && `Door-to-door analitika (${selectedOpstina})`}
              </h2>
              <p className="text-[10px] md:text-[11px] text-[#9aa3b2] mt-0.5 truncate">
                {currentTab === 'dashboard' && 'Glavna metrika, levak regrutacije i zastupljenost na biračkim mestima.'}
                {currentTab === 'kalendar' && 'Interaktivni kalendar akcija i Notion-style planer za praćenje dnevnih zadataka.'}
                {currentTab === 'people' && 'Uredite podatke o volonterima, kontrolorima, dodajte sopstvene kolone i koristite Excel uvoz/izvoz.'}
                {currentTab === 'pending' && 'Pregledajte prijave građana, odobrite ih i automatski ih unesite u bazu.'}
                {currentTab === 'bm' && 'Kreirajte biračka mesta, pregledajte raspoređene šefove i kontrolore i pratite deficit.'}
                {currentTab === 'mt' && 'Upravljajte mobilnim timovima zaduženim za logistiku, kola i pokrivanje terena.'}
                {currentTab === 'assign' && 'Dodelite volontere na biračka mesta ili u mobilne timove preko jedinstvenog panela.'}
                {currentTab === 'obuke' && 'Zakažite obuke posmatrača, pratite dolazak učesnika i ažurirajte podatke.'}
                {currentTab === 'komunikacija' && 'Evidentirajte pozive, rezultate komunikacije i pratite status kontaktiranosti.'}
                {currentTab === 'finansije' && 'Pratite donacije građana, donatore, troškove štampanja i goriva u realnom vremenu.'}
                {currentTab === 'ecanvasser' && `Pokrenite simulaciju i beležite rezultate rada na terenu za svako biračko mesto u opštini ${selectedOpstina}.`}
              </p>
            </div>
          </div>

          {/* Current Mode Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-[8px] md:text-[9px] font-extrabold uppercase tracking-widest px-2 md:px-2.5 py-1 rounded-full border ${
              isReadOnly 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {isReadOnly ? 'Član' : 'Koordinator'}
            </span>
          </div>
        </header>

        {/* 3. ACTIVE VIEW CONTENT PORTAL */}
        <main className={`p-4 md:p-8 flex-1 transition-all duration-300 ${
          tourStep !== null
            ? TOUR_STEPS[tourStep]?.tab === currentTab
              ? 'relative z-50 bg-[#090b0f] ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.35)] rounded-2xl scale-[1.005] mx-4 md:mx-8 my-4 md:my-6 pointer-events-none select-none'
              : 'opacity-15 blur-[1.5px] pointer-events-none select-none'
            : ''
        }`}>
          
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardTab 
              people={people}
              bm={bm}
              mt={mt}
              obuke={obuke}
              pending={pending}
              selectedOpstina={selectedOpstina}
            />
          )}

          {/* TAB 2: LjUDI (Primary customizable people sheet with Excel helper) */}
          {currentTab === 'people' && (
            <div className="space-y-6">
              {/* Toolbar Section (Unified Webflow inspired layout) */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 bg-[#101318] border border-[#1e222b] rounded-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Pretraži ljude..."
                      value={filters.q}
                      onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                      className="pl-9 pr-4 py-2 text-xs bg-[#0c0e12] border border-[#1e222b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                    />
                  </div>

                  {/* Toggle filter open */}
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                      isFilterOpen
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                        : 'bg-[#0c0e12] border-[#1e222b] text-gray-300 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filteri</span>
                    {Object.values(filters).filter(v => v !== '' && v !== null).length > 1 && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>

                  {/* Multi selector checkbox switcher toggle */}
                  <button
                    onClick={() => {
                      setIsSelecting(!isSelecting);
                      setSelectedRows(new Set());
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                      isSelecting
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400'
                        : 'bg-[#0c0e12] border-[#1e222b] text-gray-300 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{isSelecting ? 'Završi odabir' : 'Izaberi više'}</span>
                  </button>

                  {/* Bulk Delete action button */}
                  {isSelecting && selectedRows.size > 0 && !isReadOnly && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 animate-fade-in"
                    >
                      <Trash2 className="w-4 h-4" />
                      Obriši ({selectedRows.size})
                    </button>
                  )}
                </div>

                {/* Import, Export & New Person */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Export Excel button */}
                  <button
                    onClick={handleExportClick}
                    className="px-4 py-2 bg-[#0c0e12] hover:bg-white/5 border border-[#1e222b] hover:border-gray-500 text-xs font-semibold text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Izvezi u Excel
                  </button>

                  {/* Import Excel button */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      ref={fileInputRef}
                      onChange={handleFileImportChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => setIsImportNoticeOpen(true)}
                      className="px-4 py-2 bg-[#0c0e12] hover:bg-white/5 border border-[#1e222b] hover:border-gray-500 text-xs font-semibold text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      Uvezi Excel
                    </button>
                  </div>

                  {/* Custom fields editor column */}
                  <button
                    onClick={() => setIsCustomFieldsModalOpen(true)}
                    className="p-2 bg-[#0c0e12] hover:bg-white/5 border border-[#1e222b] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl transition-all"
                    title="Kolone / Dodatni atributi"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>

                  {/* Add New Person */}
                  <button
                    onClick={() => {
                      setSelectedPerson(null);
                      setIsPersonModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nova osoba
                  </button>
                </div>
              </div>

              {/* Advanced Filtering Panel */}
              {isFilterOpen && (
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setIsFilterOpen(false)}
                  reoni={getReoniForOpstina(selectedOpstina)}
                />
              )}

              {/* Unified Table view of Ljudi */}
              <div className="bg-[#101318] border border-[#1e222b] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12]">
                        {isSelecting && (
                          <th className="p-3.5 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.size > 0 && selectedRows.size === filteredAndSortedPeople.length}
                              onChange={handleToggleSelectAll}
                              className="rounded border-[#1e222b] bg-[#161a22] text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                            />
                          </th>
                        )}
                        {isColumnVisible('imePrezime') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer" onClick={() => handleToggleSort('imePrezime')}>
                            <div className="flex items-center gap-1">
                              <span>Ime i prezime</span>
                              {sortState.field === 'imePrezime' && (sortState.order === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                            </div>
                          </th>
                        )}
                        {isColumnVisible('uloga') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer" onClick={() => handleToggleSort('uloga')}>
                            Uloga
                          </th>
                        )}
                        {isColumnVisible('status') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer text-center" onClick={() => handleToggleSort('status')}>
                            Status
                          </th>
                        )}
                        {isColumnVisible('faza') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer" onClick={() => handleToggleSort('faza')}>
                            Faza
                          </th>
                        )}

                        {isColumnVisible('bm') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer text-center" onClick={() => handleToggleSort('bm')}>
                            BM
                          </th>
                        )}
                        {isColumnVisible('telefon') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer">
                            Telefon
                          </th>
                        )}
                        {isColumnVisible('email') && (
                          <th className="p-3.5 font-bold text-white hover:bg-white/2 cursor-pointer">
                            Email
                          </th>
                        )}
                        {/* Dynamic Custom attributes headers */}
                        {customFields.map((cf) => isColumnVisible(cf.key) && (
                          <th key={cf.key} className="p-3.5 font-bold text-white whitespace-nowrap">
                            {cf.label}
                          </th>
                        ))}

                        {/* Column visibility controller pin icon */}
                        <th className="p-3.5 w-12 text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsColumnDropdownOpen(!isColumnDropdownOpen);
                            }}
                            className={`p-1.5 rounded-lg hover:bg-[#1e222b] text-gray-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center ${
                              isColumnDropdownOpen ? 'bg-blue-600/20 text-blue-400 border border-blue-500/25' : 'border border-transparent'
                            }`}
                            title="Izbor kolona"
                          >
                            <Pin size={14} className="rotate-45" />
                          </button>

                          {isColumnDropdownOpen && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-2 top-full mt-2 w-64 bg-[#171a21] border border-[#2a2f3a] rounded-xl shadow-2xl p-3.5 z-40 text-left font-sans"
                            >
                              <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#1e222b]">
                                <span className="font-extrabold text-[#9aa3b2] uppercase tracking-wider text-[10px]">Prikaz kolona</span>
                                <button 
                                  onClick={() => setIsColumnDropdownOpen(false)}
                                  className="text-gray-400 hover:text-white text-[10px] bg-[#1e222b] hover:bg-[#252b36] px-2 py-0.5 rounded transition-all cursor-pointer"
                                >
                                  Zatvori
                                </button>
                              </div>
                              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                {ALL_COLUMNS.map((col) => {
                                  const visible = isColumnVisible(col.key);
                                  return (
                                    <button
                                      key={col.key}
                                      onClick={() => toggleColumnVisibility(col.key)}
                                      className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#1e222b] rounded-lg text-left transition-colors text-gray-200 cursor-pointer group/col"
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                        visible 
                                          ? 'bg-blue-600 border-blue-500 text-white' 
                                          : 'border-gray-600 bg-transparent group-hover/col:border-gray-400'
                                      }`}>
                                        {visible && <Check size={11} strokeWidth={3} />}
                                      </div>
                                      <span className="font-medium text-xs">{col.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e222b]/50">
                      {filteredAndSortedPeople.length === 0 ? (
                        <tr>
                          <td colSpan={(isSelecting ? 1 : 0) + ALL_COLUMNS.filter(c => isColumnVisible(c.key)).length + 1} className="p-12 text-center text-[#9aa3b2] italic">
                            Nema pronađenih osoba za traženi filter i upit pretrage.
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedPeople.map((p) => {
                          const isSelected = selectedRows.has(p.id);
                          return (
                            <tr
                              key={p.id}
                              onClick={() => {
                                setSelectedPerson(p);
                                setIsPersonModalOpen(true);
                              }}
                              className={`group hover:bg-[#161a22]/80 cursor-pointer transition-all ${
                                isSelected ? 'bg-indigo-500/5' : ''
                              }`}
                            >
                              {isSelecting && (
                                <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectRow(p.id)}
                                    className="rounded border-[#1e222b] bg-[#161a22] text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </td>
                              )}
                              
                              {isColumnVisible('imePrezime') && (
                                <td className="p-3.5 font-semibold text-white font-sans">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                      {p.imePrezime}
                                    </span>
                                    {p.odPoverenja && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black tracking-wider uppercase rounded" title="Osoba od poverenja">
                                        ★ Poverenje
                                      </span>
                                    )}
                                    <span className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md font-medium transition-opacity">
                                      Prikaži
                                    </span>
                                  </div>
                                </td>
                              )}

                              {isColumnVisible('uloga') && (
                                <td className="p-3.5 text-gray-300 capitalize">{p.uloga || '—'}</td>
                              )}
                              
                              {/* Status dot */}
                              {isColumnVisible('status') && (
                                <td className="p-3.5 text-center">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    p.status === 'potvrđen' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    p.status === 'kontaktiran' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                    p.status === 'odustao' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    'bg-gray-500/10 border-gray-500/20 text-gray-400'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      p.status === 'potvrđen' ? 'bg-emerald-400' :
                                      p.status === 'kontaktiran' ? 'bg-blue-400' :
                                      p.status === 'odustao' ? 'bg-red-400' :
                                      'bg-gray-400'
                                    }`} />
                                    {p.status}
                                  </span>
                                </td>
                              )}

                              {isColumnVisible('faza') && (
                                <td className="p-3.5 text-[#9aa3b2] font-semibold">{p.faza || '—'}</td>
                              )}


                              {/* BM badge */}
                              {isColumnVisible('bm') && (
                                <td className="p-3.5 text-center">
                                  {p.bm ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1b202a] text-[#a5b4fc] border border-indigo-500/20">
                                      BM {p.bm}
                                    </span>
                                  ) : (
                                    <span className="text-[#9aa3b2] text-[10px] italic">Nije raspoređen</span>
                                  )}
                                </td>
                              )}

                              {isColumnVisible('telefon') && (
                                <td className="p-3.5 text-gray-300 select-all font-mono text-[11px]">{p.telefon || '—'}</td>
                              )}

                              {isColumnVisible('email') && (
                                <td className="p-3.5 text-gray-300 select-all font-mono text-[11px]">{p.email || '—'}</td>
                              )}

                              {/* Dynamic custom fields cells */}
                              {customFields.map((cf) => {
                                if (!isColumnVisible(cf.key)) return null;
                                const val = p[cf.key];
                                return (
                                  <td key={cf.key} className="p-3.5 text-gray-300">
                                    {cf.type === 'boolean' ? (
                                      val ? 'Da' : 'Ne'
                                    ) : val !== undefined && val !== '' ? (
                                      String(val)
                                    ) : (
                                      '—'
                                    )}
                                  </td>
                                );
                              })}

                              {/* Empty cell to align with column config button */}
                              <td className="p-3.5 w-12 text-center"></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer stats bar */}
                <div className="px-6 py-4 border-t border-[#1e222b] bg-[#101318]/90 text-[11px] text-[#9aa3b2] flex justify-between items-center flex-wrap gap-2">
                  <div>
                    Prikazano <span className="text-white font-bold">{filteredAndSortedPeople.length}</span> od{' '}
                    <span className="text-white font-bold">{people.length}</span> ljudi
                  </div>
                  <div className="flex gap-4">
                    <span>Automobil: <span className="text-white font-semibold">{people.filter(p => p.auto).length}</span></span>
                    <span>Iskustvo: <span className="text-white font-semibold">{people.filter(p => p.iskustvo).length}</span></span>
                    <span>Obuka za kontrolora: <span className="text-white font-semibold">{
                      people.filter(p => obuke.filter(o => o.naziv.toLowerCase().includes('kontrolor')).some(o => o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao'))).length
                    }</span></span>
                    <span>Obuka za vdv: <span className="text-white font-semibold">{
                      people.filter(p => obuke.filter(o => o.naziv.toLowerCase().includes('vdv')).some(o => o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao'))).length
                    }</span></span>
                    <span>Obuka za call centar: <span className="text-white font-semibold">{
                      people.filter(p => obuke.filter(o => o.naziv.toLowerCase().includes('call') || o.naziv.toLowerCase().includes('kol') || o.naziv.toLowerCase().includes('centar')).some(o => o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao'))).length
                    }</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ONLINE PRIJAVE */}
          {currentTab === 'pending' && (
            <PendingTab
              pending={pending}
              onApprove={handleApprovePending}
              onReject={handleRejectPending}
              isReadOnly={isReadOnly}
              onAddPending={(item) => updatePendingDatabase([...pending, item])}
            />
          )}

          {/* TAB 4: BIRAČKA MESTA */}
          {currentTab === 'bm' && (
            <BMTab
              bm={bm}
              people={people}
              onAddBM={handleAddBM}
              onDeleteBM={handleDeleteBM}
              isReadOnly={isReadOnly}
              reoni={getReoniForOpstina(selectedOpstina)}
            />
          )}

          {/* TAB 5: MOBILNI TIMOVI */}
          {currentTab === 'mt' && (
            <MTTab
              mt={mt}
              people={people}
              bm={bm}
              onAddMT={handleAddMT}
              onDeleteMT={handleDeleteMT}
              isReadOnly={isReadOnly}
              reoni={getReoniForOpstina(selectedOpstina)}
            />
          )}

          {/* TAB 6: RASPOREĐIVANJE PANEL */}
          {currentTab === 'assign' && (
            <AssignTab
              people={people}
              bm={bm}
              mt={mt}
              onAssign={handleAssign}
              onRemoveAssignment={handleRemoveAssignment}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 7: OBUKE KONTROLORA */}
          {currentTab === 'obuke' && (
            <ObukeTab
              obuke={obuke}
              people={people}
              onAddObuka={handleAddObuka}
              onDeleteObuka={handleDeleteObuka}
              onUpdateAttendance={handleUpdateAttendance}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 8: KOMUNIKACIJA CALL LOGS */}
          {currentTab === 'komunikacija' && (
            <KomunikacijaTab
              kontakti={kontakti}
              people={people}
              onAddKontakt={handleAddKontakt}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 9: FINANSIJE I DONACIJE */}
          {currentTab === 'finansije' && (
            <FinansijeTab
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 10: TEREN (ECANVASSER) */}
          {currentTab === 'ecanvasser' && (
            <ECanvasserTab
              onNotify={(msg) => triggerToast(msg)}
              selectedOpstina={selectedOpstina}
            />
          )}

          {/* TAB 11: KALENDAR I TASKOVI */}
          {currentTab === 'kalendar' && (
            <CalendarTab />
          )}

        </main>
      </div>

      {/* --- MODALS RENDERING REGISTRY (Coordinator edit modals) --- */}

      {/* Person editor details modal */}
      {isPersonModalOpen && (
        <PersonModal
          person={selectedPerson}
          customFields={customFields}
          kontakti={kontakti}
          obuke={obuke}
          onSave={handleSavePerson}
          onDelete={selectedPerson ? () => handleDeletePerson(selectedPerson.id) : undefined}
          onClose={() => {
            setIsPersonModalOpen(false);
            setSelectedPerson(null);
          }}
          isReadOnly={isReadOnly}
          reoni={getReoniForOpstina(selectedOpstina)}
        />
      )}

      {/* Custom Fields column editor modal */}
      {isCustomFieldsModalOpen && (
        <CustomFieldModal
          customFields={customFields}
          onAdd={handleAddCustomField}
          onRemove={handleRemoveCustomField}
          onClose={() => setIsCustomFieldsModalOpen(false)}
        />
      )}

      {/* Excel sheet import preview modal */}
      {isImportPreviewOpen && (
        <ImportPreviewModal
          people={importPreviewPeople}
          errors={importPreviewErrors}
          onConfirm={handleConfirmImport}
          onClose={() => {
            setIsImportPreviewOpen(false);
            setImportPreviewPeople([]);
            setImportPreviewErrors([]);
          }}
        />
      )}

      {/* Import Notice / Warning Modal */}
      {isImportNoticeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#171a21] border border-[#2a2f3a] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
            
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Opomena pre uvoza podataka</h3>
                <p className="text-xs text-[#9aa3b2]">
                  Za uspešan uvoz Excel tabele u bazu, vaš fajl mora ispuniti minimalne zahteve strukture.
                </p>
              </div>
            </div>

            {/* Mandatory Fields info */}
            <div className="bg-[#101318] border border-[#1e222b] rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-[#9aa3b2] uppercase tracking-wider block">
                Sledeće kolone su apsolutno obavezne:
              </span>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="font-semibold text-gray-200">Ime i prezime</span>
                  <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 ml-auto">Obavezno</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="font-semibold text-gray-200">Telefon</span>
                  <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 ml-auto">Obavezno</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="font-semibold text-gray-200">Email</span>
                  <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 ml-auto">Obavezno</span>
                </div>
              </div>

              <p className="text-[10px] text-[#9aa3b2] leading-relaxed pt-2 border-t border-[#1e222b]">
                Redovi u kojima nedostaje bilo koji od ovih podataka biće automatski preskočeni tokom procesa uvoza kako bi se sprečila nekonzistentnost baze podataka.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsImportNoticeOpen(false)}
                className="px-4 py-2 bg-[#1e222b] hover:bg-[#2a2f3a] text-xs font-semibold text-gray-300 hover:text-white rounded-xl transition-all"
              >
                Odustani
              </button>
              <button
                onClick={() => {
                  setIsImportNoticeOpen(false);
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 150);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Izaberi Excel fajl
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- DIGITAL TOUR GUIDE MODAL --- */}
      {tourStep !== null && (
        <>
          {/* Sibling Backdrop Overlay (under z-50 elements, but above z-40 and normal layout) */}
          <div className="fixed inset-0 bg-black/70 z-[45] pointer-events-none backdrop-blur-xs" />

          {/* Modal Container (above z-50 elements) */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none">
            <div className="bg-[#0c0e12] border border-[#2a303d] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl w-full max-w-3xl p-10 pointer-events-auto space-y-8 animate-fade-in text-sans">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1e222b] pb-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                  <span className="text-sm md:text-base font-extrabold text-blue-400 uppercase tracking-wider font-mono">
                    Korak {tourStep + 1} od {TOUR_STEPS.length}
                  </span>
                </div>
                <button 
                  onClick={handleSkipTour}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Isključi digitalnu turu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h4 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {TOUR_STEPS[tourStep].title}
                </h4>
                <p className="text-base md:text-lg text-gray-200 leading-relaxed font-semibold">
                  {TOUR_STEPS[tourStep].description}
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1e222b]">
                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="text-xs md:text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 px-3 py-2 rounded-xl transition-colors"
                >
                  Isključi vodič
                </button>

                <div className="flex gap-3">
                  {tourStep > 0 && (
                    <button
                      type="button"
                      onClick={() => handleGoToStep(tourStep - 1)}
                      className="px-4 py-2 text-xs md:text-sm font-semibold text-gray-300 bg-[#161a22] border border-[#232935] hover:bg-[#1e222b] rounded-xl transition-all"
                    >
                      Nazad
                    </button>
                  )}

                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => handleGoToStep(tourStep + 1)}
                      className="px-5 py-2 text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/15 transition-all"
                    >
                      Sledeće
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteTour}
                      className="px-5 py-2 text-xs md:text-sm font-bold text-white bg-green-600 hover:bg-green-500 rounded-xl shadow-lg shadow-green-500/15 transition-all"
                    >
                      Završi
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- GLOBAL TOAST SYSTEM RENDERER --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0c0e12] border border-blue-500/40 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2.5 animate-fade-in font-sans">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
