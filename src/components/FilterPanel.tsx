import React from 'react';
import { FilterState } from '../types';
import { AVAILABLE_ROLES, AVAILABLE_STATUSES, AVAILABLE_STAGES, REONI } from '../data';
import { RotateCcw, X } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
  reoni?: string[];
}

export default function FilterPanel({ filters, onChange, onClose, reoni = REONI }: FilterPanelProps) {
  const handleSelectChange = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleBooleanChange = (key: keyof FilterState, value: string) => {
    let boolVal: boolean | null = null;
    if (value === 'da') boolVal = true;
    if (value === 'ne') boolVal = false;
    onChange({ ...filters, [key]: boolVal });
  };

  const resetFilters = () => {
    onChange({
      q: filters.q, // keep search text
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
  };

  const getSelectBoolValue = (val: boolean | null): string => {
    if (val === true) return 'da';
    if (val === false) return 'ne';
    return '';
  };

  return (
    <div className="bg-[#171a21] border border-[#2a2f3a] rounded-xl p-5 mb-5 shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2a2f3a]">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200 uppercase">Napredni Filteri</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1e222b] transition-colors"
          title="Zatvori filtere"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Dropdowns */}
        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Uloga</label>
          <select
            value={filters.uloga}
            onChange={(e) => handleSelectChange('uloga', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Sve uloge</option>
            <option value="bez uloge">Bez uloge (Samo kontakt)</option>
            {AVAILABLE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svi statusi</option>
            {AVAILABLE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Faza</label>
          <select
            value={filters.faza}
            onChange={(e) => handleSelectChange('faza', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Sve faze</option>
            {AVAILABLE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Booleans */}
        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Poseduje automobil</label>
          <select
            value={getSelectBoolValue(filters.auto)}
            onChange={(e) => handleBooleanChange('auto', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svejedno</option>
            <option value="da">Da</option>
            <option value="ne">Ne</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Iskustvo na izborima</label>
          <select
            value={getSelectBoolValue(filters.iskustvo)}
            onChange={(e) => handleBooleanChange('iskustvo', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svejedno</option>
            <option value="da">Da</option>
            <option value="ne">Ne</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Osnovni trening</label>
          <select
            value={getSelectBoolValue(filters.obukaOsnovna)}
            onChange={(e) => handleBooleanChange('obukaOsnovna', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svejedno</option>
            <option value="da">Da</option>
            <option value="ne">Ne</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Napredni trening</label>
          <select
            value={getSelectBoolValue(filters.obukaNapredna)}
            onChange={(e) => handleBooleanChange('obukaNapredna', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svejedno</option>
            <option value="da">Da</option>
            <option value="ne">Ne</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Poreklo</label>
          <select
            value={filters.poreklo}
            onChange={(e) => handleSelectChange('poreklo', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Sva porekla</option>
            <option value="Prijava preko forma">Prijava preko forma</option>
            <option value="Akcija">Akcija</option>
            <option value="Štand">Štand</option>
            <option value="Preporuka">Preporuka</option>
            <option value="Drugo">Drugo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#9aa3b2] mb-1.5 font-medium">Osoba od poverenja</label>
          <select
            value={getSelectBoolValue(filters.odPoverenja)}
            onChange={(e) => handleBooleanChange('odPoverenja', e.target.value)}
            className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Svejedno</option>
            <option value="da">Da</option>
            <option value="ne">Ne</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[#2a2f3a]">
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1e222b] transition-colors"
        >
          <RotateCcw size={13} />
          Resetuj filtere
        </button>
      </div>
    </div>
  );
}
