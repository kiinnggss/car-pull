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
    activeIncident,
    selectedIssueType,
    candidateProviders,
    selectedProvider,
    isAssistanceShieldVisible,
    selectIncidentIssue,
    acceptProviderBid,
    cancelEmergency,
  } = useAppStore();

  // If Assistance Shield is active, render full-screen digital clearance shield
  if (isAssistanceShieldVisible && selectedProvider) {
    return <AssistanceShield />;
  }

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-4 animate-in fade-in">
      {/* High Alert Header */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-600 dark:text-red-400" />
              Lagos Roadside Emergency Beacon
            </h2>
          </div>
          <button
            onClick={cancelEmergency}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-lg font-bold"
            title="Dismiss SOS"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Coordinates & Current Expressway Location */}
        <div className="mt-3 bg-white dark:bg-[#1A1816] p-2.5 rounded-2xl border border-red-100 dark:border-red-900/40 flex items-start gap-2 text-xs shadow-2xs">
          <Navigation className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-zinc-500 dark:text-stone-400 block uppercase font-mono">
              Live GPS Lock (High Precision)
            </span>
            <span className="text-zinc-900 dark:text-stone-100 font-bold block leading-tight">
              Lekki-Epe Expressway, 200m before Chevron Toll Gate
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-stone-400 font-mono">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => selectIncidentIssue(null as any)}
              className="text-xs text-[#7C3AED] dark:text-purple-400 font-bold flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Issue
            </button>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              Verified LASDRI Responders
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
