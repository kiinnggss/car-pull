'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { IssueSelector } from './IssueSelector';
import { ProviderDispatchDeck } from './ProviderDispatchDeck';
import { AssistanceShield } from './AssistanceShield';
import {
  Navigation,
  ArrowLeft,
  X,
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
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in pt-1">
      {/* High-Contrast SOS Header Card */}
      <div className="bg-[#0B0C0E] dark:bg-[#14161B] rounded-[32px] p-5 text-white space-y-3.5 border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            ROADSIDE SOS BEACON
          </div>
          <button
            onClick={cancelEmergency}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active-press"
            title="Dismiss SOS"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Lock Pill */}
        <div className="p-3.5 rounded-[22px] bg-[#1E2028] flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] font-mono uppercase tracking-wider font-bold text-[var(--accent-signal)] block">
              LIVE GPS TELEMETRY LOCK
            </span>
            <span className="text-xs font-extrabold text-white block leading-snug mt-0.5">
              Lekki-Epe Expressway, 200m before Chevron Toll Gate
            </span>
            <span className="text-[10px] text-white/65 font-mono tabular-nums block mt-0.5">
              6.4428° N, 3.5186° E • Westbound
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Uber Green 2x2 Bento Issue Selector */}
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
              className="text-xs text-[var(--text-primary)] dark:text-[var(--accent-primary)] font-extrabold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Incident Type
            </button>
            <span className="text-[10px] font-mono uppercase bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] font-black px-2.5 py-0.5 rounded-full">
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
