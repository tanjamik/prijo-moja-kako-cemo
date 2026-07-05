import React, { useState } from 'react';
import { Person } from '../types';
import { X, FileSpreadsheet, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface ImportPreviewModalProps {
  people: Partial<Person>[];
  errors: string[];
  onConfirm: (mode: 'append' | 'replace') => void;
  onClose: () => void;
}

export default function ImportPreviewModal({ people, errors, onConfirm, onClose }: ImportPreviewModalProps) {
  const [mode, setMode] = useState<'append' | 'replace'>('append');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#171a21] border border-[#2a2f3a] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2f3a]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-green-500" />
            <h2 className="text-base font-semibold text-gray-100">Potvrda Uvoza iz Excel-a</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e222b] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-950/20 border border-green-900/30 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-green-500/20 text-green-400 p-2 rounded-lg">
                <Check size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Uspšno očitano</span>
                <span className="text-lg font-bold text-green-400">{people.length} osoba</span>
              </div>
            </div>

            <div className={`rounded-xl p-3 flex items-center gap-3 border ${
              errors.length > 0 
                ? 'bg-amber-950/20 border-amber-900/30' 
                : 'bg-gray-800/20 border-gray-700/30 text-gray-400'
            }`}>
              <div className={`p-2 rounded-lg ${
                errors.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-500'
              }`}>
                <AlertCircle size={16} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Greške/Upozorenja</span>
                <span className={`text-lg font-bold ${errors.length > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {errors.length}
                </span>
              </div>
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="space-y-2">
            <label className="block text-xs text-[#9aa3b2] font-semibold uppercase tracking-wider">
              Način uvoza podataka
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Append Mode */}
              <div
                onClick={() => setMode('append')}
                className={`border p-4 rounded-xl cursor-pointer transition-all ${
                  mode === 'append'
                    ? 'border-blue-500 bg-blue-950/10 text-white'
                    : 'border-[#2a2f3a] bg-[#1e222b]/50 hover:bg-[#1e222b] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={15} className={mode === 'append' ? 'text-blue-400' : 'text-gray-400'} />
                  <span className="text-xs font-semibold">Dodaj u postojeću bazu</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Sve očitane osobe iz tabele biće dodate kao novi zapisi. Postojeći podaci u bazi ostaju nepromenjeni.
                </p>
              </div>

              {/* Replace Mode */}
              <div
                onClick={() => setMode('replace')}
                className={`border p-4 rounded-xl cursor-pointer transition-all ${
                  mode === 'replace'
                    ? 'border-amber-500 bg-amber-950/10 text-white'
                    : 'border-[#2a2f3a] bg-[#1e222b]/50 hover:bg-[#1e222b] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw size={15} className={mode === 'replace' ? 'text-amber-400' : 'text-gray-400'} />
                  <span className="text-xs font-semibold">Zameni kompletnu bazu</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Zamenjuje sve trenutne zapise novim očitavanjem. Svi postojeći podaci biće obrisani pre upisa.
                </p>
              </div>
            </div>
          </div>

          {/* Warnings List */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Greške tokom očitavanja (preskočeni redovi)
              </label>
              <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-3 max-h-24 overflow-y-auto space-y-1">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-200">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="space-y-2">
            <label className="block text-xs text-[#9aa3b2] font-semibold uppercase tracking-wider">
              Pregled podataka za uvoz (prvih 5 redova)
            </label>
            <div className="border border-[#2a2f3a] rounded-xl bg-[#1e222b]/20 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1e222b] text-gray-400 border-b border-[#2a2f3a]">
                    <th className="p-2.5 font-medium">Ime i prezime</th>
                    <th className="p-2.5 font-medium">Uloga</th>
                    <th className="p-2.5 font-medium">Status</th>
                    <th className="p-2.5 font-medium">Telefon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2f3a] text-gray-300 font-sans">
                  {people.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#1e222b]/10">
                      <td className="p-2.5 font-medium text-white">{p.imePrezime}</td>
                      <td className="p-2.5">{p.uloga}</td>
                      <td className="p-2.5">{p.status}</td>
                      <td className="p-2.5">{p.telefon || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {people.length > 5 && (
                <div className="text-center py-2 bg-[#1e222b]/50 border-t border-[#2a2f3a] text-[10px] text-gray-400">
                  i još {people.length - 5} redova...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2f3a] bg-[#1a1d26] flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-[#2a2f3a] hover:bg-[#1e222b] transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={() => onConfirm(mode)}
            disabled={people.length === 0}
            className={`text-xs text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors cursor-pointer ${
              people.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : mode === 'replace'
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            Uvezi podatke ({people.length})
          </button>
        </div>

      </div>
    </div>
  );
}
