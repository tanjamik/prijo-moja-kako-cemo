import React, { useState, useEffect } from 'react';
import { Person, CustomField, Kontakt, Obuka } from '../types';
import { AVAILABLE_ROLES, AVAILABLE_STATUSES, AVAILABLE_STAGES, REONI } from '../data';
import { X, Save, UserPlus, Trash2, Edit } from 'lucide-react';

interface PersonModalProps {
  person: Person | null; // null means adding a new person
  customFields: CustomField[];
  kontakti?: Kontakt[];
  obuke?: Obuka[];
  onSave: (person: Person) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  isReadOnly?: boolean;
  reoni?: string[];
}

export default function PersonModal({
  person,
  customFields,
  kontakti = [],
  obuke = [],
  onSave,
  onDelete,
  onClose,
  isReadOnly = false,
  reoni = REONI
}: PersonModalProps) {
  const [isEditing, setIsEditing] = useState<boolean>(!person);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Person>>({
    imePrezime: '',
    uloga: '', // default empty (no uloga)
    status: AVAILABLE_STATUSES[2], // default "potencijalni"
    faza: '—',
    reon: reoni[0],
    bm: '',
    telefon: '',
    email: '',
    auto: false,
    iskustvo: false,
    obukaOsnovna: false,
    obukaNapredna: false,
    rasporedjen: false,
    napomene: '',
    telegram: '',
    kontaktPoint: '',
    poreklo: '',
    odPoverenja: false
  });

  useEffect(() => {
    if (person) {
      setFormData({ ...person });
      const roles = person.uloga ? person.uloga.split(',').map(r => r.trim()).filter(Boolean) : [];
      setSelectedRoles(roles);
      setIsEditing(false); // Default to detail view when opening an existing person
    } else {
      setFormData({
        imePrezime: '',
        uloga: '',
        status: AVAILABLE_STATUSES[2],
        faza: '—',
        reon: reoni[0],
        bm: '',
        telefon: '',
        email: '',
        auto: false,
        iskustvo: false,
        obukaOsnovna: false,
        obukaNapredna: false,
        rasporedjen: false,
        napomene: '',
        telegram: '',
        kontaktPoint: '',
        poreklo: '',
        odPoverenja: false
      });
      setSelectedRoles([]);
      setIsEditing(true); // Open directly in edit mode for new person
    }
  }, [person]);

  const handleRoleToggle = (role: string) => {
    let updated: string[];
    if (selectedRoles.includes(role)) {
      updated = selectedRoles.filter(r => r !== role);
    } else {
      updated = [...selectedRoles, role];
    }
    setSelectedRoles(updated);
    handleChange('uloga', updated.join(', '));
  };

  const handleChange = (key: keyof Person, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imePrezime?.trim()) {
      alert('Ime i prezime je obavezno polje.');
      return;
    }

    const savedPerson: Person = {
      id: person?.id || `person_${Date.now()}`,
      imePrezime: formData.imePrezime.trim(),
      uloga: selectedRoles.join(', '),
      status: formData.status || 'potencijalni',
      faza: formData.faza || '—',
      reon: formData.reon || '',
      bm: formData.bm || '',
      telefon: formData.telefon || '',
      email: formData.email || '',
      auto: !!formData.auto,
      iskustvo: !!formData.iskustvo,
      obukaOsnovna: !!formData.obukaOsnovna,
      obukaNapredna: !!formData.obukaNapredna,
      rasporedjen: !!formData.rasporedjen,
      napomene: formData.napomene || '',
      telegram: formData.telegram || '',
      kontaktPoint: formData.kontaktPoint || '',
      poreklo: formData.poreklo || '',
      odPoverenja: !!formData.odPoverenja
    };

    // Copy over all custom fields
    customFields.forEach((cf) => {
      savedPerson[cf.key] = formData[cf.key] !== undefined ? formData[cf.key] : '';
    });

    onSave(savedPerson);
  };

  // --------------------------------------------------------
  // DETAILS VIEW (When not editing and person is not null)
  // --------------------------------------------------------
  if (!isEditing && person) {
    // Find training status for this person
    const getTrainingStatus = (type: 'kontrolor' | 'vdv' | 'call') => {
      const matches = obuke.filter(o => {
        const name = o.naziv.toLowerCase();
        if (type === 'kontrolor') return name.includes('kontrolor');
        if (type === 'vdv') return name.includes('vdv');
        if (type === 'call') return name.includes('call') || name.includes('kol') || name.includes('centar');
        return false;
      });

      let best: { status: string; date?: string; tip?: string } | null = null;
      for (const t of matches) {
        const u = t.ucesnici.find(u => u.pid === person.id);
        if (u) {
          if (!best || u.status === 'prisustvovao' || (best.status !== 'prisustvovao' && u.status === 'nije prisustvovao')) {
            best = { status: u.status, date: t.datum, tip: t.tip };
          }
        }
      }
      return best ? best.status : 'nije pozvan';
    };

    const kontrolorStatus = getTrainingStatus('kontrolor');
    const vdvStatus = getTrainingStatus('vdv');
    const callStatus = getTrainingStatus('call');

    const personContacts = kontakti.filter((c) => c.pid === person.id);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[#171a21] border border-[#2a2f3a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start px-8 py-5 border-b border-[#2a2f3a]">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {person.imePrezime}
              </h2>
              <p className="text-xs text-[#9aa3b2] mt-1">
                {person.uloga ? (
                  person.uloga.split(',').map(r => r.trim()).join(', ')
                ) : (
                  'Bez uloge (Samo kontakt)'
                )} <span className="mx-1.5 text-gray-600">•</span> glasa na BM {person.bm || '—'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e222b] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
            
            {/* FAZA SECTION */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                FAZA (AUTOMATSKI IZVEDENO)
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {['Kontaktiran', 'Potvrdio učešće', 'Prošao osnovnu obuku', 'Prošao naprednu obuku', 'Raspoređen', 'Potvrđen'].map((stage) => {
                  const isActive = person.faza === stage;
                  
                  // Calculate completed
                  let isCompleted = false;
                  if (stage === 'Kontaktiran') {
                    isCompleted = person.status === 'kontaktiran' || person.status === 'potvrđen';
                  } else if (stage === 'Potvrdio učešće') {
                    isCompleted = person.status === 'potvrđen';
                  } else if (stage === 'Prošao osnovnu obuku') {
                    isCompleted = person.obukaOsnovna;
                  } else if (stage === 'Prošao naprednu obuku') {
                    isCompleted = person.obukaNapredna;
                  } else if (stage === 'Raspoređen') {
                    isCompleted = person.rasporedjen;
                  } else if (stage === 'Potvrđen') {
                    isCompleted = person.status === 'potvrđen';
                  }

                  if (isActive) {
                    return (
                      <span
                        key={stage}
                        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-blue-500/30 shadow-md"
                      >
                        {stage}
                      </span>
                    );
                  } else if (isCompleted) {
                    return (
                      <span
                        key={stage}
                        className="border border-emerald-900/40 bg-emerald-500/5 text-emerald-400 font-semibold px-4 py-2.5 rounded-xl text-xs"
                      >
                        {stage}
                      </span>
                    );
                  } else {
                    return (
                      <span
                        key={stage}
                        className="border border-[#2a2f3a] bg-[#1e222b]/20 text-gray-500 font-medium px-4 py-2.5 rounded-xl text-xs"
                      >
                        {stage}
                      </span>
                    );
                  }
                })}
              </div>
            </div>

            {/* TWO COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LIČNI PODACI */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                  LIČNI PODACI
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Telefon</span>
                    <span className="col-span-2 text-gray-200 font-medium">{person.telefon || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Email</span>
                    <span className="col-span-2 text-gray-200 font-medium break-all">{person.email || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Telegram</span>
                    <span className="col-span-2 text-gray-200 font-medium">{person.telegram || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">BM gde glasa</span>
                    <span className="col-span-2 text-gray-200 font-medium">{person.bm || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Preporuka</span>
                    <span className="col-span-2 font-medium">
                      {person.kontaktPoint === 'Da' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                          DA
                        </span>
                      ) : (
                        <span className="text-gray-500">Ne</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Poreklo</span>
                    <span className="col-span-2 text-gray-200 font-medium">{person.poreklo || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-0.5">
                    <span className="text-gray-400">Od poverenja</span>
                    <span className="col-span-2 font-medium">
                      {person.odPoverenja ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          DA ★
                        </span>
                      ) : (
                        <span className="text-gray-500">Ne</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ORGANIZACIJA */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                  ORGANIZACIJA
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-4 py-0.5">
                    <span className="text-gray-400 w-24 pt-1">Uloga</span>
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {person.uloga ? (
                        person.uloga.split(',').map((r) => r.trim()).filter(Boolean).map((role) => (
                          <span key={role} className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 capitalize">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-gray-500/20 bg-gray-500/5 text-gray-400">
                          Bez uloge
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-0.5">
                    <span className="text-gray-400 w-24">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      person.status === 'potvrđen' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      person.status === 'kontaktiran' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      person.status === 'odustao' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-gray-500/10 border-gray-500/20 text-gray-400'
                    }`}>
                      {person.status || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 py-0.5">
                    <span className="text-gray-400 w-24">Automobil</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] ${
                        person.auto ? 'bg-emerald-600' : 'bg-gray-700/50 border border-[#2a2f3a]'
                      }`}>
                        {person.auto ? '✔' : ''}
                      </div>
                      <span className="text-gray-200 font-medium">{person.auto ? 'Da' : 'Ne'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-0.5">
                    <span className="text-gray-400 w-24">Iskustvo</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] ${
                        person.iskustvo ? 'bg-emerald-600' : 'bg-gray-700/50 border border-[#2a2f3a]'
                      }`}>
                        {person.iskustvo ? '✔' : ''}
                      </div>
                      <span className="text-gray-200 font-medium">{person.iskustvo ? 'Bio na izborima' : 'Nema iskustva'}</span>
                    </div>
                  </div>

                  {/* Render custom fields */}
                  {customFields.map((cf) => {
                    const val = person[cf.key];
                    return (
                      <div key={cf.key} className="flex items-center gap-4 py-0.5">
                        <span className="text-gray-400 w-24">{cf.label}</span>
                        <span className="text-gray-200 font-medium">
                          {cf.type === 'boolean' ? (val ? 'Da' : 'Ne') : (val || '—')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* OBUKE SECTION */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                OBUKE
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  kontrolorStatus === 'prisustvovao' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  kontrolorStatus === 'pozvan' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-gray-500/10 border-gray-500/20 text-gray-400'
                }`}>
                  Obuka za kontrolora: {kontrolorStatus}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  vdvStatus === 'prisustvovao' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  vdvStatus === 'pozvan' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-gray-500/10 border-gray-500/20 text-gray-400'
                }`}>
                  Obuka za vdv: {vdvStatus}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  callStatus === 'prisustvovao' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  callStatus === 'pozvan' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-gray-500/10 border-gray-500/20 text-gray-400'
                }`}>
                  Obuka za call centar: {callStatus}
                </span>
              </div>
            </div>

            {/* ISTORIJA KONTAKATA */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                ISTORIJA KONTAKATA
              </h3>
              {personContacts.length === 0 ? (
                <p className="text-xs text-gray-500">Nema evidentiranih kontakata.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {personContacts.map((c) => (
                    <div key={c.id} className="text-xs border border-[#2a2f3a] bg-[#1e222b]/30 p-2.5 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Kontaktirao: <strong className="text-gray-300">{c.ko}</strong></span>
                        <span>{c.datum}</span>
                      </div>
                      <p className="text-gray-200">{c.rezultat}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NAPOMENE */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">
                NAPOMENE
              </h3>
              <p className="text-xs text-gray-200 bg-[#1e222b]/30 border border-[#2a2f3a] p-3 rounded-xl whitespace-pre-wrap leading-relaxed font-mono">
                {person.napomene || 'Nema evidentiranih napomena.'}
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#2a2f3a] bg-[#12141a] flex justify-between items-center rounded-b-2xl">
            {onDelete && !isReadOnly ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Da li ste sigurni da želite obrisati osobu: ${person.imePrezime}?`)) {
                    onDelete(person.id);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-white hover:bg-red-950 px-3 py-2 rounded-lg border border-red-900/30 transition-colors"
              >
                <Trash2 size={14} />
                Obriši osobu
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-white px-5 py-2.5 rounded-xl border border-[#2a2f3a] hover:bg-[#1e222b] transition-colors font-medium"
              >
                Zatvori
              </button>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors"
                >
                  <Edit size={14} />
                  Izmeni podatke
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // FORM / EDIT VIEW
  // --------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#171a21] border border-[#2a2f3a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2f3a]">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-blue-500" />
            <h2 className="text-base font-semibold text-gray-100 font-sans">
              {person ? 'Izmena Podataka o Osobi' : 'Nova Osoba u Bazi'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e222b] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
          
          {/* Main Fields (2 Column Grid) */}
          <div>
            <h3 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-3">Osnovni podaci</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Ime i prezime *</label>
                <input
                  type="text"
                  required
                  value={formData.imePrezime || ''}
                  onChange={(e) => handleChange('imePrezime', e.target.value)}
                  placeholder="npr. Milica Jovanović"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-[#9aa3b2] mb-2 font-medium">Uloge (izaberite jednu ili više, ili odznačite sve za samo kontakt)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#1e222b]/50 p-3 border border-[#2a2f3a] rounded-xl">
                  {AVAILABLE_ROLES.map((role) => {
                    const isChecked = selectedRoles.includes(role);
                    return (
                      <label key={role} className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="capitalize">{role}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {AVAILABLE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Faza</label>
                <select
                  value={formData.faza || ''}
                  onChange={(e) => handleChange('faza', e.target.value)}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {AVAILABLE_STAGES.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Biračko mesto (BM)</label>
                <input
                  type="text"
                  value={formData.bm || ''}
                  onChange={(e) => handleChange('bm', e.target.value)}
                  placeholder="npr. 012"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Telefon</label>
                <input
                  type="text"
                  value={formData.telefon || ''}
                  onChange={(e) => handleChange('telefon', e.target.value)}
                  placeholder="npr. 064 111 2233"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Email adresa</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="npr. milica.j@mail.com"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Telegram</label>
                <input
                  type="text"
                  value={formData.telegram || ''}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  placeholder="npr. @milicaj"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Preporuka</label>
                <select
                  value={formData.kontaktPoint === 'Da' ? 'Da' : 'Ne'}
                  onChange={(e) => handleChange('kontaktPoint', e.target.value)}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="Ne">Ne</option>
                  <option value="Da">Da</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Poreklo</label>
                <select
                  value={formData.poreklo || ''}
                  onChange={(e) => handleChange('poreklo', e.target.value)}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">— izaberi poreklo —</option>
                  <option value="Prijava preko forma">Prijava preko forma</option>
                  <option value="Akcija">Akcija</option>
                  <option value="Štand">Štand</option>
                  <option value="Preporuka">Preporuka</option>
                  <option value="Drugo">Drugo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Osoba od poverenja</label>
                <select
                  value={formData.odPoverenja ? 'da' : 'ne'}
                  onChange={(e) => handleChange('odPoverenja', e.target.value === 'da')}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="ne">Ne</option>
                  <option value="da">Da</option>
                </select>
              </div>
            </div>
          </div>

          {/* Internal boolean flags */}
          <div>
            <h3 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-3">Dodatne informacije / statusi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#1e222b]/50 p-4 border border-[#2a2f3a] rounded-xl">
              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1.5">
                <input
                  type="checkbox"
                  checked={!!formData.auto}
                  onChange={(e) => handleChange('auto', e.target.checked)}
                  className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Poseduje automobil
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1.5">
                <input
                  type="checkbox"
                  checked={!!formData.iskustvo}
                  onChange={(e) => handleChange('iskustvo', e.target.checked)}
                  className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Iskustvo na izborima
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1.5">
                <input
                  type="checkbox"
                  checked={!!formData.obukaOsnovna}
                  onChange={(e) => handleChange('obukaOsnovna', e.target.checked)}
                  className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Završen osnovni trening
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1.5">
                <input
                  type="checkbox"
                  checked={!!formData.obukaNapredna}
                  onChange={(e) => handleChange('obukaNapredna', e.target.checked)}
                  className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Završen napredni trening
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-1.5">
                <input
                  type="checkbox"
                  checked={!!formData.rasporedjen}
                  onChange={(e) => handleChange('rasporedjen', e.target.checked)}
                  className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Raspoređen/a na dužnost
              </label>
            </div>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-3">Prilagođena polja (Atributi)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((cf) => {
                  const val = formData[cf.key] !== undefined ? formData[cf.key] : '';
                  return (
                    <div key={cf.key}>
                      <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">{cf.label}</label>
                      {cf.type === 'select' ? (
                        <select
                          value={val}
                          onChange={(e) => handleCustomFieldChange(cf.key, e.target.value)}
                          className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        >
                          <option value="">— izaberi opciju —</option>
                          {cf.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : cf.type === 'boolean' ? (
                        <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none py-2.5">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) => handleCustomFieldChange(cf.key, e.target.checked)}
                            className="rounded-sm border-[#2a2f3a] bg-[#1e222b] text-blue-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          Da
                        </label>
                      ) : cf.type === 'number' ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleCustomFieldChange(cf.key, Number(e.target.value) || '')}
                          className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleCustomFieldChange(cf.key, e.target.value)}
                          className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / Napomene */}
          <div>
            <h3 className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-3">Napomene</h3>
            <textarea
              value={formData.napomene || ''}
              onChange={(e) => handleChange('napomene', e.target.value)}
              placeholder="Unesite interne napomene ili detalje o osobi..."
              rows={3}
              className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#2a2f3a] bg-[#1a1d26] flex justify-between items-center rounded-b-2xl">
          {person && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Da li ste sigurni da želite obrisati osobu: ${person.imePrezime}?`)) {
                  onDelete(person.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-white hover:bg-red-950 px-3 py-2 rounded-lg border border-red-900/30 transition-colors"
            >
              <Trash2 size={14} />
              Obriši osobu
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={person ? () => setIsEditing(false) : onClose}
              className="text-xs text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-[#2a2f3a] hover:bg-[#1e222b] transition-colors"
            >
              Otkaži
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium shadow-md transition-colors"
            >
              <Save size={14} />
              Sačuvaj podatke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
