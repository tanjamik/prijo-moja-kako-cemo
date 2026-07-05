import React from 'react';
import { Person, BirackoMesto, MobilniTim, Obuka, PendingPerson } from '../types';
import { LayoutDashboard, Users, MapPin, Truck, GraduationCap, ArrowRight, UserCheck, Shield, Headphones, Award, User } from 'lucide-react';

interface DashboardTabProps {
  people: Person[];
  bm: BirackoMesto[];
  mt: MobilniTim[];
  obuke: Obuka[];
  pending: PendingPerson[];
  selectedOpstina?: string;
}

export default function DashboardTab({ people, bm, mt, obuke, pending, selectedOpstina = 'Vračar' }: DashboardTabProps) {
  // --- High Level Calculations ---
  const totalPeople = people.length;
  const totalBM = bm.length;
  const activeMT = mt.length;

  const getOpstinaSuffix = (opstina: string) => {
    switch (opstina) {
      case 'Novi Beograd': return 'u NB';
      case 'Vračar': return 'na VR';
      case 'Stari grad': return 'u SG';
      case 'Savski venac': return 'u SV';
      case 'Zvezdara': return 'na ZV';
      case 'Palilula': return 'u PA';
      case 'Voždovac': return 'u VO';
      default: return `u ${opstina.toUpperCase()}`;
    }
  };
  
  const hasRole = (p: Person, roleName: string) => {
    if (!p.uloga) return false;
    return p.uloga.toLowerCase().split(',').map(r => r.trim()).includes(roleName.toLowerCase());
  };

  // Count unique people who attended at least one training
  const attendedUnique = new Set<string>();
  obuke.forEach(o => {
    o.ucesnici.forEach(u => {
      if (u.status === 'prisustvovao') {
        attendedUnique.add(u.pid);
      }
    });
  });
  const trainedVolunteers = attendedUnique.size;

  // Count controllers who are completely trained or completed online training
  const kompletonObuceniKontrolori = people.filter(p => {
    if (!hasRole(p, 'kontrolor')) return false;
    if (p.obukaOsnovna && p.obukaNapredna) return true;
    const attendedUzivo = obuke.some(o => 
      o.tip === 'uživo' && 
      o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao')
    );
    const attendedOnline = obuke.some(o => 
      o.tip === 'online' && 
      o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao')
    );
    return attendedUzivo && attendedOnline;
  }).length;

  const controllersWithOnline = people.filter(p => {
    if (!hasRole(p, 'kontrolor')) return false;
    const attendedOnline = obuke.some(o => 
      o.tip === 'online' && 
      o.ucesnici.some(u => u.pid === p.id && u.status === 'prisustvovao')
    );
    return attendedOnline || p.obukaNapredna;
  }).length;

  // Count leaders of polling stations
  const totalSefovi = people.filter(p => hasRole(p, 'šef BM')).length;
  const assignedSefovi = bm.filter(b => b.sefBM.length > 0).length;

  // Count controllers (inspectors)
  const totalKontrolori = people.filter(p => hasRole(p, 'kontrolor')).length;
  const assignedKontroloriSet = new Set<string>();
  bm.forEach(b => b.kontrolori.forEach(id => assignedKontroloriSet.add(id)));
  const assignedKontroloriCount = assignedKontroloriSet.size;

  // --- Funnel Counts ---
  const funnel = {
    pending: pending.length,
    contacted: people.filter(p => p.status === 'kontaktiran').length,
    confirmed: people.filter(p => p.status === 'potvrđen').length,
    assigned: people.filter(p => p.rasporedjen).length,
  };

  // --- Role Counts ---
  const roleCounts: { [key: string]: number } = {};
  people.forEach(p => {
    if (p.uloga) {
      const roles = p.uloga.split(',').map(r => r.trim()).filter(Boolean);
      if (roles.length > 0) {
        roles.forEach(r => {
          roleCounts[r] = (roleCounts[r] || 0) + 1;
        });
      } else {
        roleCounts['Bez uloge'] = (roleCounts['Bez uloge'] || 0) + 1;
      }
    } else {
      roleCounts['Bez uloge'] = (roleCounts['Bez uloge'] || 0) + 1;
    }
  });

  // --- Reon Coverage Analysis ---
  const reoniCoverage = Array.from(new Set(bm.map(b => b.reon))).map(reonName => {
    const bmInReon = bm.filter(b => b.reon === reonName);
    const totalSpots = bmInReon.length * 3; // 1 chief + 2 controllers
    const filledSefovi = bmInReon.filter(b => b.sefBM.length > 0).length;
    const filledKontrolori = bmInReon.reduce((sum, b) => sum + b.kontrolori.length, 0);
    const filledSpots = filledSefovi + filledKontrolori;
    const pct = totalSpots > 0 ? Math.round((filledSpots / totalSpots) * 100) : 0;
    return {
      reon: reonName,
      totalSpots,
      filledSpots,
      pct,
      bmCount: bmInReon.length,
      filledSefovi,
      filledKontrolori
    };
  }).sort((a, b) => b.pct - a.pct);

  const pctSefovi = totalBM > 0 ? Math.round((assignedSefovi / totalBM) * 100) : 0;
  const totalKontrolorSpots = totalBM * 2;
  const assignedKontroloriSpots = bm.reduce((sum, b) => sum + b.kontrolori.length, 0);
  const pctKontrolori = totalKontrolorSpots > 0 ? Math.round((assignedKontroloriSpots / totalKontrolorSpots) * 100) : 0;

  const populatedMT = mt.filter(m => m.sefMT.length > 0 || m.clanovi.length > 0).length;
  const pctMT = activeMT > 0 ? Math.round((populatedMT / activeMT) * 100) : 0;
  const totalMTMembers = mt.reduce((sum, m) => sum + m.sefMT.length + m.clanovi.length, 0);

  const overallPct = totalBM > 0 ? Math.round(((assignedSefovi + assignedKontroloriSpots) / (totalBM * 3)) * 100) : 0;

  const excludedRoles = ['šef bm', 'sef bm', 'kontrolor'];
  const extraRoles = Object.entries(roleCounts)
    .filter(([roleName, count]) => {
      const r = roleName.toLowerCase().trim();
      return !excludedRoles.includes(r) && count > 0;
    })
    .sort((a, b) => b[1] - a[1]);

  const getRoleCardConfig = (roleName: string) => {
    const r = roleName.toLowerCase().trim();
    if (r.includes('clan mt') || r.includes('član mt')) {
      return {
        icon: Users,
        colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        label: 'Članovi MT'
      };
    }
    if (r.includes('sef mt') || r.includes('šef mt')) {
      return {
        icon: UserCheck,
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        label: 'Šefovi MT'
      };
    }
    if (r.includes('vdv')) {
      return {
        icon: Award,
        colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        label: 'VdV Volonteri'
      };
    }
    if (r.includes('cc') || r.includes('operater') || r.includes('operator')) {
      return {
        icon: Headphones,
        colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        label: 'Cc Operateri'
      };
    }
    if (r.includes('bez uloge')) {
      return {
        icon: User,
        colorClass: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
        label: 'Bez uloge'
      };
    }
    return {
      icon: User,
      colorClass: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
      label: roleName
    };
  };

  return (
    <div className="space-y-6">
      {/* 7 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-sans">
        {/* Total People */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">UKUPNO LJUDI U NB</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalPeople}</div>
          </div>
        </div>

        {/* Total Polling Stations */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <MapPin className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">Biračka mesta (BM)</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalBM}</div>
          </div>
        </div>

        {/* Šefovi BM */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
            <UserCheck className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate" title="Šefovi biračkih mesta">Šefovi biračkih mesta</div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{totalSefovi}</span>
              <span className="text-[10px] text-[#9aa3b2] font-normal font-mono">({assignedSefovi} rasp.)</span>
            </div>
          </div>
        </div>

        {/* Kontrolori */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 shrink-0">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">Kontrolori</div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{totalKontrolori}</span>
              <span className="text-[10px] text-[#9aa3b2] font-normal font-mono">({assignedKontroloriCount} rasp.)</span>
            </div>
          </div>
        </div>

        {/* Active Mobile Teams */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Truck className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">Mobilni timovi</div>
            <div className="text-xl font-bold text-white mt-0.5">{activeMT}</div>
          </div>
        </div>

        {/* Trained Participants */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">Obučeni volonteri</div>
            <div className="text-xl font-bold text-white mt-0.5">{trainedVolunteers}</div>
          </div>
        </div>

        {/* Trained Controllers */}
        <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">Obučeni kontrolori</div>
            <div className="mt-1.5 space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9aa3b2] text-[10px] truncate">Kompletno obučeni</span>
                <span className="font-bold text-white ml-2 shrink-0">{kompletonObuceniKontrolori}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9aa3b2] text-[10px] truncate">Online obuka</span>
                <span className="font-bold text-white ml-2 shrink-0">{controllersWithOnline}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Roles */}
        {extraRoles.map(([roleName, count]) => {
          const config = getRoleCardConfig(roleName);
          const IconComponent = config.icon;
          return (
            <div key={roleName} className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${config.colorClass.split(' ')[1]} ${config.colorClass.split(' ')[0]}`}>
                <IconComponent className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold truncate">
                  {config.label}
                </div>
                <div className="text-xl font-bold text-white mt-0.5">{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Section */}
      <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Levak regrutacije i angažovanja</h3>
          <p className="text-xs text-[#9aa3b2] mt-1">Vizuelni prikaz i pojašnjenje faza kroz koje kandidati prolaze od prve prijave do konačnog rasporeda na terenu.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          {/* Step 1: Prijave */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">1. Nove prijave (Online forme)</span>
                <span className="text-sm font-extrabold text-white bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{funnel.pending}</span>
              </div>
              <p className="text-[10px] text-[#9aa3b2] leading-relaxed">
                Kandidati koji su popunili prijavni upitnik preko sajta ili društvenih mreža. Nalaze se u "čekaonici" i čekaju verifikaciju i prvi poziv.
              </p>
            </div>
            <div className="space-y-1 mt-auto">
              <div className="h-1.5 bg-[#101318] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (funnel.pending / (totalPeople || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Kontaktirani */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400">2. Kontaktirani kandidati</span>
                <span className="text-sm font-extrabold text-white bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/20">{funnel.contacted}</span>
              </div>
              <p className="text-[10px] text-[#9aa3b2] leading-relaxed">
                Ljudi iz baze sa kojima je uspostavljen kontakt (putem poziva, Vibera ili e-maila) radi potvrde bazičnih informacija, uloge i dostupnosti.
              </p>
            </div>
            <div className="space-y-1 mt-auto">
              <div className="h-1.5 bg-[#101318] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#f59e0b] transition-all duration-500" 
                  style={{ width: `${Math.min(100, (funnel.contacted / (totalPeople || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Potvrđeni */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">3. Potvrđeni kontrolori</span>
                <span className="text-sm font-extrabold text-white bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{funnel.confirmed}</span>
              </div>
              <p className="text-[10px] text-[#9aa3b2] leading-relaxed">
                Potpuno sigurni i verifikovani članovi koji su dali definitivan pristanak za rad na predstojećim izborima i koji su već prošli obuku.
              </p>
            </div>
            <div className="space-y-1 mt-auto">
              <div className="h-1.5 bg-[#101318] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (funnel.confirmed / (totalPeople || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Raspoređeni */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400">4. Aktivno raspoređeni na BM/MT</span>
                <span className="text-sm font-extrabold text-white bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{funnel.assigned}</span>
              </div>
              <p className="text-[10px] text-[#9aa3b2] leading-relaxed">
                Ljudi koji su zvanično raspoređeni na konkretna biračka mesta ili u mobilne timove i imaju dodeljenog šefa i lokaciju rada.
              </p>
            </div>
            <div className="space-y-1 mt-auto">
              <div className="h-1.5 bg-[#101318] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (funnel.assigned / (totalPeople || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pokrivenost biračkih mesta i mobilnih timova */}
      <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white font-sans">Pokrivenost biračkih mesta</h3>
          <p className="text-xs text-[#9aa3b2] mt-1">Ključni indikatori raspoređenosti ljudstva za kontrolu izbora</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Šefovi biračkih mesta */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col items-center justify-between text-center space-y-3">
            <span className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Šefovi BM</span>
            
            {/* Radial Progress Ring */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={`${pctSefovi}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-white">{pctSefovi}%</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">{assignedSefovi} od {totalBM}</div>
              <div className="text-[10px] text-[#9aa3b2]">Raspoređeno šefova</div>
            </div>
          </div>

          {/* Kontrolori */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col items-center justify-between text-center space-y-3">
            <span className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Kontrolori</span>
            
            {/* Radial Progress Ring */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-violet-500 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={`${pctKontrolori}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-white">{pctKontrolori}%</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">{assignedKontroloriSpots} od {totalKontrolorSpots}</div>
              <div className="text-[10px] text-[#9aa3b2]">Popunjenih mesta</div>
            </div>
          </div>

          {/* Mobilni Timovi */}
          <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl flex flex-col items-center justify-between text-center space-y-3">
            <span className="text-[10px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Mobilni timovi</span>
            
            {/* Radial Progress Ring */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={`${pctMT}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-white">{pctMT}%</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">{populatedMT} od {activeMT} mobilnih timova</div>
              <div className="text-[10px] text-[#9aa3b2]">{totalMTMembers} članova u mobilnim timovima</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#161a22] border border-[#232935] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Ukupna pokrivenost resursa biračkih mesta</span>
            <span className="text-xs font-bold text-emerald-400">{overallPct}%</span>
          </div>
          <div className="h-2 bg-[#101318] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#9aa3b2]">
            <span>Potrebno: {totalBM * 3} ljudi (1 šef + 2 kontrolora po BM)</span>
            <span>Raspoređeno: {assignedSefovi + assignedKontroloriSpots}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
