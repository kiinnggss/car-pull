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
    color: string;
    badge: string;
  }[] = [
    {
      id: 'flat_tyre',
      title: 'Flat Tyre',
      subtitle: 'Mobile Vulcanizer • Spare Wheel',
      icon: <Disc className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-50/70 dark:bg-amber-950/30 border border-transparent dark:border-stone-800',
      badge: 'Rapid Moto',
    },
    {
      id: 'dead_battery',
      title: 'Dead Battery',
      subtitle: '12V/24V Jumpstart • Terminals',
      icon: <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
      color: 'bg-yellow-50/70 dark:bg-yellow-950/30 border border-transparent dark:border-stone-800',
      badge: 'Fast Jump',
    },
    {
      id: 'engine_overheating',
      title: 'Overheating',
      subtitle: 'OBD2 Thermal Scan • Coolant',
      icon: <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      color: 'bg-orange-50/70 dark:bg-orange-950/30 border border-transparent dark:border-stone-800',
      badge: 'Diagnostic',
    },
    {
      id: 'total_mechanical_tow',
      title: 'Flatbed Tow',
      subtitle: 'Hydraulic Tilt • Differential Safe',
      icon: <Truck className="w-5 h-5 text-red-600 dark:text-red-400" />,
      color: 'bg-red-50/70 dark:bg-red-950/30 border border-transparent dark:border-stone-800',
      badge: 'Heavy Recovery',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-800 dark:text-stone-200 uppercase tracking-wider">
          Step 1: Select Roadside Issue
        </span>
        <span className="text-[10px] text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
          Expressway SOS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {issues.map((issue) => {
          const isSelected = selectedIssue === issue.id;
          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={`p-3.5 rounded-2xl text-left flex flex-col justify-between min-h-[110px] transition-all active:scale-95 ${
                isSelected
                  ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/50 shadow-xs'
                  : `${issue.color} hover:bg-zinc-100 dark:hover:bg-stone-800/60`
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900 shadow-2xs">
                  {issue.icon}
                </div>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-stone-400 bg-white/80 dark:bg-stone-900/80 px-1.5 py-0.5 rounded shadow-2xs">
                  {issue.badge}
                </span>
              </div>

              <div className="mt-2">
                <h4 className="text-xs font-black text-zinc-900 dark:text-stone-100 leading-tight">{issue.title}</h4>
                <p className="text-[10px] text-zinc-500 dark:text-stone-400 mt-0.5 line-clamp-1 leading-tight">
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
