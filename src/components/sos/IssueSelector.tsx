'use client';

import React from 'react';
import { IncidentType } from '@/lib/types';
import { Disc, Zap, Flame, Truck } from 'lucide-react';

interface IssueSelectorProps {
  onSelectIssue: (issue: IncidentType) => void;
  selectedIssue: IncidentType | null;
}

export const IssueSelector: React.FC<IssueSelectorProps> = ({ onSelectIssue, selectedIssue }) => {
  const issues: {
    id: IncidentType;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accent: string;
    badge: string;
  }[] = [
    {
      id: 'flat_tyre',
      title: 'Flat Tyre',
      subtitle: 'Mobile Vulcanizer • Spare Wheel',
      icon: <Disc className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      accent: 'bg-amber-500/12 border-amber-500/25 text-amber-800 dark:text-amber-300',
      badge: 'RAPID MOTO',
    },
    {
      id: 'dead_battery',
      title: 'Dead Battery',
      subtitle: '12V/24V Jumpstart • Terminals',
      icon: <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
      accent: 'bg-yellow-500/12 border-yellow-500/25 text-yellow-800 dark:text-yellow-300',
      badge: 'FAST JUMP',
    },
    {
      id: 'engine_overheating',
      title: 'Overheating',
      subtitle: 'OBD2 Thermal Scan • Coolant',
      icon: <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
      accent: 'bg-orange-500/12 border-orange-500/25 text-orange-800 dark:text-orange-300',
      badge: 'DIAGNOSTIC',
    },
    {
      id: 'total_mechanical_tow',
      title: 'Flatbed Tow',
      subtitle: 'Hydraulic Tilt • Differential Safe',
      icon: <Truck className="w-4 h-4 text-red-600 dark:text-red-400" />,
      accent: 'bg-red-500/12 border-red-500/25 text-red-800 dark:text-red-300',
      badge: 'HEAVY RECOVERY',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          STEP 01: SELECT ROADSIDE INCIDENT
        </span>
        <span className="text-[9px] font-mono text-red-700 dark:text-red-300 font-bold bg-red-500/12 border border-red-500/25 px-2 py-0.5 rounded-md">
          EXPRESSWAY PRIORITY
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {issues.map((issue) => {
          const isSelected = selectedIssue === issue.id;
          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={`p-3.5 floating-surface rounded-2xl text-left flex flex-col justify-between min-h-[112px] transition-all active-press ${
                isSelected
                  ? 'ring-2 ring-red-500 dark:ring-red-400'
                  : 'hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between w-full gap-1">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 flex items-center justify-center">
                  {issue.icon}
                </div>
                <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${issue.accent}`}>
                  {issue.badge}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {issue.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-tight">
                  {issue.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
