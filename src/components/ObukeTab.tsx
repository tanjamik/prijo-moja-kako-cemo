import React, { useState } from 'react';
import { Obuka, Person, UcesnikObuke } from '../types';
import { GraduationCap, Plus, Calendar, Check, X, Search, Table, SlidersHorizontal, BookOpen, Trash2 } from 'lucide-react';

interface ObukeTabProps {
  obuke: Obuka[];
  people: Person[];
  onAddObuka: (newObuka: Obuka) => void;
  onDeleteObuka: (obukaId: string) => void;
  onUpdateAttendance: (obukaId: string, pid: string, status: 'pozvan' | 'prisustvovao' | 'nije prisustvovao', komentar?: string) => void;
  isReadOnly: boolean;
}

export default function ObukeTab({ obuke, people, onAddObuka, onDeleteObuka, onUpdateAttendance, isReadOnly }: ObukeTabProps) {
  // Navigation sub-tabs
  const [viewMode, setViewMode] = useState<'tabela' | 'evidencija'>('tabela');
  
  // Selection states for individual sessions
  const [selectedObukaId, setSelectedObukaId] = useState<string>(obuke[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search filter for table of people
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for scheduling training
  const [naziv, setNaziv] = useState('Obuka za kontrolore');
  const [tip, setTip] = useState<'uživo' | 'online'>('uživo');
  const [datum, setDatum] = useState('');
  const [invitedPids, setInvitedPids] = useState<string[]>([]);
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  
  const selectedObuka = obuke.find(o => o.id === selectedObukaId) || obuke[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naziv || !datum) return;

    const nextId = `OB-${obuke.length + 1}-${Math.floor(Math.random() * 900 + 100)}`;
    
    // Construct invited users array
    const ucesnici: UcesnikObuke[] = invitedPids.map(pid => ({
      pid,
      status: 'pozvan',
      komentar: ''
    }));

    onAddObuka({
      id: nextId,
      naziv,
      tip,
      datum,
      ucesnici
    });

    // Reset
    setNaziv('Obuka za kontrolore');
    setDatum('');
    setInvitedPids([]);
    setInviteSearchTerm('');
    setIsModalOpen(false);
    setSelectedObukaId(nextId);
  };

  const handleToggleInvite = (pid: string) => {
    if (invitedPids.includes(pid)) {
      setInvitedPids(invitedPids.filter(id => id !== pid));
    } else {
      setInvitedPids([...invitedPids, pid]);
    }
  };

  // Helper to extract training status for a person
  const getTrainingStatus = (pid: string, type: 'kontrolor' | 'vdv' | 'call') => {
    const matches = obuke.filter(o => {
      const name = o.naziv.toLowerCase();
      if (type === 'kontrolor') return name.includes('kontrolor');
      if (type === 'vdv') return name.includes('vdv');
      if (type === 'call') return name.includes('call') || name.includes('kol') || name.includes('centar');
      return false;
    });

    let best: { status: 'pozvan' | 'prisustvovao' | 'nije prisustvovao'; date: string; tip: 'uživo' | 'online'; obukaId: string } | null = null;

    for (const ob of matches) {
      const u = ob.ucesnici.find(participant => participant.pid === pid);
      if (u) {
        if (!best || u.status === 'prisustvovao' || (best.status !== 'prisustvovao' && u.status === 'nije prisustvovao')) {
          best = {
            status: u.status,
            date: ob.datum,
            tip: ob.tip,
            obukaId: ob.id
          };
        }
      }
    }

    return best;
  };

  // Render a dropdown inside cells for easy instant scheduling/editing
  const renderTrainingCell = (pid: string, type: 'kontrolor' | 'vdv' | 'call') => {
    const info = getTrainingStatus(pid, type);

    // Find latest scheduled training of this type
    const matches = obuke.filter(o => {
      const name = o.naziv.toLowerCase();
      if (type === 'kontrolor') return name.includes('kontrolor');
      if (type === 'vdv') return name.includes('vdv');
      if (type === 'call') return name.includes('call') || name.includes('kol') || name.includes('centar');
      return false;
    });

    const latestTrainingId = matches[matches.length - 1]?.id || '';
    const value = info ? info.status : 'none';

    return (
      <div className="flex flex-col gap-1">
        <select
          value={value}
          disabled={isReadOnly}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'none') {
              if (info) {
                onUpdateAttendance(info.obukaId, pid, 'nije prisustvovao');
              }
            } else {
              let obukaIdToUse = latestTrainingId;
              if (!obukaIdToUse) {
                // Auto create standard training for today
                let defaultNaziv = "Obuka za vdv";
                if (type === 'kontrolor') defaultNaziv = "Obuka za kontrolore";
                if (type === 'call') defaultNaziv = "Obuka za call centar";

                const todayStr = new Date().toISOString().split('T')[0];
                const nextId = `OB-${obuke.length + 1}-${Math.floor(Math.random() * 900 + 100)}`;
                
                onAddObuka({
                  id: nextId,
                  naziv: defaultNaziv,
                  tip: 'uživo',
                  datum: todayStr,
                  ucesnici: [{ pid, status: val as any, komentar: '' }]
                });
                return;
              }
              onUpdateAttendance(obukaIdToUse, pid, val as any);
            }
          }}
          className={`px-2 py-1 rounded-xl text-[11px] font-bold border outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full max-w-[150px] transition-all ${
            value === 'prisustvovao' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            value === 'nije prisustvovao' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            value === 'pozvan' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-[#161a22] border-[#232935] text-gray-500 hover:border-gray-600'
          }`}
        >
          <option value="none" className="bg-[#101318] text-gray-500">— Nije upisan</option>
          <option value="pozvan" className="bg-[#101318] text-amber-400">🟡 Pozvan</option>
          <option value="prisustvovao" className="bg-[#101318] text-emerald-400">🟢 Prisustvovao</option>
          <option value="nije prisustvovao" className="bg-[#101318] text-red-400">🔴 Nije bio</option>
        </select>

        {info && (
          <span className="text-[9px] text-[#9aa3b2] font-semibold pl-1">
            {info.date} • <span className="capitalize">{info.tip}</span>
          </span>
        )}
      </div>
    );
  };

  // Filtered people for the main table
  const filteredPeople = people.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.imePrezime.toLowerCase().includes(q) ||
      (p.uloga && p.uloga.toLowerCase().includes(q)) ||
      (p.reon && p.reon.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#101318] border border-[#1e222b] rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('tabela')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'tabela'
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold'
                : 'bg-transparent border border-transparent text-[#9aa3b2] hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabela polaznika i obuka</span>
          </button>
          
          <button
            onClick={() => setViewMode('evidencija')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'evidencija'
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold'
                : 'bg-transparent border border-transparent text-[#9aa3b2] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Organizacija i evidencija obuka</span>
          </button>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Zakaži novu obuku</span>
          </button>
        )}
      </div>

      {/* VIEW MODE 1: TABULAR OVERVIEW */}
      {viewMode === 'tabela' && (
        <div className="space-y-4">
          {/* Search bar inside view */}
          <div className="flex items-center gap-3 p-4 bg-[#101318] border border-[#1e222b] rounded-2xl">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Pretraži polaznike po imenu, ulozi ili reonu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#0c0e12] border border-[#1e222b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-[11px] text-[#9aa3b2] font-semibold hidden md:block">
              Ukupno: <strong className="text-white">{filteredPeople.length}</strong> polaznika
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#101318] border border-[#1e222b] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12]">
                    <th className="p-3.5 font-bold text-white">Ime i prezime</th>
                    <th className="p-3.5 font-bold text-white">Uloga</th>
                    <th className="p-3.5 font-bold text-white">Obuka za kontrolora</th>
                    <th className="p-3.5 font-bold text-white">Obuka za vdv</th>
                    <th className="p-3.5 font-bold text-white">Obuka za call centar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e222b]/50">
                  {filteredPeople.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-[#9aa3b2] italic">
                        Nema pronađenih polaznika za upisani kriterijum.
                      </td>
                    </tr>
                  ) : (
                    filteredPeople.map((p) => (
                      <tr
                        key={p.id}
                        className="group hover:bg-[#161a22]/80 transition-all duration-150"
                      >
                        <td className="p-3.5 font-semibold text-white font-sans">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {p.imePrezime}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-0.5">{p.reon}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-300 capitalize">
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                            {p.uloga || 'Bez uloge'}
                          </span>
                        </td>
                        <td className="p-3.5">{renderTrainingCell(p.id, 'kontrolor')}</td>
                        <td className="p-3.5">{renderTrainingCell(p.id, 'vdv')}</td>
                        <td className="p-3.5">{renderTrainingCell(p.id, 'call')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DETAILED SESSIONS / WORKFLOW VIEW */}
      {viewMode === 'evidencija' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Course Schedule List */}
          <div className="xl:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <GraduationCap className="w-4.5 h-4.5 text-blue-400" />
              <span>Evidencija obuka</span>
            </h3>

            {obuke.length === 0 ? (
              <div className="p-8 text-center bg-[#101318] border border-[#1e222b] rounded-2xl text-xs text-[#9aa3b2] italic">
                Nema evidentiranih obuka.
              </div>
            ) : (
              <div className="space-y-2">
                {obuke.map((o) => {
                  const countAttended = o.ucesnici.filter(u => u.status === 'prisustvovao').length;
                  const isSelected = o.id === selectedObukaId;

                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedObukaId(o.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1b202a] border-[#3b82f6]/40 text-white'
                          : 'bg-[#101318] border-[#1e222b] text-gray-300 hover:bg-[#15181e] hover:border-[#2a303d]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                          {o.tip}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3" />
                            {o.datum}
                          </span>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Da li ste sigurni da želite da obrišete obuku "${o.naziv}"?`)) {
                                  onDeleteObuka(o.id);
                                  const remaining = obuke.filter(item => item.id !== o.id);
                                  if (remaining.length > 0) {
                                    setSelectedObukaId(remaining[0].id);
                                  } else {
                                    setSelectedObukaId('');
                                  }
                                }
                              }}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Obriši obuku"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold mt-2.5 line-clamp-1">{o.naziv}</h4>
                      <div className="mt-2 text-[10px] text-[#9aa3b2] flex justify-between items-center">
                        <span>Pozvano: <strong className="text-white">{o.ucesnici.length}</strong></span>
                        <span>Prisutno: <strong className="text-emerald-400">{countAttended}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Prozivnik (Attendance tracker) */}
          <div className="xl:col-span-8 space-y-4">
            {selectedObuka ? (
              <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
                {/* Header info */}
                <div className="border-b border-[#1e222b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedObuka.naziv}</h3>
                    <p className="text-[11px] text-[#9aa3b2] mt-0.5">
                      Tip: <span className="text-white font-medium capitalize">{selectedObuka.tip}</span> | Datum obuke:{' '}
                      <span className="text-white font-medium">{selectedObuka.datum}</span>
                    </p>
                  </div>
                </div>

                {/* Attendance sheet */}
                {selectedObuka.ucesnici.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#9aa3b2] italic">
                    Nema pozvanih učesnika na ovu obuku.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#1e222b] text-[#9aa3b2]">
                          <th className="pb-3 font-semibold">Učesnik (Ime i prezime)</th>
                          <th className="pb-3 font-semibold">Telefon</th>
                          <th className="pb-3 font-semibold">Status prisustva</th>
                          <th className="pb-3 font-semibold">Komentar / Beleška</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e222b]/50">
                        {selectedObuka.ucesnici.map((u) => {
                          const personObj = people.find(p => p.id === u.pid);
                          if (!personObj) return null;

                          return (
                            <tr key={u.pid} className="text-gray-300">
                              <td className="py-3 font-medium text-white">{personObj.imePrezime}</td>
                              <td className="py-3 text-[11px] text-[#9aa3b2]">{personObj.telefon}</td>
                              
                              {/* Attendance Status Picker */}
                              <td className="py-3">
                                <div className="flex gap-1">
                                  {/* Pozvan */}
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => onUpdateAttendance(selectedObuka.id, u.pid, 'pozvan', u.komentar)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                      u.status === 'pozvan'
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        : 'bg-[#161a22]/50 border-transparent text-[#9aa3b2] hover:bg-white/5'
                                    }`}
                                  >
                                    Pozvan
                                  </button>

                                  {/* Prisustvovao */}
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => onUpdateAttendance(selectedObuka.id, u.pid, 'prisustvovao', u.komentar)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                      u.status === 'prisustvovao'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-[#161a22]/50 border-transparent text-[#9aa3b2] hover:bg-white/5'
                                    }`}
                                  >
                                    Prisustvovao
                                  </button>

                                  {/* Nije prisustvovao */}
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => onUpdateAttendance(selectedObuka.id, u.pid, 'nije prisustvovao', u.komentar)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                      u.status === 'nije prisustvovao'
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : 'bg-[#161a22]/50 border-transparent text-[#9aa3b2] hover:bg-white/5'
                                    }`}
                                  >
                                    Nije bio
                                  </button>
                                </div>
                              </td>

                              {/* Comment box */}
                              <td className="py-3">
                                <input
                                  type="text"
                                  disabled={isReadOnly}
                                  placeholder="Dodaj komentar..."
                                  value={u.komentar || ''}
                                  onChange={(e) => onUpdateAttendance(selectedObuka.id, u.pid, u.status, e.target.value)}
                                  className="w-full bg-[#161a22] border border-[#232935] px-2 py-1 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#101318] border border-[#1e222b] rounded-2xl text-xs text-[#9aa3b2] italic">
                Odaberite obuku sa leve strane da vidite prozivnik i vodite evidenciju prisustva.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Training Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#101318] border border-[#1e222b] w-full max-w-lg rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#1e222b] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Zakaži novu obuku volontera</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Naziv obuke */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Naziv / Tema obuke</label>
                  <select
                    value={naziv}
                    onChange={(e) => setNaziv(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Obuka za kontrolore">Obuka za kontrolore</option>
                    <option value="Obuka za vdv">Obuka za vdv</option>
                    <option value="Obuka za call centar">Obuka za call centar</option>
                  </select>
                </div>

                {/* Datum */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Datum održavanja</label>
                  <input
                    type="date"
                    required
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none"
                  />
                </div>

                {/* Tip obuke */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Tip predavanja</label>
                  <select
                    value={tip}
                    onChange={(e) => setTip(e.target.value as 'uživo' | 'online')}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none cursor-pointer"
                  >
                    <option value="uživo">Uživo (u prostorijama)</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              {/* Multi Select Invite list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Pozovi učesnike (Odaberi ljude)</label>
                  {invitedPids.length > 0 && (
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Izabrano: {invitedPids.length}
                    </span>
                  )}
                </div>

                {/* Search Bar for inviting people */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Pretraži po imenu, ulozi ili reonu..."
                    value={inviteSearchTerm}
                    onChange={(e) => setInviteSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {inviteSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setInviteSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto border border-[#232935] bg-[#161a22] rounded-xl p-3 space-y-1.5">
                  {people
                    .filter(p => {
                      const term = inviteSearchTerm.toLowerCase().trim();
                      if (!term) return true;
                      return (
                        p.imePrezime.toLowerCase().includes(term) ||
                        (p.uloga && p.uloga.toLowerCase().includes(term))
                      );
                    })
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleToggleInvite(p.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer select-none flex justify-between items-center transition-all ${
                          invitedPids.includes(p.id)
                            ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 font-semibold'
                            : 'bg-[#0f1218] border-[#232935] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{p.imePrezime}</div>
                          <div className="text-[10px] text-[#9aa3b2] mt-0.5 capitalize">{p.uloga || 'Bez uloge'}</div>
                        </div>
                        {invitedPids.includes(p.id) && <Check className="w-4 h-4" />}
                      </div>
                    ))}
                  {people.filter(p => {
                    const term = inviteSearchTerm.toLowerCase().trim();
                    if (!term) return true;
                    return (
                      p.imePrezime.toLowerCase().includes(term) ||
                      (p.uloga && p.uloga.toLowerCase().includes(term))
                    );
                  }).length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-500">
                      Nema pronađenih ljudi za pretragu "{inviteSearchTerm}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-2 justify-end border-t border-[#1e222b]">
                <button
                  type="button"
                  onClick={() => {
                    setInviteSearchTerm('');
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
                >
                  Sačuvaj i pozovi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
