import React from 'react';
import { ExternalLink, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';

interface FinansijeTabProps {
  isReadOnly?: boolean;
}

export default function FinansijeTab({ isReadOnly }: FinansijeTabProps) {
  const externalUrl = "https://finansije-opstina.pages.dev/";

  const handleOpenExternal = () => {
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Integraciono zaglavlje */}
      <div className="p-4 bg-[#101318] border border-[#1e222b] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Centralni sistem za finansije i donacije</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sinhronizovano
              </span>
            </div>
            <p className="text-xs text-[#9aa3b2] mt-0.5">
              Bezbedna integracija sa zvaničnim portalom za opštinske finansije. Prijavite se ispod za vođenje knjiga u realnom vremenu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-[#161a22] hover:bg-[#232935] border border-[#232935] text-gray-400 hover:text-white rounded-xl transition-all"
            title="Osveži aplikaciju"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/10"
          >
            <span>Otvori u novom tabu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Napomena u vezi sa kolačićima / iframe sandbox-om */}
      <div className="px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2 text-[11px] text-amber-400/90">
        <HelpCircle className="w-4 h-4 shrink-0" />
        <span>
          Ukoliko vaš pretraživač blokira prijavu unutar ugrađenog prozora, koristite dugme <strong>"Otvori u novom tabu"</strong> u gornjem desnom uglu.
        </span>
      </div>

      {/* Ugrađeni Iframe portal */}
      <div className="relative w-full border border-[#1e222b] rounded-2xl bg-[#0f1218] overflow-hidden shadow-2xl">
        <iframe
          src={externalUrl}
          title="Finansije Opština"
          className="w-full h-[720px] bg-[#0c0e12]"
          allow="clipboard-write; local-fonts; fullscreen; camera; microphone"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    </div>
  );
}

