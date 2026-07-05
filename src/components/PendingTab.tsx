import React, { useState } from 'react';
import { PendingPerson } from '../types';
import { ClipboardList, Check, CheckCircle2, UserCheck, UserX, Copy, Sparkles, Phone, Mail, MessageSquare, Plus } from 'lucide-react';

const FIRST_NAMES = ['Marko', 'Jovan', 'Dušan', 'Petar', 'Nikola', 'Luka', 'Aleksandar', 'Filip', 'Stefan', 'Milica', 'Jelena', 'Marija', 'Ana', 'Ivana', 'Dragana', 'Milena', 'Katarina', 'Teodora', 'Sofija', 'Nevena'];
const LAST_NAMES = ['Jovanović', 'Petrović', 'Đorđević', 'Ilić', 'Marković', 'Nikolić', 'Stojanović', 'Popović', 'Kovačević', 'Lukić', 'Simić', 'Zarić', 'Vasić', 'Babić', 'Pavlović', 'Mitrović', 'Tadić', 'Janković', 'Ristić', 'Kostić'];
const REONI_LIST = ['Crveni krst', 'Neimar', 'Kalenić', 'Čubura', 'Vračarski plato'];
const ROLES_LIST = ['kontrolor', 'šef BM', 'vdv volonter', 'šef MT', 'clan MT', 'cc operater', ''];
const NOTES_LIST = [
  'Zainteresovan za rad na biračkom mestu.',
  'Ima iskustva sa prethodnih izbora kao kontrolor.',
  'Slobodan ceo izborni dan, poseduje auto.',
  'Može raditi kao vdv volonter, slobodan popodne.',
  'Spreman za obuku i rad u bilo kom timu.',
  'Bio kontrolor 2023. godine na Vračaru.',
  'Komunikativna osoba, želi da pomogne u call centru.',
  'Pouzdan, ima sopstveni automobil za mobilni tim.',
  'Prvi put se prijavljuje, želi osnovnu obuku.'
];

interface PendingTabProps {
  pending: PendingPerson[];
  onApprove: (item: PendingPerson) => void;
  onReject: (id: string) => void;
  isReadOnly: boolean;
  onAddPending?: (item: PendingPerson) => void;
}

export default function PendingTab({ pending, onApprove, onReject, isReadOnly, onAddPending }: PendingTabProps) {
  const [copied, setCopied] = useState(false);
  const signupLink = 'https://vracar.strukturnozapošljavanje.org/signup?ref=opstina';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    if (!onAddPending) return;
    const ime = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const prezime = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const reon = REONI_LIST[Math.floor(Math.random() * REONI_LIST.length)];
    const bmGlasa = String(Math.floor(Math.random() * 45) + 1).padStart(3, '0');
    const uloga = ROLES_LIST[Math.floor(Math.random() * ROLES_LIST.length)];
    const auto = Math.random() > 0.6;
    const iskustvo = Math.random() > 0.5;
    const tel = `06${Math.floor(Math.random() * 4) + 2} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`;
    const email = `${ime.toLowerCase()}.${prezime.toLowerCase().replace('ć', 'c').replace('đ', 'dj')}@mail.com`;
    const tg = `@${ime.toLowerCase()}${Math.floor(Math.random() * 99)}`;
    const napomene = Math.random() > 0.3 ? NOTES_LIST[Math.floor(Math.random() * NOTES_LIST.length)] : '';

    const newPending: PendingPerson = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ime,
      prezime,
      tel,
      email,
      tg,
      reon,
      bmGlasa,
      uloga,
      auto,
      iskustvo,
      napomene
    };

    onAddPending(newPending);
  };

  return (
    <div className="space-y-6">
      {/* Signup URL widget */}
      <div className="p-6 bg-gradient-to-r from-[#101318] to-[#161b24] border border-[#1e222b] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Javna forma za regrutaciju volontera</span>
          </div>
          <p className="text-xs text-[#9aa3b2]">
            Podelite ovaj link na društvenim mrežama ili Viber/Telegram grupama. Svi prijavljeni će se odmah pojaviti ispod.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0c0e12] border border-[#1e222b] px-3.5 py-2 rounded-xl max-w-full overflow-hidden">
          <span className="text-xs text-[#9aa3b2] truncate select-all">{signupLink}</span>
          <button 
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[#9aa3b2] hover:text-white transition-colors flex-shrink-0"
            title="Kopiraj link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Table List of Registrations */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-blue-400" />
            <span>Prijave na čekanju ({pending.length})</span>
          </h3>
          
          {!isReadOnly && onAddPending && (
            <button
              onClick={handleSimulate}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-blue-500/10 hover:from-amber-500/20 hover:to-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Generiši novu prijavu
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center bg-[#101318] border border-[#1e222b] rounded-2xl space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-white">Sve prijave su pregledane!</h4>
            <p className="text-xs text-[#9aa3b2]">Trenutno nema novih kandidata koji čekaju odobrenje.</p>
          </div>
        ) : (
          <div className="bg-[#101318] border border-[#1e222b] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto font-sans">
                <thead>
                  <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12] text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Ime i prezime / Reon</th>
                    <th className="p-4">Željena uloga</th>
                    <th className="p-4 text-center">BM Glasa</th>
                    <th className="p-4">Kontakt podaci</th>
                    <th className="p-4 text-center">Dodatno</th>
                    <th className="p-4 max-w-xs">Napomene</th>
                    {!isReadOnly && <th className="p-4 text-right">Akcije</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e222b] text-xs">
                  {pending.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-white/2 transition-colors text-gray-300"
                    >
                      {/* Name & Settlement */}
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">
                          {item.ime} {item.prezime}
                        </div>
                        <div className="text-xs text-[#9aa3b2] mt-0.5">
                          Reon: <span className="text-gray-300">{item.reon}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        {item.uloga ? (
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded border border-blue-500/20 bg-blue-500/5 text-blue-400 capitalize">
                            {item.uloga}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded border border-gray-500/20 bg-gray-500/5 text-gray-400">
                            Bez uloge
                          </span>
                        )}
                      </td>

                      {/* Polling Station */}
                      <td className="p-4 text-center font-mono font-bold text-[#e7e9ee]">
                        {item.bmGlasa || '—'}
                      </td>

                      {/* Contacts */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-[#9aa3b2] shrink-0" />
                          <span>{item.tel}</span>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-1.5 text-[#9aa3b2]">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[150px]">{item.email}</span>
                          </div>
                        )}
                        {item.tg && (
                          <div className="flex items-center gap-1.5 text-sky-400">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.tg}</span>
                          </div>
                        )}
                      </td>

                      {/* Auto & Experience Badges */}
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1">
                          {item.auto && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                              Auto
                            </span>
                          )}
                          {item.iskustvo && (
                            <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded shrink-0">
                              Iskusan
                            </span>
                          )}
                          {!item.auto && !item.iskustvo && (
                            <span className="text-gray-600 text-[10px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="p-4 max-w-xs">
                        <p className="text-gray-400 italic break-words line-clamp-2" title={item.napomene}>
                          {item.napomene ? `“${item.napomene}”` : 'Nema napomene'}
                        </p>
                      </td>

                      {/* Approve / Reject Actions */}
                      {!isReadOnly && (
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => onReject(item.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-colors"
                              title="Odbij prijavu"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onApprove(item)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                              title="Odobri i upiši u bazu"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Odobri</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
