import React, { useState } from 'react';
import { Kontakt, Person } from '../types';
import { PhoneCall, Plus, Calendar, Search, CheckCircle, XCircle, Clock, X } from 'lucide-react';

interface KomunikacijaTabProps {
  kontakti: Kontakt[];
  people: Person[];
  onAddKontakt: (newKontakt: Kontakt, nextStatus?: string) => void;
  isReadOnly: boolean;
}

export default function KomunikacijaTab({ kontakti, people, onAddKontakt, isReadOnly }: KomunikacijaTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [pid, setPid] = useState('');
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [ko, setKo] = useState('');
  const [rezultat, setRezultat] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid || !ko || !rezultat) return;

    const nextId = `C-${kontakti.length + 1}-${Math.floor(Math.random() * 900 + 100)}`;
    
    onAddKontakt({
      id: nextId,
      pid,
      datum,
      ko,
      rezultat
    }, updateStatus || undefined);

    // Reset
    setPid('');
    setRezultat('');
    setUpdateStatus('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <PhoneCall className="w-4.5 h-4.5 text-blue-400" />
          <span>Istorija komunikacije ({kontakti.length} kontakata)</span>
        </h3>

        <div className="flex gap-2">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Pretraži zapise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#101318] border border-[#1e222b] rounded-xl text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Zabeleži kontakt
            </button>
          )}
        </div>
      </div>

      {/* Log list table */}
      {kontakti.length === 0 ? (
        <div className="p-12 text-center bg-[#101318] border border-[#1e222b] rounded-2xl text-xs text-[#9aa3b2] italic">
          Nema zabeleženih komunikacija u bazi.
        </div>
      ) : (
        <div className="bg-[#101318] border border-[#1e222b] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12]">
                  <th className="p-3.5 font-semibold">Datum</th>
                  <th className="p-3.5 font-semibold">Sagovornik (Volonter)</th>
                  <th className="p-3.5 font-semibold">Zabeležio/la</th>
                  <th className="p-3.5 font-semibold">Rezultat poziva / Napomena</th>
                  <th className="p-3.5 font-semibold text-right">Zvaničan status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e222b]/50">
                {kontakti
                  .filter((k) => {
                    const personObj = people.find(p => p.id === k.pid);
                    const name = personObj ? personObj.imePrezime.toLowerCase() : '';
                    return name.includes(searchQuery.toLowerCase()) || k.ko.toLowerCase().includes(searchQuery.toLowerCase()) || k.rezultat.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((k) => {
                    const personObj = people.find(p => p.id === k.pid);
                    const name = personObj ? personObj.imePrezime : 'Nepoznati član';
                    const status = personObj ? personObj.status : '—';

                    return (
                      <tr key={k.id} className="text-gray-300 hover:bg-white/2">
                        <td className="p-3.5 whitespace-nowrap text-gray-400 font-semibold">{k.datum}</td>
                        <td className="p-3.5 font-semibold text-white">{name}</td>
                        <td className="p-3.5 text-xs text-[#9aa3b2]">{k.ko}</td>
                        <td className="p-3.5 text-xs leading-relaxed max-w-sm">{k.rezultat}</td>
                        <td className="p-3.5 text-right whitespace-nowrap capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            status === 'potvrđen' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            status === 'kontaktiran' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            status === 'odustao' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-gray-500/10 border-gray-500/20 text-gray-400'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log contact modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#101318] border border-[#1e222b] w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#1e222b] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Zabeleži novi razgovor / kontakt</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Volonter */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Sagovornik (Pozvani volonter)</label>
                <select
                  required
                  value={pid}
                  onChange={(e) => setPid(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none"
                >
                  <option value="">-- Izaberi osobu --</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.imePrezime} ({p.telefon})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Datum */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Datum kontakta</label>
                  <input
                    type="date"
                    required
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none"
                  />
                </div>

                {/* Ko je zvao */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Poziv obavio/la (Operater)</label>
                  <input
                    type="text"
                    required
                    placeholder="npr. Milica J."
                    value={ko}
                    onChange={(e) => setKo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Rezultat */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Rezultat / Beleška razgovora</label>
                <textarea
                  required
                  rows={3}
                  placeholder="npr. Potvrdila učešće, doći će na osnovnu obuku 20. juna..."
                  value={rezultat}
                  onChange={(e) => setRezultat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none resize-none"
                />
              </div>

              {/* Update core status */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#9aa3b2] uppercase tracking-wider block">Odmah ažuriraj zvaničan status osobe (Opciono)</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none"
                >
                  <option value="">-- Bez promene statusa --</option>
                  <option value="potvrđen">Potvrđen</option>
                  <option value="kontaktiran">Kontaktiran</option>
                  <option value="potencijalni">Potencijalni</option>
                  <option value="odustao">Odustao</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-2 justify-end border-t border-[#1e222b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors"
                >
                  Zapiši razgovor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
