import React from 'react';
import { UserRole } from '../types';
import {
  GraduationCap,
  Users,
  Building2,
  Landmark,
  BellRing,
  Shield,
  Award,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  redFlagCount: number;
  yellowFlagCount: number;
  onSimulateSubmission?: () => void;
  onOpenToolkit?: () => void;
  onResetAllData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  redFlagCount,
  yellowFlagCount,
}) => {
  const roles = [
    { id: 'learner' as UserRole, label: 'Learner Portal', icon: GraduationCap },
    {
      id: 'tutor' as UserRole,
      label: 'Tutor Dashboard',
      icon: Users,
      badge: redFlagCount > 0 ? `${redFlagCount} High-Risk` : undefined,
      badgeColor: 'bg-red-600 text-white font-bold',
    },
    { id: 'school_head' as UserRole, label: 'School Head', icon: Building2 },
    { id: 'sdo_official' as UserRole, label: 'SDO Division', icon: Landmark },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Official DepEd Brand Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-sm border border-blue-500/30 shrink-0">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                  Department of Education • Region V • SDO Ligao City
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-900/80 text-blue-200 border border-blue-700/50 uppercase tracking-widest">
                  <Award className="w-2.5 h-2.5 text-amber-300" /> Official Governance Portal
                </span>
              </div>
              <h1 className="font-extrabold text-white text-base sm:text-lg lg:text-xl tracking-tight flex items-center gap-2">
                <span>CAPSTONE PROJECT</span>
                <span className="text-blue-400 font-normal hidden sm:inline">|</span>
                <span className="text-blue-300 font-semibold text-xs sm:text-sm hidden sm:inline">IRIP System</span>
              </h1>
            </div>
          </div>

          {/* Active Alerts Count Badge */}
          {(redFlagCount > 0 || yellowFlagCount > 0) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-bold shrink-0">
              <BellRing className="w-4 h-4 text-red-400 animate-pulse" />
              <span>{redFlagCount} High-Risk Flagged</span>
            </div>
          )}
        </div>

        {/* Professional DepEd Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => onRoleChange(role.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{role.label}</span>
                {role.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${role.badgeColor}`}
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

