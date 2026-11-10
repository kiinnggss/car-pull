'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { IssueSelector } from './IssueSelector';
import { ProviderDispatchDeck } from './ProviderDispatchDeck';
import { AssistanceShield } from './AssistanceShield';
import {
  Navigation,
  ArrowLeft,
  XCircle,
  Radio,
} from 'lucide-react';

export const EmergencyBeacon: React.FC = () => {
  const {
    selectedIssueType,
    candidateProviders,
    selectedProvider,
    isAssistanceShieldVisible,
    selectIncidentIssue,
    acceptProviderBid,
    cancelEmergency,
  } = useAppStore();

  if (isAssistanceShieldVisible && selectedProvider) {
    return <AssistanceShield />;
  }

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* High Alert Telemetry Header */}
      <div className="floating-surface rounded-2xl overflow-hidden border-red-500/30 dark:border-red-500/30">
        <div className="p-3.5 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-xs font-mono font-black text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              LAGOS ROADSIDE SOS BEACON
            </h2>
          </div>
          <button
            onClick={cancelEmergency}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-lg font-bold transition-colors"
            title="Dismiss SOS"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Coordinates & Current Expressway Location */}
        <div className="p-3.5 flex items-start gap-2.5 text-xs">
          <div className="w-8 h-8 rounded-xl bg-red-500/12 border border-red-500/25 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
              LIVE GPS TELEMETRY LOCK
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-extrabold block leading-snug mt-0.5">
              Lekki-Epe Expressway, 200m before Chevron Toll Gate
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums block mt-0.5">
              6.4428° N, 3.5186° E • Westbound Carriageway
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Issue Selection */}
      {!selectedIssueType ? (
        <IssueSelector
          onSelectIssue={selectIncidentIssue}
          selectedIssue={selectedIssueType}
        />
      ) : (
        /* Step 2: Live Provider Bidding Deck */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => selectIncidentIssue(null as any)}
              className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-extrabold flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Incident Type
            </button>
            <span className="text-[9px] font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-500/12 border border-emerald-500/25 px-2 py-0.5 rounded-md">
              LASDRI CERTIFIED
            </span>
          </div>

          <ProviderDispatchDeck
            providers={candidateProviders}
            onAcceptQuote={acceptProviderBid}
          />
        </div>
      )}
    </div>
  );
};
