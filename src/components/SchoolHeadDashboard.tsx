import React, { useState, useMemo } from 'react';
import { SchoolStats, Submission, TutorAccount, SchoolHeadAccount } from '../types';
import { INITIAL_SCHOOL_HEAD_ACCOUNTS } from '../data/mockData';
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldCheck,
  Search,
  UserPlus,
  KeyRound,
  Trash2,
  LogOut,
  LogIn,
  School,
  Sparkles,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Printer,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SchoolHeadDashboardProps {
  schools: SchoolStats[];
  submissions: Submission[];
  tutorAccounts?: TutorAccount[];
  schoolHeadAccounts?: SchoolHeadAccount[];
  onAddTutorAccount?: (tutor: Omit<TutorAccount, 'id' | 'createdAt'>) => void;
  onDeleteTutorAccount?: (id: string) => void;
  onUpdateSchoolLearners?: (
    schoolName: string,
    newTotalStudents: number,
    updatedSections?: { name: string; tutor: string; total: number; flagged: number }[]
  ) => void;
  onUpdateSchoolHeadAccount?: (updated: SchoolHeadAccount) => void;
  onResetAllData?: () => void;
}

export const SchoolHeadDashboard: React.FC<SchoolHeadDashboardProps> = ({
  schools,
  submissions,
  tutorAccounts = [],
  schoolHeadAccounts = [],
  onAddTutorAccount,
  onDeleteTutorAccount,
  onUpdateSchoolLearners,
  onUpdateSchoolHeadAccount,
  onResetAllData,
}) => {
  const activeHeadAccounts = schoolHeadAccounts ?? INITIAL_SCHOOL_HEAD_ACCOUNTS;

  // Currently logged in School Head account
  const [loggedHead, setLoggedHead] = useState<SchoolHeadAccount | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editHeadName, setEditHeadName] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Editable learner count state
  const [isEditingLearners, setIsEditingLearners] = useState<boolean>(false);
  const [editedLearnersInput, setEditedLearnersInput] = useState<string>('240');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Dashboard view state
  const [isAnonymized, setIsAnonymized] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form state for creating tutor account
  const [newTutorName, setNewTutorName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newSection, setNewSection] = useState<string>('');
  const [newGradeLevel, setNewGradeLevel] = useState<string>('Grade 5');
  const [showPasswords, setShowPasswords] = useState<boolean>(true);

  // Active School Stats
  const activeSchool = useMemo(() => {
    if (!loggedHead) return null;
    return (
      schools.find(
        (s) => s.name.toLowerCase().trim() === loggedHead.schoolName.toLowerCase().trim()
      ) || {
        id: loggedHead.schoolId,
        name: loggedHead.schoolName,
        sdoName: 'SDO Ligao City',
        totalStudents: 240,
        masteredPercentage: 65,
        flaggedRedCount: 12,
        flaggedYellowCount: 18,
        resolvedCount: 22,
        avgInterventionTimeMinutes: 4.0,
        sections: [],
      }
    );
  }, [schools, loggedHead]);

  // Open and initialize Profile Editing
  const handleOpenEditProfile = () => {
    if (loggedHead) {
      setEditHeadName(loggedHead.name);
      setEditUsername(loggedHead.username);
      setEditPassword(loggedHead.password);
      setProfileSuccessMsg(null);
      setIsEditingProfile(true);
    }
  };

  // Save updated School Head profile & credentials
  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedHead || !editHeadName.trim() || !editUsername.trim() || !editPassword.trim()) return;

    const updatedAccount: SchoolHeadAccount = {
      ...loggedHead,
      name: editHeadName.trim(),
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
    };

    setLoggedHead(updatedAccount);
    if (onUpdateSchoolHeadAccount) {
      onUpdateSchoolHeadAccount(updatedAccount);
    }
    setProfileSuccessMsg('School Head profile & credentials updated successfully!');
    setTimeout(() => {
      setProfileSuccessMsg(null);
      setIsEditingProfile(false);
    }, 1800);
  };

  // Save edited headcount for school
  const handleSaveLearnerCount = () => {
    const val = parseInt(editedLearnersInput, 10);
    if (!isNaN(val) && val >= 0 && activeSchool && onUpdateSchoolLearners) {
      onUpdateSchoolLearners(activeSchool.name, val);
    }
    setIsEditingLearners(false);
  };

  // Handle School Head Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const foundHead = activeHeadAccounts.find(
      (sh) =>
        sh.username.toLowerCase().trim() === loginUsername.toLowerCase().trim() &&
        sh.password === loginPassword
    );

    if (foundHead) {
      setLoggedHead(foundHead);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid username or password. Please check your credentials.');
    }
  };

  // Quick helper to fill test account credentials
  const handleQuickSelectAccount = (username: string) => {
    const acc = activeHeadAccounts.find((sh) => sh.username === username);
    if (acc) {
      setLoginUsername(acc.username);
      setLoginPassword('');
      setLoginError(null);
    }
  };

  // Tutors belonging strictly to logged School Head's school
  const schoolTutorAccounts = useMemo(() => {
    if (!loggedHead) return [];
    return tutorAccounts.filter(
      (t) => t.schoolName.toLowerCase().trim() === loggedHead.schoolName.toLowerCase().trim()
    );
  }, [tutorAccounts, loggedHead]);

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedHead || !newTutorName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    if (onAddTutorAccount) {
      onAddTutorAccount({
        name: newTutorName.trim(),
        username: newUsername.trim().toLowerCase(),
        password: newPassword.trim(),
        schoolName: loggedHead.schoolName,
        section: newSection.trim(),
        gradeLevel: newGradeLevel.trim(),
        createdBySchoolHeadId: loggedHead.id,
      });
    }

    setNewTutorName('');
    setNewUsername('');
    setNewPassword('');
  };

  // Filter submissions belonging to the logged School Head's school ONLY
  const schoolSubmissions = useMemo(() => {
    if (!loggedHead) return [];
    const activeName = loggedHead.schoolName.toLowerCase().trim();
    return submissions.filter((s) => {
      if (!s.schoolName) return false;
      const subSchool = s.schoolName.toLowerCase().trim();
      return subSchool === activeName || activeName.includes(subSchool) || subSchool.includes(activeName);
    });
  }, [submissions, loggedHead]);

  const handleExportSchoolHeadCSV = () => {
    if (!loggedHead) return;
    const headers = ['Learner Name', 'Grade & Section', 'Assessment Title', 'Score', 'Max Score', 'Percentage', 'Flag Severity', 'Status', 'Submitted At'];
    const rows = schoolSubmissions.map((s) => [
      isAnonymized ? `Learner #${s.id.slice(-4)}` : s.studentName,
      s.section,
      s.assessmentTitle,
      s.score,
      s.totalQuestions,
      `${Math.round((s.score / (s.totalQuestions || 1)) * 100)}%`,
      s.flagSeverity.toUpperCase(),
      s.status,
      s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'N/A',
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SchoolHead_Report_${loggedHead.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Section chart data for logged school
  const sectionChartData = useMemo(() => {
    if (!activeSchool) return [];
    return activeSchool.sections.map((sec) => ({
      name: sec.name.replace(/^Grade \d+ - /, ''),
      Total: sec.total,
      Flagged: sec.flagged,
      Mastered: Math.max(0, sec.total - sec.flagged),
    }));
  }, [activeSchool]);

  // Flag distribution pie chart data for selected school
  const totalRed = schoolSubmissions.filter((s) => s.flagSeverity === 'red').length;
  const totalYellow = schoolSubmissions.filter((s) => s.flagSeverity === 'yellow').length;
  const totalNormal = schoolSubmissions.filter((s) => s.flagSeverity === 'none').length;

  const pieData = [
    { name: 'Red Flags', value: totalRed || 0, color: '#ef4444' },
    { name: 'Yellow Flags', value: totalYellow || 0, color: '#f59e0b' },
    { name: 'Mastered', value: totalNormal || 0, color: '#10b981' },
  ];

  // Anonymizer function for Data Privacy Act compliance
  const getStudentDisplayName = (name: string, id: string) => {
    if (!isAnonymized) return name;
    return `Learner #${id.slice(-4).toUpperCase()}`;
  };

  const filteredSubmissions = schoolSubmissions.filter(
    (sub) =>
      sub.flagSeverity !== 'none' &&
      (sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If no School Head is logged in, show the Login View
  if (!loggedHead) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">School Head Login Portal</h2>
          <p className="text-xs text-slate-500">
            Sign in as a DepEd School Principal to access school-bounded learner analytics and manage tutor accounts.
          </p>
        </div>

        {/* Quick Test Credentials Helper */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Quick Login Selector (52 Ligao Schools)</span>
          </div>
          <select
            onChange={(e) => handleQuickSelectAccount(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select a Principal Account...
            </option>
            {activeHeadAccounts.map((sh) => (
              <option key={sh.id} value={sh.username}>
                {sh.name} — {sh.schoolName} (ID: {sh.schoolId})
              </option>
            ))}
          </select>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Principal Username</label>
            <input
              type="text"
              required
              placeholder="e.g. principal.pinit"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to School Head Dashboard</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & School Head Profile Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                School Level • School Head
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-300" />
                <span>SCHOOL DATA BOUNDARY ENFORCED</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2 flex items-center gap-2">
              <span>{loggedHead.name}</span>
              <span className="text-indigo-300 text-lg font-semibold">({loggedHead.schoolName})</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              SDO Division: <strong className="text-white">{activeSchool?.sdoName || 'SDO Ligao City'}</strong> • Data Privacy Boundary Active: Viewing learners and sections belonging to <strong>{loggedHead.schoolName}</strong> only.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* School Boundary Lock Badge (Selection of other schools removed) */}
            <div className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>School: {loggedHead.schoolName} (ID: {loggedHead.schoolId})</span>
            </div>

            {/* Data Privacy Anonymizer Toggle */}
            <button
              onClick={() => setIsAnonymized((prev) => !prev)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 border transition-all ${
                isAnonymized
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Data Privacy Act Anonymization"
            >
              {isAnonymized ? (
                <>
                  <EyeOff className="w-4 h-4 text-white" />
                  <span>Privacy: ANONYMIZED</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Privacy: REVEAL NAMES</span>
                </>
              )}
            </button>

            {/* Edit Profile Button */}
            <button
              onClick={() => {
                if (isEditingProfile) {
                  setIsEditingProfile(false);
                } else {
                  handleOpenEditProfile();
                }
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile & Login</span>
            </button>

            {/* Reset Flagged Data Button */}
            {onResetAllData && (
              <button
                type="button"
                onClick={onResetAllData}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                title="Reset and clear all flagged learner data across dashboards"
              >
                <RotateCcw className="w-4 h-4 text-rose-200" />
                <span>Reset Flagged Data</span>
              </button>
            )}

            {/* Generate Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Generate Printable School Governance Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Generate Report</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setLoggedHead(null)}
              className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Edit School Profile & Credentials Form Card */}
        {isEditingProfile && (
          <div className="bg-white text-slate-900 border-2 border-indigo-500 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn mt-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Edit School Profile & Principal Login Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your principal display name, login username, and account password for {loggedHead.schoolName}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Principal / School Head Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editHeadName}
                    onChange={(e) => setEditHeadName(e.target.value)}
                    placeholder="e.g. Principal Maria Santos"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="e.g. principal.pinit"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-9 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>
                    School: <strong className="text-slate-900">{loggedHead.schoolName}</strong> (ID:{' '}
                    <code className="font-mono">{loggedHead.schoolId}</code>)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Profile & Credentials</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-800">
          {/* Editable Total Enrolled Learners Card */}
          <div className="bg-indigo-950/40 rounded-xl p-3.5 border border-indigo-800/50 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">Total Enrolled Learners</span>
              {!isEditingLearners && (
                <button
                  onClick={() => {
                    setEditedLearnersInput(String(activeSchool?.totalStudents || 0));
                    setIsEditingLearners(true);
                  }}
                  className="px-2 py-0.5 bg-indigo-600/60 hover:bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="Edit Learner Headcount"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingLearners ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={editedLearnersInput}
                  onChange={(e) => setEditedLearnersInput(e.target.value)}
                  className="w-20 bg-slate-900 border border-indigo-400 text-white font-extrabold text-base rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  autoFocus
                />
                <button
                  onClick={handleSaveLearnerCount}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow-xs transition-all"
                  title="Save Learner Headcount"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingLearners(false)}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-bold transition-all"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-2xl font-extrabold text-indigo-300 mt-1 flex items-baseline justify-between">
                <span>{(activeSchool?.totalStudents || 0).toLocaleString()}</span>
                <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  Editable
                </span>
              </div>
            )}
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-800/40">
            <span className="text-xs font-bold text-emerald-300 block">Mastery Rate</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span>{activeSchool?.masteredPercentage}%</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-red-950/40 rounded-xl p-3.5 border border-red-800/40">
            <span className="text-xs font-bold text-red-300 block">Red Flags</span>
            <div className="text-2xl font-extrabold text-red-400 mt-0.5">{totalRed || activeSchool?.flaggedRedCount}</div>
          </div>

          <div className="bg-blue-950/40 rounded-xl p-3.5 border border-blue-800/40">
            <span className="text-xs font-bold text-blue-300 block">Avg Intervention Time</span>
            <div className="text-2xl font-extrabold text-blue-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{activeSchool?.avgInterventionTimeMinutes}m</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700">
            <span className="text-xs font-bold text-slate-300 block">Interventions Resolved</span>
            <div className="text-2xl font-extrabold text-slate-100 mt-0.5">{activeSchool?.resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Charts & Section Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Comparison Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Section Mastery vs Flagged Learners</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">{loggedHead.schoolName}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="Mastered" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flag Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Flag Severity Distribution</span>
            </h3>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div>
              <span className="text-red-600 font-bold block text-[10px] uppercase">Red Flags</span>
              <span className="font-extrabold text-slate-900 text-base">{totalRed}</span>
            </div>
            <div>
              <span className="text-amber-600 font-bold block text-[10px] uppercase">Yellow</span>
              <span className="font-extrabold text-slate-900 text-base">{totalYellow}</span>
            </div>
            <div>
              <span className="text-emerald-600 font-bold block text-[10px] uppercase">Mastered</span>
              <span className="font-extrabold text-slate-900 text-base">{totalNormal}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Creation of Tutor Profile & Management Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Creation of Tutor Profile & Account Management
              </h3>
              <p className="text-xs text-slate-500">
                Create login credentials (username & password) for tutors assigned to {loggedHead.schoolName}.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            {schoolTutorAccounts.length} Active Tutors Registered
          </span>
        </div>

        {/* Create New Tutor Profile Form */}
        <form onSubmit={handleCreateTutor} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Create New Tutor Profile Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Tutor Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Teacher Juan Dela Cruz"
                value={newTutorName}
                onChange={(e) => setNewTutorName(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. teacher.juan"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  placeholder="Set account password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 pr-8 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                Assigned Section / Grade
              </label>
              <input
                type="text"
                placeholder="e.g. Grade 5 - Section A"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Tutor Profile</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing Tutors Table */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registered School Tutors for {loggedHead.schoolName}:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-2.5">Tutor Name</th>
                  <th className="p-2.5">Username</th>
                  <th className="p-2.5">Password</th>
                  <th className="p-2.5">Assigned Section</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolTutorAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                      No tutor accounts created yet for {loggedHead.schoolName}. Use the form above to add a tutor.
                    </td>
                  </tr>
                ) : (
                  schoolTutorAccounts.map((tutor) => (
                    <tr key={tutor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">{tutor.name}</td>
                      <td className="p-2.5 font-mono text-slate-700">{tutor.username}</td>
                      <td className="p-2.5 font-mono text-indigo-700 font-semibold">
                        {showPasswords ? tutor.password : '••••••••'}
                      </td>
                      <td className="p-2.5 text-slate-600 font-medium">{tutor.section}</td>
                      <td className="p-2.5 text-right">
                        {onDeleteTutorAccount && (
                          <button
                            onClick={() => onDeleteTutorAccount(tutor.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Revoke / Delete Tutor Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Flagged Learners Master Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Flagged Learners Roster ({loggedHead.schoolName})
              </h3>
              <p className="text-xs text-slate-500">
                Learners flagged for targeted intervention belonging strictly to {loggedHead.schoolName}.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by learner or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3">Learner Name</th>
                <th className="p-3">Section</th>
                <th className="p-3">Subject</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Flagged Competencies</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No flagged learners currently active for {loggedHead.schoolName}.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                        {isAnonymized ? '?' : sub.studentName[0]}
                      </div>
                      <span>{getStudentDisplayName(sub.studentName, sub.studentId)}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{sub.section}</td>
                    <td className="p-3 text-slate-900 font-semibold">
                      {sub.flaggedCompetencies?.length ? sub.flaggedCompetencies.join(', ') : sub.assessmentTitle || sub.subject}
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          sub.score < 50
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.score}%
                      </span>
                    </td>
                    <td className="p-3">
                      {sub.flagSeverity === 'red' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full">
                          RED FLAG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                          YELLOW
                        </span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-600">
                      {sub.flaggedCompetencies.join(', ')}
                    </td>
                    <td className="p-3">
                      {sub.status === 'resolved' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable School Head Governance Report Modal */}
      {showReportModal && loggedHead && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Top Actions */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">School Governance & IRIP Summary Report</h3>
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
                  onClick={handleExportSchoolHeadCSV}
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
              {/* DepEd Header */}
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Republic of the Philippines • Department of Education</p>
                <p className="text-[11px] font-semibold text-slate-600">Region V - Bicol • Schools Division Office of Ligao City</p>
                <h2 className="text-lg font-black text-slate-900 mt-2 uppercase tracking-tight">School Literacy & Numeracy Intervention Governance Report</h2>
                <p className="text-xs font-medium text-slate-600">
                  School Name: <strong className="text-slate-900">{loggedHead.schoolName}</strong> • School ID: <strong className="font-mono text-slate-900">{loggedHead.schoolId}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  School Head / Principal: <strong>{loggedHead.name}</strong> • Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Summary Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Registered Tutors</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{schoolTutorAccounts.length}</span>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 block">Learners Assessed</span>
                  <span className="text-xl font-extrabold text-blue-900 mt-0.5 block">{schoolSubmissions.length}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 block">Red Flags (High Risk)</span>
                  <span className="text-xl font-extrabold text-red-900 mt-0.5 block">{activeSchool?.flaggedRedCount || 0}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">School Avg Mastery</span>
                  <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">{activeSchool?.masteredPercentage || 0}%</span>
                </div>
              </div>

              {/* Tutors Roster Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Assigned Tutors & Class Sections</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Tutor Name</th>
                        <th className="p-2.5">Account Username</th>
                        <th className="p-2.5">Grade Level</th>
                        <th className="p-2.5">Class Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {schoolTutorAccounts.map((tut) => (
                        <tr key={tut.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{tut.name}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">@{tut.username}</td>
                          <td className="p-2.5">{tut.gradeLevel}</td>
                          <td className="p-2.5 font-semibold text-indigo-700">{tut.section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High Risk Flagged Submissions Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Flagged Learners Requiring Intervention Support</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Learner Name</th>
                        <th className="p-2.5">Section</th>
                        <th className="p-2.5">Assessment Title</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Flag</th>
                        <th className="p-2.5">Targeted Competencies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {schoolSubmissions.filter(s => s.flagSeverity === 'red' || s.flagSeverity === 'yellow').map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{isAnonymized ? `Learner #${sub.id.slice(-4)}` : sub.studentName}</td>
                          <td className="p-2.5 font-mono text-[11px]">{sub.section}</td>
                          <td className="p-2.5">{sub.assessmentTitle}</td>
                          <td className="p-2.5 font-bold">{sub.score} / {sub.totalQuestions}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${sub.flagSeverity === 'red' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                              {sub.flagSeverity.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-600">{sub.flaggedCompetencies.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Prepared By:</p>
                  <div className="mt-8 border-b border-slate-900 w-48 font-bold text-slate-900">{loggedHead.name}</div>
                  <p className="text-[10px] text-slate-500 mt-1">School Head / Principal ({loggedHead.schoolName})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Submitted To:</p>
                  <div className="mt-8 border-b border-slate-900 w-48 font-bold text-slate-900">SDO Division Supervisor</div>
                  <p className="text-[10px] text-slate-500 mt-1">Schools Division Office - Ligao City</p>
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
