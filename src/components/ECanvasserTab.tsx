import React, { useState } from 'react';
import { ECANVASSER_DATA, getInitialEcanvasserForOpstina } from '../data';
import { Map, Zap, Check, ShieldAlert, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';

interface ECanvasserTabProps {
  onNotify: (msg: string) => void;
  selectedOpstina?: string;
}

interface BMStat {
  bm: string;
  pokucano: number;
  podrska: number;
  protiv: number;
  neodluceni: number;
}

export default function ECanvasserTab({ onNotify, selectedOpstina = 'Vračar' }: ECanvasserTabProps) {
  const [data, setData] = useState<BMStat[]>(() => {
    const opstina = selectedOpstina;
    const suffix = opstina === 'Vračar' ? '' : `_${opstina.toLowerCase().replace(/\s+/g, '_')}`;
    const saved = localStorage.getItem(`struktura_ecanvasser${suffix}`);
    return saved ? JSON.parse(saved) : getInitialEcanvasserForOpstina(opstina);
  });

  React.useEffect(() => {
    const opstina = selectedOpstina;
    const suffix = opstina === 'Vračar' ? '' : `_${opstina.toLowerCase().replace(/\s+/g, '_')}`;
    const saved = localStorage.getItem(`struktura_ecanvasser${suffix}`);
    setData(saved ? JSON.parse(saved) : getInitialEcanvasserForOpstina(opstina));
  }, [selectedOpstina]);

  const [simulating, setSimulating] = useState(false);

  // Totals
  const totalVisited = data.reduce((sum, d) => sum + d.pokucano, 0);
  const totalSupport = data.reduce((sum, d) => sum + d.podrska, 0);
  const totalAgainst = data.reduce((sum, d) => sum + d.protiv, 0);
  const totalUndecided = data.reduce((sum, d) => sum + d.neodluceni, 0);

  const overallSupportRate = totalVisited > 0 ? Math.round((totalSupport / totalVisited) * 100) : 0;
  const targetGoalPercentage = Math.min(100, Math.round((totalVisited / 2500) * 100)); // Target 2500 doors

  // Save helper
  const updateData = (newData: BMStat[]) => {
    setData(newData);
    const opstina = selectedOpstina;
    const suffix = opstina === 'Vračar' ? '' : `_${opstina.toLowerCase().replace(/\s+/g, '_')}`;
    localStorage.setItem(`struktura_ecanvasser${suffix}`, JSON.stringify(newData));
  };

  const handleSimulateKnocking = () => {
    setSimulating(true);
    
    setTimeout(() => {
      // Add random numbers to each neighborhood
      const updated = data.map(d => {
        const addedDoors = Math.floor(Math.random() * 15 + 5);
        const addedSupport = Math.floor(addedDoors * (Math.random() * 0.3 + 0.4)); // 40%-70% support
        const addedAgainst = Math.floor((addedDoors - addedSupport) * (Math.random() * 0.4 + 0.2)); 
        const addedUndecided = addedDoors - addedSupport - addedAgainst;

        return {
          ...d,
          pokucano: d.pokucano + addedDoors,
          podrska: d.podrska + addedSupport,
          protiv: d.protiv + addedAgainst,
          neodluceni: d.neodluceni + addedUndecided
        };
      });

      updateData(updated);
      setSimulating(false);
      onNotify('Simulacija uspešno završena! Evidentirani novi razgovori na terenu.');
    }, 1200);
  };

  const handleReset = () => {
    if (confirm('Da li želite resetovati podatke terenskog rada na fabrička podešavanja?')) {
      updateData(getInitialEcanvasserForOpstina(selectedOpstina));
      onNotify('Podaci terenskog rada su resetovani.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation action card */}
      <div className="p-6 bg-gradient-to-r from-[#101318] to-[#1d1b10] border border-amber-500/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Zap className="w-4 h-4 fill-current" />
            <span>Terenska door-to-door kampanja (eCanvasser)</span>
          </div>
          <p className="text-xs text-[#9aa3b2] max-w-xl">
            Praćenje raspoloženja birača na terenu opštine {selectedOpstina} u realnom vremenu. Pokrenite interaktivnu simulaciju kucanja kako biste iskusili doprinos volontera.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReset}
            className="p-2 bg-[#161a22] hover:bg-[#232935] border border-[#232935] text-gray-400 hover:text-white rounded-xl text-xs transition-colors flex items-center gap-1.5"
            title="Resetuj podatke"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleSimulateKnocking}
            disabled={simulating}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs font-bold text-[#0c0e12] rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#0c0e12]" />
                Simulacija u toku...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#0c0e12] fill-current" />
                Simuliraj rad na terenu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Doors Visit */}
        <div className="p-5 bg-[#101318] border border-[#1e222b] rounded-2xl">
          <div className="text-[11px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Ukupno pokucanih vrata</div>
          <div className="text-2xl font-bold text-white mt-1">
            {totalVisited} <span className="text-xs text-gray-500 font-medium">od 2.500</span>
          </div>
          {/* Progress Goal */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#9aa3b2]">Ispunjenje cilja</span>
              <span className="text-white font-bold">{targetGoalPercentage}%</span>
            </div>
            <div className="h-1 bg-[#1b1f27] rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${targetGoalPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Support Rate */}
        <div className="p-5 bg-[#101318] border border-[#1e222b] rounded-2xl">
          <div className="text-[11px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Procenat podrške u razgovorima</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {overallSupportRate}%
          </div>
          <p className="text-[10px] text-[#9aa3b2] mt-1.5">Pozitivnih odgovora od ukupno otvorenih vrata</p>
        </div>

        {/* Uncommitted / Undecided */}
        <div className="p-5 bg-[#101318] border border-[#1e222b] rounded-2xl">
          <div className="text-[11px] text-[#9aa3b2] uppercase tracking-wider font-semibold">Neodlučni birači</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {totalUndecided} <span className="text-xs text-gray-500 font-medium">građana</span>
          </div>
          <p className="text-[10px] text-[#9aa3b2] mt-1.5">Ključna ciljna grupa za naredni krug razgovora</p>
        </div>
      </div>

      {/* Breakdown per Polling Station */}
      <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <BarChart2 className="w-4.5 h-4.5 text-blue-400" />
          <span>Statistika raspoloženja po biračkim mestima</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e222b] text-[#9aa3b2] bg-[#0c0e12]/30">
                <th className="p-3 font-semibold">Biračko mesto</th>
                <th className="p-3 font-semibold text-center">Pokucano</th>
                <th className="p-3 font-semibold text-center text-emerald-400">Podrška (Da)</th>
                <th className="p-3 font-semibold text-center text-red-400">Protiv (Ne)</th>
                <th className="p-3 font-semibold text-center text-indigo-400">Neodlučni</th>
                <th className="p-3 font-semibold text-right">Grafički odnos (Da / Ne / ?)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222b]/50">
              {data.map((d) => {
                const pctSupport = d.pokucano > 0 ? Math.round((d.podrska / d.pokucano) * 100) : 0;
                const pctAgainst = d.pokucano > 0 ? Math.round((d.protiv / d.pokucano) * 100) : 0;
                const pctUndecided = d.pokucano > 0 ? 100 - pctSupport - pctAgainst : 0;

                return (
                  <tr key={d.bm} className="text-gray-300 hover:bg-white/2">
                    <td className="p-3 font-bold text-white">{d.bm}</td>
                    <td className="p-3 text-center text-white font-semibold">{d.pokucano}</td>
                    <td className="p-3 text-center text-emerald-400 font-semibold">{d.podrska} ({pctSupport}%)</td>
                    <td className="p-3 text-center text-red-400 font-semibold">{d.protiv} ({pctAgainst}%)</td>
                    <td className="p-3 text-center text-indigo-400 font-semibold">{d.neodluceni} ({pctUndecided}%)</td>
                    
                    {/* Visual Segmented bar */}
                    <td className="p-3 text-right min-w-[150px]">
                      <div className="h-3.5 rounded-md overflow-hidden flex bg-gray-800">
                        {/* Support */}
                        <div 
                          className="h-full bg-emerald-500/80 transition-all duration-500" 
                          style={{ width: `${pctSupport}%` }} 
                          title={`Podrška: ${pctSupport}%`} 
                        />
                        {/* Against */}
                        <div 
                          className="h-full bg-red-500/80 transition-all duration-500" 
                          style={{ width: `${pctAgainst}%` }} 
                          title={`Protiv: ${pctAgainst}%`} 
                        />
                        {/* Undecided */}
                        <div 
                          className="h-full bg-indigo-500/80 transition-all duration-500" 
                          style={{ width: `${pctUndecided}%` }} 
                          title={`Neodlučni: ${pctUndecided}%`} 
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
