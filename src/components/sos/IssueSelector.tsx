'use client';

import React from 'react';
import { IncidentType } from '@/lib/types';
import { Disc, Zap, Flame, Truck, ArrowUpRight } from 'lucide-react';

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
    isPrimaryVolt?: boolean;
    badge: string;
  }[] = [
    {
      id: 'flat_tyre',
      title: 'Flat Tyre',
      subtitle: 'Mobile Vulcanizer',
      icon: <Disc className="w-4 h-4" />,
      isPrimaryVolt: true,
      badge: '12M ETA',
    },
    {
      id: 'dead_battery',
      title: 'Dead Battery',
      subtitle: '12V/24V Jumpstart',
      icon: <Zap className="w-4 h-4" />,
      badge: '10M ETA',
    },
    {
      id: 'engine_overheating',
      title: 'Overheating',
      subtitle: 'OBD2 & Coolant',
      icon: <Flame className="w-4 h-4" />,
      badge: '15M ETA',
    },
    {
      id: 'total_mechanical_tow',
      title: 'Flatbed Tow',
      subtitle: 'Hydraulic Tilt Recovery',
      icon: <Truck className="w-4 h-4" />,
      badge: 'HEAVY',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-display font-black text-[#0B0C0E] dark:text-white">
          Select Roadside Incident
        </span>
        <span className="text-[10px] font-mono text-[#525866] dark:text-[#9BA1AE] font-bold">
          4 UNITS NEARBY
        </span>
      </div>

      {/* Uber Green "Additional Wishes" Style 2x2 Square Bento Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {issues.map((issue) => {
          const isSelected = selectedIssue === issue.id;
          const useVolt = isSelected || issue.isPrimaryVolt;

          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={`p-4 rounded-[28px] text-left flex flex-col justify-between min-h-[128px] transition-all active-press ${
                useVolt
                  ? 'volt-surface'
                  : 'floating-surface text-[#0B0C0E] dark:text-white'
              }`}
            >
              <div className="flex items-start justify-between w-full gap-1">
                <div>
                  <h4 className="text-sm font-display font-black leading-tight">
                    {issue.title}
                  </h4>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${
                      useVolt ? 'text-[#0B0C0E]/75' : 'text-[#525866] dark:text-[#9BA1AE]'
                    }`}
                  >
                    {issue.subtitle}
                  </p>
                </div>

                <ArrowUpRight className="w-4 h-4 flex-shrink-0 opacity-70" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    useVolt
                      ? 'bg-[#0B0C0E] text-[#C8FF00]'
                      : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-[#C8FF00]'
                  }`}
                >
                  {issue.icon}
                </div>

                <span
                  className={`text-[9.5px] font-mono font-black px-2.5 py-0.5 rounded-full ${
                    useVolt
                      ? 'bg-[#0B0C0E]/12 text-[#0B0C0E]'
                      : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#525866] dark:text-[#9BA1AE]'
                  }`}
                >
                  {issue.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
