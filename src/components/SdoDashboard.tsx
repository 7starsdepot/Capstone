import React, { useState } from 'react';
import { SchoolStats, SchoolHeadAccount, Submission, RegisteredLearner } from '../types';
import { INITIAL_SCHOOL_HEAD_ACCOUNTS } from '../data/mockData';
import { SdoLogo } from './SdoLogo';
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
  GraduationCap,
} from 'lucide-react';

interface SdoDashboardProps {
  schools: SchoolStats[];
  schoolHeadAccounts?: SchoolHeadAccount[];
  submissions?: Submission[];
  registeredLearners?: RegisteredLearner[];
  onResetAllData?: () => void;
}

export const SdoDashboard: React.FC<SdoDashboardProps> = ({
  schools,
  schoolHeadAccounts = [],
  submissions = [],
  registeredLearners = [],
  onResetAllData,
}) => {
  const activeHeadAccounts = schoolHeadAccounts ?? INITIAL_SCHOOL_HEAD_ACCOUNTS;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [sdoName] = useState<string>('SDO Ligao City');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [credSearchTerm, setCredSearchTerm] = useState<string>('');
  const [showCredentialsMap, setShowCredentialsMap] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedSchoolReport, setSelectedSchoolReport] = useState<SchoolStats | null>(null);

  // Helper function to build structured red-flagged learners organized by grade level
  const getRedFlaggedLearnersForSchool = (
    school: SchoolStats,
    allSubmissions: Submission[] = []
  ) => {
    const schoolNameLower = school.name.toLowerCase().trim();

    // 1. Get real or simulated red flag submissions for this school
    const realRedSubmissions = allSubmissions.filter((s) => {
      const subSchoolLower = (s.schoolName || '').toLowerCase().trim();
      const isSchoolMatch =
        subSchoolLower.includes(schoolNameLower) || schoolNameLower.includes(subSchoolLower);
      return isSchoolMatch && s.flagSeverity === 'red';
    });

    // Map real submissions to learner item format
    const items: Array<{
      id: string;
      studentName: string;
      lrn: string;
      gradeLevel: string;
      section: string;
      subject: string;
      assessmentTitle: string;
      score: number;
      flaggedCompetencies: string[];
      status: string;
      submittedAt: string;
    }> = realRedSubmissions.map((sub) => ({
      id: sub.id,
      studentName: sub.studentName,
      lrn: sub.studentId || `109823${Math.floor(100000 + Math.random() * 900000)}`,
      gradeLevel: sub.gradeLevel || 'Grade 5',
      section: sub.section || '',
      subject: sub.subject || 'Mathematics',
      assessmentTitle: sub.assessmentTitle || 'Mathematics Assessment',
      score: sub.score,
      flaggedCompetencies:
        sub.flaggedCompetencies && sub.flaggedCompetencies.length > 0
          ? sub.flaggedCompetencies
          : ['Foundational Numeracy & Problem Solving'],
      status:
        sub.status === 'resolved'
          ? 'Resolved'
          : sub.status === 'in_intervention'
          ? 'Under Remediation'
          : 'Pending Intervention',
      submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent',
    }));

    // If the school's flaggedRedCount > items.length and flaggedRedCount > 0, generate representative red flag learners across grades
    const targetRedCount = Math.max(school.flaggedRedCount || 0, items.length);
    if (items.length < targetRedCount && targetRedCount > 0) {
      // Filter registered learners for this school if available
      const registeredForSchool = registeredLearners.filter((rl) => {
        const rlSchoolLower = rl.schoolName.toLowerCase().trim();
        return rlSchoolLower.includes(schoolNameLower) || schoolNameLower.includes(rlSchoolLower);
      });

      const missingCount = targetRedCount - items.length;
      const sampleNames = [
        {
          name: 'Carlo Mendoza',
          grade: 'Grade 3',
          section: 'Grade 3 - Rizal',
          subj: 'Mathematics',
          score: 32,
          comp: ['Addition of Fractions', 'Multiplication Tables'],
        },
        {
          name: 'Althea Bonifacio',
          grade: 'Grade 3',
          section: 'Grade 3 - Luna',
          subj: 'Reading (English)',
          score: 38,
          comp: ['Phonics & Decoding', 'Vocabulary'],
        },
        {
          name: 'Paolo Garcia',
          grade: 'Grade 4',
          section: 'Grade 4 - Aguinaldo',
          subj: 'Mathematics',
          score: 35,
          comp: ['Long Division', 'Word Problems'],
        },
        {
          name: 'Lia Silang',
          grade: 'Grade 4',
          section: 'Grade 4 - Del Pilar',
          subj: 'Reading (Filipino)',
          score: 40,
          comp: ['Pang-uri at Pang-abay', 'Pag-unawa sa Binasa'],
        },
        {
          name: 'Kenneth Aquino',
          grade: 'Grade 5',
          section: 'Grade 5 - Section A',
          subj: 'Mathematics',
          score: 30,
          comp: ['Dissimilar Fractions', 'Least Common Denominator'],
        },
        {
          name: 'Samantha Reyes',
          grade: 'Grade 5',
          section: 'Grade 5 - Bonifacio',
          subj: 'Science',
          score: 36,
          comp: ['Scientific Method', 'Ecosystems'],
        },
        {
          name: 'Gabriel Santos',
          grade: 'Grade 6',
          section: 'Grade 6 - Quezon',
          subj: 'Mathematics',
          score: 28,
          comp: ['Algebraic Expressions', 'Percentage & Ratio'],
        },
        {
          name: 'Bea Alonzo',
          grade: 'Grade 6',
          section: 'Grade 6 - Roxas',
          subj: 'Reading (English)',
          score: 34,
          comp: ['Reading Comprehension', 'Context Clues'],
        },
      ];

      for (let i = 0; i < missingCount; i++) {
        const template = sampleNames[i % sampleNames.length];
        const regLearner = registeredForSchool[i % Math.max(1, registeredForSchool.length)];

        const name = regLearner?.name || template.name;
        const lrn = regLearner?.lrn || `1098${23451200 + i + 1}`;
        const gradeLevel = regLearner?.gradeLevel || template.grade;
        const section = regLearner?.section || template.section;

        if (!items.some((it) => it.studentName === name)) {
          items.push({
            id: `sim-red-${school.id}-${i}`,
            studentName: name,
            lrn: lrn,
            gradeLevel: gradeLevel,
            section: section,
            subject: template.subj,
            assessmentTitle: `${gradeLevel} ${template.subj}: Key Competency Diagnostic`,
            score: template.score,
            flaggedCompetencies: template.comp,
            status: i % 2 === 0 ? 'Pending Intervention' : 'Under Remediation',
            submittedAt: 'Active Red Flag',
          });
        }
      }
    }

    // Group items by Grade Level
    const groups: Record<string, typeof items> = {};
    items.forEach((item) => {
      const gl = item.gradeLevel || 'Grade 5';
      if (!groups[gl]) {
        groups[gl] = [];
      }
      groups[gl].push(item);
    });

    // Sort grade levels naturally (Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6)
    const sortedGradeLevels = Object.keys(groups).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return { items, groups, sortedGradeLevels };
  };

  const handleExportSdoCSV = () => {
    const headers = ['School ID', 'School Name', 'School Principal / Head', 'Total Enrolled Learners', 'Mastery Percentage', 'Red Flags Count', 'Status'];
    const rows = schools.map((s) => {
      const headAccount = activeHeadAccounts.find(
        (h) => h.schoolName.toLowerCase().trim() === s.name.toLowerCase().trim()
      );
      const principalName = headAccount ? headAccount.name : 'School Principal';
      return [
        s.id,
        s.name,
        principalName,
        s.totalStudents,
        `${s.masteredPercentage}%`,
        s.flaggedRedCount,
        s.flaggedRedCount > 3 ? 'NEEDS ASSISTANCE' : 'PERFORMING',
      ];
    });
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

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-2xl mb-1 shadow-xs">
            <SdoLogo className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
              Department of Education
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              Region V - Bicol
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Schools Division Office Portal
          </h2>
          <p className="text-xs text-slate-500">
            SDO Ligao City Governance & Division Oversight
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              loginUsername.trim().toLowerCase() === 'sdo.ligao' &&
              loginPassword.trim() === 'sdo.ligao2026'
            ) {
              setIsLoggedIn(true);
              setLoginError(null);
            } else {
              setLoginError('Invalid SDO credentials. Please use username: sdo.ligao and password: sdo.ligao2026.');
            }
          }}
          className="space-y-4"
        >
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              SDO Username
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter SDO username..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              SDO Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter SDO security password..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-200/60 hover:bg-slate-200 px-2 py-0.5 rounded transition-all"
              >
                {showLoginPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In to SDO Dashboard</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-1 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-md shrink-0">
              <SdoLogo className="w-14 h-14 drop-shadow-md" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                  Division Level • SDO Official
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-emerald-300" />
                  SDO Ligao Division
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5">
                {sdoName} DASHBOARD
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Broadest view across all <strong>{totalSchools} elementary schools</strong> in SDO Ligao City. Enables division-wide monitoring, reporting and technical assistance dispatch.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 font-mono font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Logged in as @sdo.ligao</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoggedIn(false);
                    setLoginUsername('');
                    setLoginPassword('');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold transition-all"
                  title="Sign out of SDO session"
                >
                  Sign Out
                </button>
              </div>
            </div>
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

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSchoolReport(sch)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-300" />
                      <span>View School Report</span>
                    </button>

                    {needsSupport && (
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Technical Assistance Dispatch requested for ${sch.name}. SDO Supervisors notified.`
                          )
                        }
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-xs"
                        title="Dispatch SDO Technical Assistance"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dispatch TA</span>
                      </button>
                    )}
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
              <div className="text-center pb-4 border-b border-slate-200 space-y-2">
                <div className="flex justify-center mb-1">
                  <SdoLogo className="w-16 h-16 drop-shadow-xs" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Republic of the Philippines • Department of Education</p>
                <p className="text-[11px] font-semibold text-slate-600">Region V - Bicol • Schools Division Office of Ligao City</p>
                <h2 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">Division Literacy & Numeracy Intervention Summary Report</h2>
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
                        <th className="p-2.5">School Principal / Head</th>
                        <th className="p-2.5">Enrolled Learners</th>
                        <th className="p-2.5">Mastery %</th>
                        <th className="p-2.5">Red Flags Count</th>
                        <th className="p-2.5">Division Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {schools.map((sch) => {
                        const headAcc = activeHeadAccounts.find(
                          (h) => h.schoolName.toLowerCase().trim() === sch.name.toLowerCase().trim()
                        );
                        const principalName = headAcc ? headAcc.name : 'School Principal';
                        return (
                          <tr key={sch.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{sch.name}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-600">{sch.id}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{principalName}</td>
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
                        );
                      })}
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

      {/* Dedicated School Red-Flagged Learners Governance Report Modal */}
      {selectedSchoolReport && (() => {
        const { items, groups, sortedGradeLevels } = getRedFlaggedLearnersForSchool(
          selectedSchoolReport,
          submissions
        );

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4 shrink-0 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                      SDO Governance Report
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      School ID: {selectedSchoolReport.schoolId || selectedSchoolReport.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <School className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>{selectedSchoolReport.name}</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Red-Flagged Learners Division Roster — Organized by Grade Level
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSchoolReport(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Summary KPI Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-red-600 block">Total Red Flags</span>
                    <span className="text-2xl font-black text-red-700">{items.length}</span>
                    <span className="text-[10px] text-red-600/80 block">Learners Needing Intervention</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-amber-600 block">Grade Levels</span>
                    <span className="text-2xl font-black text-amber-700">
                      {sortedGradeLevels.length}
                    </span>
                    <span className="text-[10px] text-amber-600/80 block">Affected Classes</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-blue-600 block">Mastery Level</span>
                    <span className="text-2xl font-black text-blue-700">{selectedSchoolReport.masteredPercentage}%</span>
                    <span className="text-[10px] text-blue-600/80 block">Overall Proficiency</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Response Time</span>
                    <span className="text-2xl font-black text-slate-900">{selectedSchoolReport.avgInterventionTimeMinutes}m</span>
                    <span className="text-[10px] text-slate-500 block">SDO TA Response</span>
                  </div>
                </div>

                {/* Red Flagged Learners List Organized by Grade Level */}
                {sortedGradeLevels.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-sm">No Active Red-Flagged Learners</h4>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                      {selectedSchoolReport.name} has zero active high-risk red flag submissions. All learner assessments meet standard proficiency benchmarks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedGradeLevels.map((grade) => {
                      const gradeLearners = groups[grade] || [];

                      return (
                        <div key={grade} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-0">
                          {/* Grade Level Section Header */}
                          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                              <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                                {grade}
                              </h4>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-2xs">
                              {gradeLearners.length} Red-Flagged {gradeLearners.length === 1 ? 'Learner' : 'Learners'}
                            </span>
                          </div>

                          {/* Grade Level Learners Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                  <th className="p-3">Learner & LRN</th>
                                  <th className="p-3">Section</th>
                                  <th className="p-3">Subject & Assessment</th>
                                  <th className="p-3 text-center">Score</th>
                                  <th className="p-3">Flagged Competencies</th>
                                  <th className="p-3 text-right">Intervention Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {gradeLearners.map((learner) => (
                                  <tr key={learner.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="p-3 font-bold text-slate-900">
                                      <div className="text-xs text-slate-900 font-extrabold">{learner.studentName}</div>
                                      <div className="text-[10px] font-mono text-slate-400">LRN: {learner.lrn}</div>
                                    </td>
                                    <td className="p-3 text-slate-700 font-medium text-xs">
                                      {learner.section}
                                    </td>
                                    <td className="p-3 text-slate-700 font-medium">
                                      <div className="font-bold text-slate-800">{learner.subject}</div>
                                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{learner.assessmentTitle}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="inline-block px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 font-extrabold text-xs rounded-lg">
                                        {learner.score}%
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                                        {learner.flaggedCompetencies.map((comp, cIdx) => (
                                          <span
                                            key={cIdx}
                                            className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-medium rounded"
                                          >
                                            {comp}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                        learner.status === 'Resolved'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : learner.status === 'Under Remediation'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {learner.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500">
                  Division Governance Data • Department of Education SDO Ligao City
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSchoolReport(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
