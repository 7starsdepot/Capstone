import React from 'react';
import { UserRole } from '../types';
import {
  GraduationCap,
  Users,
  Building2,
  Landmark,
  BellRing,
  Sparkles,
  Zap,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  redFlagCount: number;
  yellowFlagCount: number;
  onSimulateSubmission: () => void;
  onOpenToolkit: () => void;
  onResetAllData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  redFlagCount,
  yellowFlagCount,
  onSimulateSubmission,
  onOpenToolkit,
  onResetAllData,
}) => {
  const roles = [
    { id: 'learner' as UserRole, label: 'Learner', icon: GraduationCap },
    {
      id: 'tutor' as UserRole,
      label: 'Tutors',
      icon: Users,
      badge: redFlagCount > 0 ? `${redFlagCount} Red` : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    { id: 'school_head' as UserRole, label: 'School Head', icon: Building2 },
    { id: 'sdo_official' as UserRole, label: 'SDO Division', icon: Landmark },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-950 text-lg sm:text-xl tracking-tight leading-tight">
                  <span className="text-black font-black uppercase">DepEd SDO-Ligao</span>
                  <span className="block text-black font-black text-xl sm:text-2xl tracking-wider">CAPSTONE PROJECT</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Early Intervention System
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-toolkit-btn"
              onClick={onOpenToolkit}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
              title="Open DepEd IRIP Intervention Toolkit"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Intervention Toolkit</span>
            </button>

            <button
              id="header-simulate-submission-btn"
              onClick={onSimulateSubmission}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Simulate Submission</span>
            </button>

            {onResetAllData && (
              <button
                id="header-reset-data-btn"
                onClick={onResetAllData}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all shrink-0"
                title="Reset & Clear All Flagged Learner Data (Start Fresh)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">Reset Flagged Data</span>
              </button>
            )}

            {/* Active Alerts Count Badge */}
            {(redFlagCount > 0 || yellowFlagCount > 0) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <BellRing className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                <span>{redFlagCount} Red</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => onRoleChange(role.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{role.label}</span>
                {role.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${role.badgeColor}`}
                  >
                    {role.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
