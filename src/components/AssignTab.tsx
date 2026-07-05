import React, { useState, useEffect, useRef } from 'react';
import { Person, BirackoMesto, MobilniTim } from '../types';
import { UserCheck, Shield, Users, ArrowRight, Search, Trash2, Phone, Truck, X } from 'lucide-react';

interface AssignTabProps {
  people: Person[];
  bm: BirackoMesto[];
  mt: MobilniTim[];
  onAssign: (
    pid: string, 
    tipAngazmana: 'Kontrola izbora' | 'VDV' | 'Call centar' | 'Logistika', 
    targetId: string, 
    targetRole: string,
    dodatneOpcije?: { jeStudent?: 'Da' | 'Ne' }
  ) => void;
  onRemoveAssignment: (pid: string) => void;
  isReadOnly: boolean;
}

export default function AssignTab({ people, bm, mt, onAssign, onRemoveAssignment, isReadOnly }: AssignTabProps) {
  // Form state
  const [selectedPid, setSelectedPid] = useState('');
  const [engagementType, setEngagementType] = useState<'Kontrola izbora' | 'VDV' | 'Call centar' | 'Logistika'>('Kontrola izbora');
  const [targetId, setTargetId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isStudent, setIsStudent] = useState<'Da' | 'Ne'>('Ne');

  // Search state for main search
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown search state for person selection
  const [isOpen, setIsOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset helper
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPid) {
      alert('Molimo odaberite osobu.');
      return;
    }
    
    if (engagementType === 'Kontrola izbora') {
      if (!targetId || !targetRole) {
        alert('Molimo odaberite biračko mesto i ulogu.');
        return;
      }
      onAssign(selectedPid, 'Kontrola izbora', targetId, targetRole);
    } else if (engagementType === 'VDV') {
      onAssign(selectedPid, 'VDV', '', '', { jeStudent: isStudent });
    } else if (engagementType === 'Call centar') {
      onAssign(selectedPid, 'Call centar', '', '');
    } else if (engagementType === 'Logistika') {
      onAssign(selectedPid, 'Logistika', '', '');
    }
    
    // Reset selection
    setSelectedPid('');
    setPersonSearch('');
    setTargetId('');
    setTargetRole('');
    setIsStudent('Ne');
  };

  // Filter people who already have assignments or filter by search query
  const assignedPeople = people.filter(p => p.rasporedjen);
  const unassignedPeople = people.filter(p => !p.rasporedjen);

  const filteredUnassigned = unassignedPeople.filter(p => 
    p.imePrezime.toLowerCase().includes(personSearch.toLowerCase()) ||
    (p.uloga && p.uloga.toLowerCase().includes(personSearch.toLowerCase()))
  );
  const filteredAssigned = assignedPeople.filter(p => 
    p.imePrezime.toLowerCase().includes(personSearch.toLowerCase()) ||
    (p.uloga && p.uloga.toLowerCase().includes(personSearch.toLowerCase()))
  );

  // Match target options based on type (Kontrola izbora maps to polling stations)
  const targetOptions = bm.map(b => ({ id: b.broj, name: `BM ${b.broj} — ${b.naziv}` }));

  // Role options for Kontrola izbora
  const roleOptions = [
    { value: 'kontrolor', label: 'Kontrolor' },
    { value: 'mobilni_tim', label: 'Mobilni tim' },
    { value: 'sef_bm', label: 'Šef biračkog mesta' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left panel: Assignment Form */}
      <div className="xl:col-span-4 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserCheck className="w-4.5 h-4.5 text-blue-400" />
          <span>Nova dodela dužnosti</span>
        </h3>

        {isReadOnly ? (
          <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl text-xs text-[#9aa3b2] italic text-center">
            Nemate dozvolu za kreiranje rasporeda. Prijavite se kao Regionalni koordinator.
          </div>
        ) : (
          <form onSubmit={handleAssignSubmit} className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
            {/* Step 1: Osoba */}
            <div className="space-y-1 relative font-sans" ref={dropdownRef}>
              <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Izaberi osobu</label>
              <div className="relative">
                <input
                  type="text"
                  required={!selectedPid}
                  placeholder="Pretraži i odaberi iz baze..."
                  value={personSearch}
                  onChange={(e) => {
                    setPersonSearch(e.target.value);
                    setIsOpen(true);
                    
                    // Reset selection if query doesn't match the selected person's exact name
                    const selectedPerson = people.find(p => p.id === selectedPid);
                    if (selectedPerson && selectedPerson.imePrezime !== e.target.value) {
                      setSelectedPid('');
                    }
                  }}
                  onFocus={() => setIsOpen(true)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                {personSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPid('');
                      setPersonSearch('');
                      setIsOpen(false);
                    }}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#101318] border border-[#232935] rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-[#232935]/50">
                  {filteredUnassigned.length === 0 && filteredAssigned.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500 text-center">Nema rezultata za "{personSearch}"</div>
                  ) : (
                    <>
                      {filteredUnassigned.length > 0 && (
                        <div className="p-1.5 space-y-0.5">
                          <div className="px-2 py-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/5 rounded-md">
                            Slobodni volonteri
                          </div>
                          {filteredUnassigned.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPid(p.id);
                                setPersonSearch(p.imePrezime);
                                setIsOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                selectedPid === p.id 
                                  ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                                  : 'text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              <span>{p.imePrezime}</span>
                              <span className="text-[10px] text-[#9aa3b2]/70 font-normal">({p.uloga || 'bez uloge'})</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredAssigned.length > 0 && (
                        <div className="p-1.5 space-y-0.5">
                          <div className="px-2 py-1 text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/5 rounded-md">
                            Već raspoređeni
                          </div>
                          {filteredAssigned.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPid(p.id);
                                setPersonSearch(p.imePrezime);
                                setIsOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                selectedPid === p.id 
                                  ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                                  : 'text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              <span className="text-gray-400">[R] {p.imePrezime}</span>
                              <span className="text-[10px] text-[#9aa3b2]/50 font-normal">({p.uloga})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Tip angažmana */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Tip angažmana</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEngagementType('Kontrola izbora'); setTargetId(''); setTargetRole(''); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    engagementType === 'Kontrola izbora'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400'
                      : 'bg-[#161a22] border-[#232935] text-gray-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Kontrola izbora</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEngagementType('VDV'); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    engagementType === 'VDV'
                      ? 'bg-amber-600/15 border-amber-500 text-amber-400'
                      : 'bg-[#161a22] border-[#232935] text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>VDV</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEngagementType('Call centar'); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    engagementType === 'Call centar'
                      ? 'bg-purple-600/15 border-purple-500 text-purple-400'
                      : 'bg-[#161a22] border-[#232935] text-gray-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Call centar</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEngagementType('Logistika'); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    engagementType === 'Logistika'
                      ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                      : 'bg-[#161a22] border-[#232935] text-gray-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Logistika</span>
                </button>
              </div>
            </div>

            {/* Step 3: Fields depending on option selection */}
            {engagementType === 'Kontrola izbora' && (
              <>
                {/* ODABERI BIRAČKO MESTO */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">
                    Odaberi biračko mesto
                  </label>
                  <select
                    required
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Odaberi opciju --</option>
                    {targetOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {/* ULOGA / DUŽNOST NA TERENU */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">
                    Uloga / Dužnost na terenu
                  </label>
                  <select
                    required
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Odaberi dužnost --</option>
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {engagementType === 'VDV' && (
              /* DA LI JE STUDENT */
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">
                  Da li je student (DA/NE)
                </label>
                <select
                  required
                  value={isStudent}
                  onChange={(e) => setIsStudent(e.target.value as 'Da' | 'Ne')}
                  className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Da">Da</option>
                  <option value="Ne">Ne</option>
                </select>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Potvrdi i rasporedi
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Right panel: Assignment Log Table */}
      <div className="xl:col-span-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <h3 className="text-sm font-semibold text-white">Pregled svih raspoređenih ({assignedPeople.length})</h3>

          {/* Table search filter */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Pretraži raspored..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#101318] border border-[#1e222b] rounded-xl text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {assignedPeople.length === 0 ? (
          <div className="p-12 text-center bg-[#101318] border border-[#1e222b] rounded-2xl space-y-1.5">
            <Users className="w-8 h-8 text-gray-500 mx-auto" />
            <h4 className="text-xs font-semibold text-white">Nema raspoređenih članova</h4>
            <p className="text-[11px] text-[#9aa3b2]">Iskoristite obrazac sa leve strane da dodelite dužnost prvom posmatraču.</p>
          </div>
        ) : (
          <div className="bg-[#101318] border border-[#1e222b] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12]">
                    <th className="p-3.5 font-semibold">Ime i prezime</th>
                    <th className="p-3.5 font-semibold">Zvanična uloga</th>
                    <th className="p-3.5 font-semibold">Dodeljen zadatak</th>
                    <th className="p-3.5 font-semibold">Lokacija / Tim</th>
                    {!isReadOnly && <th className="p-3.5 font-semibold text-right">Akcija</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e222b]/50">
                  {assignedPeople
                    .filter(p => p.imePrezime.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => {
                      // Lookup where they are assigned
                      let locationStr = '—';
                      let dutyStr = '—';

                      if (p.tipAngazmana === 'Kontrola izbora') {
                        const activeBM = bm.find(b => b.broj === p.bm);
                        locationStr = activeBM ? `BM ${activeBM.broj} — ${activeBM.naziv}` : `BM ${p.bm || '—'}`;
                        dutyStr = p.dodelaUloga === 'kontrolor' ? 'Kontrolor' : (p.dodelaUloga === 'mobilni_tim' ? 'Mobilni tim' : (p.dodelaUloga === 'sef_bm' ? 'Šef biračkog mesta' : (p.dodelaUloga || 'Kontrola izbora')));
                      } else if (p.tipAngazmana === 'VDV') {
                        locationStr = 'Terenska akcija VDV';
                        dutyStr = `VDV ${p.jeStudent === 'Da' ? '(Student)' : '(Nije student)'}`;
                      } else if (p.tipAngazmana === 'Call centar') {
                        locationStr = 'Call centar';
                        dutyStr = 'Operater';
                      } else if (p.tipAngazmana === 'Logistika') {
                        locationStr = 'Kancelarija / Teren';
                        dutyStr = 'Logistika';
                      } else {
                        // Fallback to legacy assignments (if any)
                        // Check BM
                        const activeBM = bm.find(b => b.sefBM.includes(p.id) || b.kontrolori.includes(p.id));
                        if (activeBM) {
                          locationStr = `BM ${activeBM.broj} — ${activeBM.naziv}`;
                          dutyStr = activeBM.sefBM.includes(p.id) ? 'Šef biračkog mesta' : 'Kontrolor';
                        }

                        // Check MT
                        const activeMT = mt.find(m => m.sefMT.includes(p.id) || m.clanovi.includes(p.id));
                        if (activeMT) {
                          locationStr = `Mobilni tim: Tim ${activeMT.id}`;
                          dutyStr = activeMT.sefMT.includes(p.id) ? 'Šef mobilnog tima' : 'Član mobilnog tima';
                        }
                      }

                      return (
                        <tr key={p.id} className="text-gray-300 hover:bg-white/2">
                          <td className="p-3.5 font-semibold text-white">{p.imePrezime}</td>
                          <td className="p-3.5 capitalize text-gray-400">{p.uloga}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {dutyStr}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-white">{locationStr}</td>
                          
                          {!isReadOnly && (
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`Da li ste sigurni da želite skinuti raspored za korisnika ${p.imePrezime}?`)) {
                                    onRemoveAssignment(p.id);
                                  }
                                }}
                                className="p-1 text-[#9aa3b2] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors inline-flex items-center gap-1"
                                title="Ukloni sa zadatka"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">Ukloni</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
