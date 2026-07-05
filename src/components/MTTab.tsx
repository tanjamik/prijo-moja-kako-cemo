import React, { useState } from 'react';
import { MobilniTim, Person, BirackoMesto } from '../types';
import { Search, Plus, Car, Trash2, Shield, Users, Check, AlertTriangle, X } from 'lucide-react';
import { REONI } from '../data';

interface MTTabProps {
  mt: MobilniTim[];
  people: Person[];
  bm: BirackoMesto[];
  onAddMT: (newMT: MobilniTim) => void;
  onDeleteMT: (id: string) => void;
  isReadOnly: boolean;
  reoni?: string[];
}

export default function MTTab({ mt, people, bm, onAddMT, onDeleteMT, isReadOnly, reoni = REONI }: MTTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [reon, setReon] = useState(reoni[0] || 'Neimar');
  const [pokriva, setPokriva] = useState<string[]>([]);
  const [kola, setKola] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; role: 'sef' | 'clan' }[]>([]);

  React.useEffect(() => {
    setReon(reoni[0] || 'Neimar');
  }, [reoni]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPokriva([]);
    setKola(1);
    setSelectedMembers([]);
    setMemberSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pokriva.length === 0) {
      alert('Molimo odaberite barem jedno biračko mesto koje ovaj tim pokriva.');
      return;
    }

    const nextId = `MT-${mt.length + 1}-${Math.floor(Math.random() * 900 + 100)}`;
    const sefIds = selectedMembers.filter(m => m.role === 'sef').map(m => m.id);
    const clanIds = selectedMembers.filter(m => m.role === 'clan').map(m => m.id);

    onAddMT({
      id: nextId,
      reon,
      pokriva,
      kola,
      sefMT: sefIds,
      clanovi: clanIds
    });

    handleCloseModal();
  };

  const handleToggleBM = (broj: string) => {
    if (pokriva.includes(broj)) {
      setPokriva(pokriva.filter(b => b !== broj));
    } else {
      setPokriva([...pokriva, broj]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Spisak mobilnih timova</h3>
        {!isReadOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 justify-center"
          >
            <Plus className="w-4 h-4" />
            Novi mobilni tim
          </button>
        )}
      </div>

      {/* Grid of Mobilni Timovi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mt.map((m) => {
          const sefNames = m.sefMT.map(id => people.find(p => p.id === id)?.imePrezime).filter(Boolean);
          const clanNames = m.clanovi.map(id => people.find(p => p.id === id)?.imePrezime).filter(Boolean);

          return (
            <div 
              key={m.id}
              className="bg-[#101318] border border-[#1e222b] rounded-2xl p-5 hover:border-[#2a303d] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-xs font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded">
                      Tim {m.id}
                    </span>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        if (confirm(`Da li ste sigurni da želite obrisati mobilni tim ${m.id}?`)) {
                          onDeleteMT(m.id);
                        }
                      }}
                      className="text-[#9aa3b2] hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                      title="Obriši"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Covered Polling Stations */}
                <div className="mt-4">
                  <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Pokriva biračka mesta</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.pokriva.map(broj => (
                      <span key={broj} className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                        BM {broj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Logistical Stats */}
                <div className="mt-4 p-3 bg-[#161a22] rounded-xl border border-[#232935] flex justify-between items-center text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#9aa3b2]" />
                    <span>Dostupno vozila:</span>
                  </div>
                  <span className="font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                    {m.kola} {m.kola === 1 ? 'auto' : 'auta'}
                  </span>
                </div>

                {/* Team assignments */}
                <div className="mt-5 space-y-3.5">
                  {/* Šef MT */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>Šef mobilnog tima</span>
                    </div>
                    {sefNames.length > 0 ? (
                      <div className="text-xs text-white font-semibold">
                        {sefNames.join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 font-medium flex items-center gap-1 italic">
                        <AlertTriangle className="w-3 h-3" />
                        Nije raspoređen
                      </div>
                    )}
                  </div>

                  {/* Članovi MT */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>Članovi tima ({clanNames.length})</span>
                    </div>
                    {clanNames.length > 0 ? (
                      <div className="text-xs text-white space-y-0.5">
                        {clanNames.map((name, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#9aa3b2] italic">Nema raspoređenih članova</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add MT Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#101318] border border-[#1e222b] w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#1e222b] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Kreiraj novi mobilni tim</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Member Selection Section */}
              <div className="space-y-2 pb-4 border-b border-[#1e222b]">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">
                  Izaberi članove mobilnog tima
                </label>
                
                {/* Search input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-3.5 h-3.5 text-gray-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Pretraži osobe po imenu..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Search results dropdown/scrollable area */}
                {memberSearch.trim() !== '' && (
                  <div className="max-h-44 overflow-y-auto border border-[#232935] bg-[#101318] rounded-xl divide-y divide-[#1e222b] shadow-lg">
                    {(() => {
                      const query = memberSearch.toLowerCase();
                      const filtered = people.filter(p => 
                        p.imePrezime.toLowerCase().includes(query) &&
                        !selectedMembers.some(sm => sm.id === p.id)
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="p-3 text-xs text-gray-500 text-center italic">
                            Nema rezultata za "{memberSearch}"
                          </div>
                        );
                      }

                      return filtered.map(p => (
                        <div key={p.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-white/2 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{p.imePrezime}</p>
                            <p className="text-[10px] text-[#9aa3b2] truncate">
                              {p.uloga || 'Bez uloge'}
                            </p>
                          </div>
                          
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMembers([...selectedMembers, { id: p.id, role: 'sef' }]);
                                setMemberSearch('');
                              }}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-[9px] font-bold uppercase text-amber-400 border border-amber-500/20 rounded transition-colors"
                            >
                              + Šef MT
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMembers([...selectedMembers, { id: p.id, role: 'clan' }]);
                                setMemberSearch('');
                              }}
                              className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-[9px] font-bold uppercase text-indigo-400 border border-indigo-500/20 rounded transition-colors"
                            >
                              + Član MT
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Selected members list */}
                <div className="space-y-1.5 mt-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Izabrani članovi ({selectedMembers.length})</div>
                  {selectedMembers.length === 0 ? (
                    <div className="p-2.5 border border-[#232935] border-dashed bg-[#161a22]/20 rounded-xl text-center text-xs text-gray-500 italic">
                      Nema izabranih članova još. Pretražite iznad za dodavanje.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedMembers.map(m => {
                        const personObj = people.find(p => p.id === m.id);
                        if (!personObj) return null;

                        return (
                          <div key={m.id} className="p-2 bg-[#161a22] border border-[#232935] rounded-xl flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{personObj.imePrezime}</p>
                              <p className="text-[9px] text-[#9aa3b2] truncate capitalize">{personObj.uloga || 'Volonter'}</p>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {m.role === 'sef' ? (
                                <span className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8px] font-extrabold uppercase rounded">
                                  Šef MT
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[8px] font-extrabold uppercase rounded">
                                  Član MT
                                </span>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setSelectedMembers(selectedMembers.filter(sm => sm.id !== m.id))}
                                className="text-gray-400 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Vozila count */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider">Dostupan broj automobila</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={kola}
                  onChange={(e) => setKola(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Covered BMs checklist */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Biračka mesta koja pokriva (Odaberi više)</label>
                <div className="max-h-32 overflow-y-auto border border-[#232935] bg-[#161a22] rounded-xl p-3 grid grid-cols-2 gap-2">
                  {bm.map(b => (
                    <div 
                      key={b.broj}
                      onClick={() => handleToggleBM(b.broj)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer select-none transition-all flex items-center justify-between ${
                        pokriva.includes(b.broj)
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-semibold'
                          : 'bg-[#0f1218] border-[#232935] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <span>BM {b.broj}</span>
                      {pokriva.includes(b.broj) && <Check className="w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-2 justify-end border-t border-[#1e222b]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors"
                >
                  Kreiraj mobilni tim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
