import React, { useState } from 'react';
import { SchoolStats, SchoolHeadAccount } from '../types';
import { INITIAL_SCHOOL_HEAD_ACCOUNTS } from '../data/mockData';
import {
  Landmark,
  ShieldAlert,
  Sparkles,
  Zap,
  Building,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  FileText,
  Lock,
  Search,
  School,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Download,
  X,
  RotateCcw,
} from 'lucide-react';

interface SdoDashboardProps {
  schools: SchoolStats[];
  schoolHeadAccounts?: SchoolHeadAccount[];
  onResetAllData?: () => void;
}

export const SdoDashboard: React.FC<SdoDashboardProps> = ({
  schools,
  schoolHeadAccounts = [],
  onResetAllData,
}) => {
  const activeHeadAccounts = schoolHeadAccounts ?? INITIAL_SCHOOL_HEAD_ACCOUNTS;

  const [sdoName] = useState<string>('SDO Ligao City');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [credSearchTerm, setCredSearchTerm] = useState<string>('');
  const [showCredentialsMap, setShowCredentialsMap] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const handleExportSdoCSV = () => {
    const headers = ['School ID', 'School Name', 'Total Enrolled Learners', 'Mastery Percentage', 'Red Flags Count', 'Status'];
    const rows = schools.map((s) => [
      s.id,
      s.name,
      s.totalStudents,
      `${s.masteredPercentage}%`,
      s.flaggedRedCount,
      s.flaggedRedCount > 3 ? 'NEEDS ASSISTANCE' : 'PERFORMING',
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SDO_Division_Report_${sdoName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isGeneratingBrief, setIsGeneratingBrief] = useState<boolean>(false);
  const [briefResult, setBriefResult] = useState<{
    divisionSummary?: string;
    resourceAllocationActions?: string[];
    technicalAssistancePriorities?: string[];
    governanceNote?: string;
  } | null>(null);

  const toggleShowPassword = (id: string) => {
    setShowCredentialsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (account: SchoolHeadAccount) => {
    const text = `School: ${account.schoolName}\nPrincipal: ${account.name}\nUsername: ${account.username}\nPassword: ${account.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalSchools = schools.length;
  const totalStudents = schools.reduce((acc, s) => acc + s.totalStudents, 0);
  const avgMastery = Math.round(
    schools.reduce((acc, s) => acc + s.masteredPercentage, 0) / (totalSchools || 1)
  );
  const totalRedFlags = schools.reduce((acc, s) => acc + s.flaggedRedCount, 0);

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    try {
      const res = await fetch('/api/gemini/sdo-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdoName,
          totalSchools,
          avgMastery,
          totalRedFlags,
          schoolBreakdown: schools.map((s) => ({
            name: s.name,
            mastery: s.masteredPercentage,
            redFlags: s.flaggedRedCount,
          })),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBriefResult(json.data);
      }
    } catch (err) {
      console.error('Failed to generate SDO brief', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                Division Level • SDO Official
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-emerald-300" />
                <span>DIVISION-WIDE JURISDICTION ACTIVE</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
              {sdoName} Oversight & Division Resource Allocation
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Broadest view across all <strong>{totalSchools} elementary schools</strong> in SDO Ligao City. Enables division-wide monitoring, reporting, technical assistance dispatch, and rapid intervention resource allocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onResetAllData && (
              <button
                type="button"
                onClick={onResetAllData}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
                title="Reset and clear all flagged learner data across division"
              >
                <RotateCcw className="w-4 h-4 text-rose-200" />
                <span>Reset Flagged Data</span>
              </button>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
              title="Generate Printable Division-Wide SDO Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Generate Report</span>
            </button>

            <button
              onClick={handleGenerateBrief}
              disabled={isGeneratingBrief}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0 disabled:opacity-50"
            >
              {isGeneratingBrief ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating SDO Brief...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Gemini Policy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Division Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700">
            <span className="text-xs font-bold text-slate-300 block">Supervised Schools</span>
            <div className="text-2xl font-extrabold text-slate-100 mt-0.5">{totalSchools}</div>
          </div>

          <div className="bg-blue-950/40 rounded-xl p-3.5 border border-blue-800/40">
            <span className="text-xs font-bold text-blue-300 block">Total Enrolled Learners</span>
            <div className="text-2xl font-extrabold text-blue-400 mt-0.5">{totalStudents.toLocaleString()}</div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-800/40">
            <span className="text-xs font-bold text-emerald-300 block">Division Avg Mastery</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{avgMastery}%</div>
          </div>

          <div className="bg-red-950/40 rounded-xl p-3.5 border border-red-800/40">
            <span className="text-xs font-bold text-red-300 block">Division Red Flags</span>
            <div className="text-2xl font-extrabold text-red-400 mt-0.5">{totalRedFlags}</div>
          </div>
        </div>
      </div>

      {/* Gemini Executive Policy Brief Box */}
      {briefResult && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 text-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Executive Decision Support Brief (SDO Level)
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div>
              <span className="font-bold text-blue-800 block uppercase text-[10px]">
                Division Macro Summary:
              </span>
              <p className="mt-1 leading-relaxed text-slate-800">{briefResult.divisionSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-blue-800 block uppercase text-[10px]">
                  Resource Allocation Actions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {briefResult.resourceAllocationActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-800 block uppercase text-[10px]">
                  Technical Assistance Priorities:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {briefResult.technicalAssistancePriorities?.map((prio, i) => (
                    <li key={i}>{prio}</li>
                  ))}
                </ul>
              </div>
            </div>

            {briefResult.governanceNote && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] rounded-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{briefResult.governanceNote}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* School Division Decision Matrix Cards */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Schools Division Allocation Matrix ({sdoName})
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring all {totalSchools} Ligao City elementary schools. Identifies schools requiring immediate intervention toolkits or technical supervisory visits.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search among ${totalSchools} elementary schools...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSchools.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-slate-400 text-xs">
              No elementary schools match "{searchTerm}".
            </div>
          ) : (
            filteredSchools.map((sch) => {
              const needsSupport = sch.masteredPercentage < 60 || sch.flaggedRedCount > 15;

              return (
                <div
                  key={sch.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    needsSupport
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <School className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{sch.name}</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                          ID: {sch.schoolId || sch.id}
                        </span>
                        <span className="text-[11px] text-slate-500">{sch.totalStudents} Learners</span>
                      </div>
                    </div>
                    {needsSupport ? (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-red-600 text-white rounded-full animate-pulse shrink-0">
                        TA NEEDED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shrink-0">
                        ON TRACK
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Mastery Level:</span>
                      <span className="font-bold text-slate-900">{sch.masteredPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sch.masteredPercentage >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sch.masteredPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Active Red Flags:</span>
                      <span className="font-bold text-red-600">{sch.flaggedRedCount}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Avg Response Time:</span>
                      <span className="font-bold text-blue-600">{sch.avgInterventionTimeMinutes}m</span>
                    </div>
                  </div>

                  {/* School Head Credentials Box for SDO Recovery Support */}
                  {(() => {
                    const headAcc = activeHeadAccounts.find(
                      (sh) => sh.schoolName.toLowerCase().trim() === sch.name.toLowerCase().trim()
                    );
                    if (!headAcc) return null;
                    const isRevealed = !!showCredentialsMap[headAcc.id] || showAllPasswords;

                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[11px] space-y-1 border border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-indigo-300">
                            <KeyRound className="w-3 h-3 text-indigo-400" />
                            <span>Principal Login Credentials</span>
                          </span>
                          <span className="text-white font-medium truncate max-w-[110px]" title={headAcc.name}>
                            {headAcc.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-mono pt-0.5">
                          <span className="text-slate-300">
                            User: <strong className="text-white">{headAcc.username}</strong>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-200">
                              Pass: <strong>{isRevealed ? headAcc.password : '••••••••'}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(headAcc.id)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                              title="Toggle password view"
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(headAcc)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                              title="Copy credentials"
                            >
                              {copiedId === headAcc.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-2">
                    <button
                      onClick={() =>
                        alert(
                          `Technical Assistance Dispatch requested for ${sch.name}. SDO Supervisors notified.`
                        )
                      }
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                        needsSupport
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {needsSupport ? 'Dispatch Technical Assistance' : 'View School Report'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SDO Division Master School Head Credentials Registry Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>School Principal Credentials Registry ({activeHeadAccounts.length} Schools)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  SDO Recovery Support
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                SDO Officials can view and verify usernames and passwords for all school principals in case a school head forgets their credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAllPasswords((prev) => !prev)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAllPasswords ? 'Hide All Passwords' : 'Reveal All Passwords'}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search principal name or school..."
                value={credSearchTerm}
                onChange={(e) => setCredSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3">School Name</th>
                <th className="p-3">School ID</th>
                <th className="p-3">Principal / Head Name</th>
                <th className="p-3">Login Username</th>
                <th className="p-3">Password</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeHeadAccounts
                .filter(
                  (acc) =>
                    acc.schoolName.toLowerCase().includes(credSearchTerm.toLowerCase()) ||
                    acc.name.toLowerCase().includes(credSearchTerm.toLowerCase()) ||
                    acc.username.toLowerCase().includes(credSearchTerm.toLowerCase()) ||
                    acc.schoolId.includes(credSearchTerm)
                )
                .map((acc) => {
                  const isRevealed = !!showCredentialsMap[acc.id] || showAllPasswords;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{acc.schoolName}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">{acc.schoolId}</td>
                      <td className="p-3 text-slate-800 font-semibold">{acc.name}</td>
                      <td className="p-3 font-mono text-indigo-700 font-medium">{acc.username}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {isRevealed ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {acc.password}
                          </span>
                        ) : (
                          <span className="text-slate-400">••••••••</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => toggleShowPassword(acc.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                          title="Toggle Password"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyCredentials(acc)}
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                          title="Copy Full Credentials"
                        >
                          {copiedId === acc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable SDO Division Summary Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Actions Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Division-Wide SDO Literacy & Numeracy Summary Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportSdoCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-900 font-sans">
              {/* DepEd Regional/Division Header */}
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Republic of the Philippines • Department of Education</p>
                <p className="text-[11px] font-semibold text-slate-600">Region V - Bicol • Schools Division Office of Ligao City</p>
                <h2 className="text-lg font-black text-slate-900 mt-2 uppercase tracking-tight">Division Literacy & Numeracy Intervention Summary Report</h2>
                <p className="text-xs font-medium text-slate-600">
                  Jurisdiction: <strong className="text-slate-900">{sdoName}</strong> • Division Code: <strong className="font-mono text-slate-900">SDO-LIGAO-005</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Supervised Schools</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{totalSchools}</span>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 block">Enrolled Learners</span>
                  <span className="text-xl font-extrabold text-blue-900 mt-0.5 block">{totalStudents.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">Division Avg Mastery</span>
                  <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">{avgMastery}%</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 block">Total Division Red Flags</span>
                  <span className="text-xl font-extrabold text-red-900 mt-0.5 block">{totalRedFlags}</span>
                </div>
              </div>

              {/* School Performance Matrix Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">School-by-School Division Governance Roster</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">School Name</th>
                        <th className="p-2.5">School ID</th>
                        <th className="p-2.5">Enrolled Learners</th>
                        <th className="p-2.5">Mastery %</th>
                        <th className="p-2.5">Red Flags Count</th>
                        <th className="p-2.5">Division Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {schools.map((sch) => (
                        <tr key={sch.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{sch.name}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">{sch.id}</td>
                          <td className="p-2.5">{sch.totalStudents.toLocaleString()}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{sch.masteredPercentage}%</td>
                          <td className="p-2.5 font-bold text-red-700">{sch.flaggedRedCount}</td>
                          <td className="p-2.5">
                            {sch.flaggedRedCount > 3 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                                TECHNICAL ASSISTANCE NEEDED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                PERFORMING
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Prepared By:</p>
                  <div className="mt-8 border-b border-slate-900 w-56 font-bold text-slate-900">SDO Division Assessment Officer</div>
                  <p className="text-[10px] text-slate-500 mt-1">{sdoName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Approved By:</p>
                  <div className="mt-8 border-b border-slate-900 w-56 font-bold text-slate-900">Schools Division Superintendent</div>
                  <p className="text-[10px] text-slate-500 mt-1">Department of Education - SDO Ligao City</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 text-right shrink-0">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
