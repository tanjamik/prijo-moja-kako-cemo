import React, { useState } from 'react';
import { CustomField } from '../types';
import { X, Plus, Trash2, Settings } from 'lucide-react';

interface CustomFieldModalProps {
  customFields: CustomField[];
  onAdd: (field: CustomField) => void;
  onRemove: (key: string) => void;
  onClose: () => void;
}

export default function CustomFieldModal({ customFields, onAdd, onRemove, onClose }: CustomFieldModalProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'boolean' | 'select'>('text');
  const [optionsStr, setOptionsStr] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert('Unesite naziv kolone.');
      return;
    }

    const key = `cf_${label.toLowerCase().trim()
      .replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36).substr(-4)}`;

    let options: string[] | undefined = undefined;
    if (type === 'select') {
      options = optionsStr.split(',')
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
      
      if (options.length === 0) {
        alert('Unesite opcije za izbor odvojene zarezom.');
        return;
      }
    }

    const newField: CustomField = {
      key,
      label: label.trim(),
      type,
      options
    };

    onAdd(newField);
    setLabel('');
    setType('text');
    setOptionsStr('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#171a21] border border-[#2a2f3a] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2f3a]">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-blue-500 animate-spin-slow" />
            <h2 className="text-base font-semibold text-gray-100">Prilagođeni Atributi (Kolone)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e222b] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Add New Attribute Form */}
          <form onSubmit={handleSubmit} className="bg-[#1e222b]/50 border border-[#2a2f3a] rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Novi atribut (Kolona)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Naziv atributa</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="npr. Dodatni kontakt"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">Tip podatka</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="text">Tekst</option>
                  <option value="number">Broj</option>
                  <option value="boolean">Kvačica (Da/Ne)</option>
                  <option value="select">Izbor opcija</option>
                </select>
              </div>
            </div>

            {type === 'select' && (
              <div>
                <label className="block text-xs text-[#9aa3b2] mb-1 font-medium">
                  Opcije za izbor (odvojene zarezom)
                </label>
                <input
                  type="text"
                  required
                  value={optionsStr}
                  onChange={(e) => setOptionsStr(e.target.value)}
                  placeholder="S, M, L, XL, XXL"
                  className="w-full bg-[#1e222b] border border-[#2a2f3a] text-[#e7e9ee] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Unesite vrednosti odvojene zarezima koje će biti ponuđene u padajućem meniju.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-medium shadow-md transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Dodaj novu kolonu
            </button>
          </form>

          {/* List of Existing Attributes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#9aa3b2] tracking-wider uppercase">Postojeći prilagođeni atributi</h3>
            {customFields.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-4 bg-[#1e222b]/20 border border-[#2a2f3a]/50 rounded-xl">
                Nema kreiranih prilagođenih atributa. Možete ih dodati iznad.
              </p>
            ) : (
              <div className="divide-y divide-[#2a2f3a] border border-[#2a2f3a] rounded-xl bg-[#1e222b]/20 overflow-hidden">
                {customFields.map((cf) => (
                  <div key={cf.key} className="flex justify-between items-center p-4 hover:bg-[#1e222b]/30 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-xs font-medium text-gray-200 block">{cf.label}</span>
                      <span className="text-[10px] text-gray-400">
                        Tip:{' '}
                        <span className="font-mono text-blue-400">
                          {cf.type === 'text'
                            ? 'Tekst'
                            : cf.type === 'number'
                            ? 'Broj'
                            : cf.type === 'boolean'
                            ? 'Da/Ne kvačica'
                            : 'Izbor opcija'}
                        </span>
                        {cf.options && ` (${cf.options.join(', ')})`}
                      </span>
                    </div>

                    {confirmDeleteKey === cf.key ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-red-400 font-semibold mr-1">Obriši?</span>
                        <button
                          onClick={() => {
                            onRemove(cf.key);
                            setConfirmDeleteKey(null);
                          }}
                          className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
                        >
                          Da
                        </button>
                        <button
                          onClick={() => setConfirmDeleteKey(null)}
                          className="px-2 py-1 text-[10px] bg-[#1e222b] hover:bg-[#2a2f3a] text-gray-300 rounded-lg transition-colors"
                        >
                          Ne
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteKey(cf.key)}
                        className="text-red-500 hover:text-white p-1.5 rounded-lg hover:bg-red-950/40 transition-colors shrink-0"
                        title="Obriši kolonu"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2f3a] bg-[#1a1d26] flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="text-xs text-gray-300 hover:text-white px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium shadow-md transition-colors"
          >
            Završi
          </button>
        </div>

      </div>
    </div>
  );
}
