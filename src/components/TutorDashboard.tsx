import React, { useState, useMemo, useEffect } from 'react';
import { Assessment, InterventionStrategy, Question, Submission, RegisteredLearner, TutorAccount } from '../types';
import { GuidedSolutionSteps } from './GuidedSolutionSteps';
import { INITIAL_SCHOOL_HEAD_ACCOUNTS } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MATH_COMPETENCY_TRENDS_WEEKLY,
  MATH_COMPETENCY_TRENDS_MONTHLY,
  MATH_COMPETENCY_TRENDS_SESSION,
} from '../data/mockData';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Users,
  Search,
  PlusCircle,
  FileCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  X,
  User,
  Footprints,
  FileText,
  CheckSquare,
  Table,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  BarChart2,
  TrendingUp,
  Layers,
  Calendar,
  Info,
  UploadCloud,
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Copy,
  Download,
  HelpCircle,
  UserCheck,
  UserPlus,
  Edit2,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Lock,
  LogOut,
  LogIn,
  KeyRound,
  Building2,
  RotateCcw,
} from 'lucide-react';

interface TutorDashboardProps {
  submissions: Submission[];
  assessments: Assessment[];
  toolkit: InterventionStrategy[];
  registeredLearners: RegisteredLearner[];
  tutorAccounts?: TutorAccount[];
  onAddLearner: (learner: Omit<RegisteredLearner, 'id' | 'registeredAt'>) => void;
  onUpdateLearner: (id: string, updatedData: Partial<RegisteredLearner>) => void;
  onDeleteLearner: (id: string) => void;
  onAssignIntervention: (submissionId: string, interventionId: string, notes?: string) => void;
  onResolveSubmission: (submissionId: string) => void;
  onAddNewAssessment: (assessment: Assessment) => void;
  onOpenToolkit: () => void;
  onAddToolkitItem?: (item: Omit<InterventionStrategy, 'id'>) => void;
  onDeleteToolkitItem?: (id: string) => void;
  onResetAllData?: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  submissions,
  assessments,
  toolkit,
  registeredLearners,
  tutorAccounts = [],
  onAddLearner,
  onUpdateLearner,
  onDeleteLearner,
  onAssignIntervention,
  onResolveSubmission,
  onAddNewAssessment,
  onOpenToolkit,
  onAddToolkitItem,
  onDeleteToolkitItem,
  onResetAllData,
}) => {
  const [loggedTutor, setLoggedTutor] = useState<TutorAccount | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'red' | 'yellow' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const activeTutor: TutorAccount = useMemo(() => {
    if (loggedTutor) return loggedTutor;
    if (tutorAccounts.length > 0) return tutorAccounts[0];
    return {
      id: 'tut-default',
      username: 'elena.ramos',
      password: '111770PINITES',
      name: 'Teacher Ma. Elena Ramos',
      schoolName: 'PINIT ELEMENTARY SCHOOL',
      section: '',
      gradeLevel: 'Grade 5',
      createdAt: new Date().toISOString(),
    };
  }, [loggedTutor, tutorAccounts]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    const matched = tutorAccounts.find(
      (t) => t.username.toLowerCase().trim() === cleanUser && t.password.trim() === cleanPass
    );

    if (matched) {
      setLoggedTutor(matched);
      setLoginError(null);
    } else {
      setLoginError('Invalid username or password. Please check credentials created by your School Head.');
    }
  };

  const handleLogout = () => {
    setLoggedTutor(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(null);
  };

  // Registered Learners strictly belonging to the active tutor's assigned school profile
  const tutorClassRegisteredLearners = useMemo(() => {
    return registeredLearners.filter((l) => {
      const matchSchool = !l.schoolName || l.schoolName.toLowerCase().trim() === activeTutor.schoolName.toLowerCase().trim();
      return matchSchool;
    });
  }, [registeredLearners, activeTutor]);

  // Submissions strictly belonging to the active tutor's assigned school profile
  const tutorClassSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSchool = !s.schoolName || s.schoolName.toLowerCase().trim() === activeTutor.schoolName.toLowerCase().trim();
      return matchSchool;
    });
  }, [submissions, activeTutor]);

  // Sort class submissions by latest timestamp descending
  const sortedSubmissions = useMemo(() => {
    return [...tutorClassSubmissions].sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [tutorClassSubmissions]);

  const handleExportTutorCSV = () => {
    const headers = ['Learner Name', 'Grade & Section', 'Assessment Title', 'Score', 'Max Score', 'Percentage', 'Flag Severity', 'Status', 'Submitted At'];
    const rows = sortedSubmissions.map((s) => [
      s.studentName,
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
    link.setAttribute("download", `Tutor_Report_${activeTutor.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    sortedSubmissions[0]?.id || null
  );

  // Auto-sync selected submission to the last recorded entry if missing or invalid
  useEffect(() => {
    if (sortedSubmissions.length > 0) {
      if (!selectedSubmissionId || !sortedSubmissions.some((s) => s.id === selectedSubmissionId)) {
        setSelectedSubmissionId(sortedSubmissions[0].id);
      }
    }
  }, [sortedSubmissions, selectedSubmissionId]);

  const [dashboardViewMode, setDashboardViewMode] = useState<'tabular' | 'inspector' | 'roster'>('tabular');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Keep encoding form fields synced with active tutor class
  useEffect(() => {
    setNewSection(activeTutor.section);
    setNewGradeLevel(activeTutor.gradeLevel);
    setNewSchoolName(activeTutor.schoolName);
  }, [activeTutor]);

  // Learner Roster Encoding States
  const [newLrn, setNewLrn] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newSection, setNewSection] = useState<string>(activeTutor.section);
  const [newGradeLevel, setNewGradeLevel] = useState<string>(activeTutor.gradeLevel);
  const [newSchoolName, setNewSchoolName] = useState<string>(activeTutor.schoolName);
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [rosterGradeFilter, setRosterGradeFilter] = useState<string>('all');
  const [editingLearnerId, setEditingLearnerId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editLrn, setEditLrn] = useState<string>('');
  const [editSection, setEditSection] = useState<string>('');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchCsvText, setBatchCsvText] = useState<string>('');

  // Competency Trend Chart states
  const [trendTimeframe, setTrendTimeframe] = useState<'weekly' | 'monthly' | 'session'>('weekly');
  const [trendChartType, setTrendChartType] = useState<'grouped' | 'stacked'>('grouped');
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState<string>('all');
  const [showTrendAnalytics, setShowTrendAnalytics] = useState<boolean>(true);

  // Upload Test Questions Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'builder'>('file');
  const [uploadFileContent, setUploadFileContent] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [targetAssessmentChoice, setTargetAssessmentChoice] = useState<string>('new');
  const [newAssessmentTitle, setNewAssessmentTitle] = useState<string>('');

  // Builder form state
  const [builderQuestionText, setBuilderQuestionText] = useState<string>('');
  const [builderCompetency, setBuilderCompetency] = useState<string>('Addition & Subtraction of Dissimilar Fractions');
  const [builderGrade, setBuilderGrade] = useState<string>('Grade 5');
  const [builderReadingAid, setBuilderReadingAid] = useState<string>('');
  const [builderOptions, setBuilderOptions] = useState<string[]>(['', '', '', '']);
  const [builderCorrectIndex, setBuilderCorrectIndex] = useState<number>(0);
  const [builderGuidedStepTitle, setBuilderGuidedStepTitle] = useState<string>('Find Least Common Denominator');
  const [builderBlankPrefix, setBuilderBlankPrefix] = useState<string>('LCD = ');
  const [builderBlankSuffix, setBuilderBlankSuffix] = useState<string>('.');
  const [builderBlankCorrectValue, setBuilderBlankCorrectValue] = useState<string>('');

  const activeTrendData =
    trendTimeframe === 'monthly'
      ? MATH_COMPETENCY_TRENDS_MONTHLY
      : trendTimeframe === 'session'
      ? MATH_COMPETENCY_TRENDS_SESSION
      : MATH_COMPETENCY_TRENDS_WEEKLY;

  // Calculate step-by-step solution performance metrics for a submission
  const calculateSubmissionStepStats = (sub: Submission, assessment?: Assessment) => {
    let totalBlanks = 0;
    let correctBlanks = 0;

    const targetAssessment = assessment || assessments.find((a) => a.id === sub.assessmentId);
    if (!targetAssessment) return { totalBlanks: 0, correctBlanks: 0, percent: 0 };

    targetAssessment.questions.forEach((q) => {
      const studentAns = sub.answers.find((a) => a.questionId === q.id);
      const guidedAnswers = studentAns?.guidedStepAnswers || {};

      const guidedSteps = q.guidedSteps && q.guidedSteps.length > 0
        ? q.guidedSteps
        : q.solutionSteps && q.solutionSteps.length > 0
        ? q.solutionSteps.map((stepStr, idx) => {
            const parts = stepStr.split(':');
            const stepText = parts.slice(1).join(':').trim() || stepStr;
            const numbers = stepText.match(/\d+(\.\d+)?(\/\d+)?/g);
            const lastNumber = numbers && numbers.length > 0 ? numbers[numbers.length - 1] : '';
            return {
              stepNumber: idx + 1,
              title: parts[0] || `Step ${idx + 1}`,
              blanks: [
                {
                  id: `${q.id}-gen-s${idx + 1}-b1`,
                  correctValue: lastNumber || 'Done',
                },
              ],
            };
          })
        : [];

      guidedSteps.forEach((step) => {
        step.blanks.forEach((blank) => {
          totalBlanks++;
          const val = (guidedAnswers[blank.id] || '').trim();
          if (val.toLowerCase() === blank.correctValue.trim().toLowerCase()) {
            correctBlanks++;
          }
        });
      });
    });

    const percent = totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * 100) : 0;
    return { totalBlanks, correctBlanks, percent };
  };

  // AI Plan states
  const [aiPlanLoading, setAiPlanLoading] = useState<boolean>(false);
  const [aiPlanResult, setAiPlanResult] = useState<{
    diagnosisSummary?: string;
    recommendedToolkitTitle?: string;
    materialsNeeded?: string[];
    guidedSteps?: string[];
    encouragementQuote?: string;
  } | null>(null);

  // Custom AI Assessment Modal state
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Addition & Subtraction of Dissimilar Fractions');
  const [aiSubject, setAiSubject] = useState<string>('Mathematics');
  const [aiGrade, setAiGrade] = useState<string>('Grade 5');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);

  // Helper for downloading sample test questions JSON template
  const handleDownloadSampleJson = () => {
    const sampleData = [
      {
        id: "q-sample-01",
        text: "What is 2/5 + 1/4?",
        options: ["3/9", "13/20", "3/20", "8/20"],
        correctOptionIndex: 1,
        competency: "Addition & Subtraction of Dissimilar Fractions",
        readingAidText: "Remember to find the Least Common Denominator (LCD) of 5 and 4 first.",
        solutionSteps: [
          "Step 1: Find LCD of 5 and 4, which is 20.",
          "Step 2: Convert fractions: 2/5 = 8/20 and 1/4 = 5/20.",
          "Step 3: Add numerators: 8/20 + 5/20 = 13/20."
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            title: "Find LCD",
            instruction: "Determine the Least Common Denominator for 5 and 4:",
            blanks: [
              {
                id: "q-s1-s1-b1",
                prefixText: "LCD = ",
                suffixText: ".",
                correctValue: "20",
                placeholder: "___"
              }
            ]
          },
          {
            stepNumber: 2,
            title: "Convert Fractions",
            instruction: "Convert numerators to twentieths:",
            blanks: [
              {
                id: "q-s1-s2-b1",
                prefixText: "2/5 = ",
                suffixText: "/20",
                correctValue: "8",
                placeholder: "___"
              },
              {
                id: "q-s1-s2-b2",
                prefixText: "1/4 = ",
                suffixText: "/20",
                correctValue: "5",
                placeholder: "___"
              }
            ]
          },
          {
            stepNumber: 3,
            title: "Add Converted Fractions",
            instruction: "Add the numerators together over 20:",
            blanks: [
              {
                id: "q-s1-s3-b1",
                prefixText: "8/20 + 5/20 = ",
                suffixText: "/20",
                correctValue: "13",
                placeholder: "___"
              }
            ]
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_questions_sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleExcel = () => {
    const csvHeader = 'Question Text,Option A,Option B,Option C,Option D,Correct Option Index (0-3),Competency,Reading Aid Text\n';
    const sampleRows = [
      '"What is 3/8 + 1/2 in simplest form?","3/10","7/8","5/8","4/8","1","Addition of Dissimilar Fractions","Convert 1/2 to 4/8 with LCD = 8"',
      '"What is 3/4 - 1/3 in simplest form?","2/1","5/12","1/12","2/12","1","Subtraction of Dissimilar Fractions","Find LCD of 4 and 3 which is 12"',
      '"Solve 12.5 x 0.4 =","5.0","0.5","50.0","5.04","0","Multiplication of Decimals","Count total decimal places"'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_questions_excel_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Process uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setUploadFileContent(content);
      parseFileQuestions(content, file.name);
    };
    reader.readAsText(file);
  };

  const parseFileQuestions = (content: string, fileName: string) => {
    try {
      if (fileName.endsWith('.json') || content.trim().startsWith('[') || content.trim().startsWith('{')) {
        const json = JSON.parse(content);
        const qList = Array.isArray(json) ? json : json.questions ? json.questions : [json];
        
        const validQs: Question[] = qList.map((q: any, idx: number) => ({
          id: q.id || `uploaded-q-${Date.now()}-${idx}`,
          text: q.text || q.questionText || `Uploaded Question ${idx + 1}`,
          tagalogText: q.tagalogText || q.tagalogTranslation || undefined,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
          competency: q.competency || 'Mathematics Competency',
          difficulty: 'medium',
          readingAidText: q.readingAidText || undefined,
          solutionSteps: Array.isArray(q.solutionSteps) ? q.solutionSteps : [`Step 1: ${q.text || 'Solve problem'}`],
          guidedSteps: Array.isArray(q.guidedSteps) ? q.guidedSteps : undefined,
        }));

        setParsedQuestions(validQs);
      } else {
        // Excel CSV / Tab delimited parsing
        const lines = content.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          throw new Error('Excel/CSV file must have a header row and at least 1 question row.');
        }
        const hasHeader = lines[0].toLowerCase().includes('question') || lines[0].toLowerCase().includes('option');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        const csvQuestions: Question[] = dataLines.map((line, idx) => {
          let parts: string[] = [];
          if (line.includes('\t')) {
            parts = line.split('\t').map((p) => p.trim().replace(/^"|"$/g, ''));
          } else {
            parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
          }

          return {
            id: `excel-q-${Date.now()}-${idx}`,
            text: parts[0] || `Uploaded Question ${idx + 1}`,
            options: [parts[1] || 'Option A', parts[2] || 'Option B', parts[3] || 'Option C', parts[4] || 'Option D'],
            correctAnswer: parseInt(parts[5], 10) || 0,
            competency: parts[6] || 'Mathematics Competency',
            difficulty: 'medium',
            readingAidText: parts[7] || undefined,
            tagalogText: parts[8] || undefined,
            solutionSteps: [`Step 1: ${parts[0] || 'Solve question'}`],
          };
        });
        setParsedQuestions(csvQuestions);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing test question file. Please verify format.');
      setParsedQuestions([]);
    }
  };

  const handleSaveUploadedFileQuestions = () => {
    if (parsedQuestions.length === 0) return;

    if (targetAssessmentChoice === 'new') {
      const title = newAssessmentTitle.trim() || `Uploaded Assessment: ${uploadFileName || 'Custom Questions'}`;
      const newAssessment: Assessment = {
        id: `assess-upload-${Date.now()}`,
        title,
        subject: 'Mathematics',
        gradeLevel: 'Grade 5',
        type: 'post_session',
        timeLimitMinutes: 10,
        questions: parsedQuestions,
      };
      onAddNewAssessment(newAssessment);
    } else {
      const existing = assessments.find((a) => a.id === targetAssessmentChoice);
      if (existing) {
        const updated: Assessment = {
          ...existing,
          questions: [...existing.questions, ...parsedQuestions],
        };
        onAddNewAssessment(updated);
      }
    }

    setShowUploadModal(false);
    setParsedQuestions([]);
    setUploadFileContent('');
    setUploadFileName('');
  };

  const handleSaveManualBuilderQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderQuestionText.trim()) return;

    const newQuestion: Question = {
      id: `manual-q-${Date.now()}`,
      text: builderQuestionText.trim(),
      options: builderOptions.map((o, idx) => o.trim() || `Option ${String.fromCharCode(65 + idx)}`),
      correctAnswer: builderCorrectIndex,
      competency: builderCompetency,
      difficulty: 'medium',
      readingAidText: builderReadingAid.trim() || undefined,
      solutionSteps: [
        `Step 1: Identify competency topic - ${builderCompetency}`,
        `Step 2: Solve step by step to arrive at ${builderOptions[builderCorrectIndex] || 'correct answer'}`,
      ],
      guidedSteps: builderBlankCorrectValue.trim()
        ? [
            {
              stepNumber: 1,
              title: builderGuidedStepTitle.trim() || 'Step 1',
              instruction: 'Fill in the correct value to proceed:',
              blanks: [
                {
                  id: `manual-q-b-${Date.now()}`,
                  prefixText: builderBlankPrefix,
                  suffixText: builderBlankSuffix,
                  correctValue: builderBlankCorrectValue.trim(),
                  placeholder: '___',
                },
              ],
            },
          ]
        : undefined,
    };

    if (targetAssessmentChoice === 'new') {
      const title = newAssessmentTitle.trim() || `Uploaded Test Assessment (${builderCompetency})`;
      const newAssess: Assessment = {
        id: `assess-manual-${Date.now()}`,
        title,
        subject: 'Mathematics',
        gradeLevel: builderGrade,
        type: 'post_session',
        timeLimitMinutes: 10,
        questions: [newQuestion],
      };
      onAddNewAssessment(newAssess);
    } else {
      const existing = assessments.find((a) => a.id === targetAssessmentChoice);
      if (existing) {
        const updated: Assessment = {
          ...existing,
          questions: [...existing.questions, newQuestion],
        };
        onAddNewAssessment(updated);
      }
    }

    setShowUploadModal(false);
    setBuilderQuestionText('');
    setBuilderOptions(['', '', '', '']);
    setBuilderBlankCorrectValue('');
  };

  // Encoding & Roster Handlers
  const handleEncodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const sec = newSection.trim();
    const inferredGrade = sec.toLowerCase().includes('grade 4')
      ? 'Grade 4'
      : sec.toLowerCase().includes('grade 6')
      ? 'Grade 6'
      : 'Grade 5';
    onAddLearner({
      lrn: newLrn.trim() || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: newName.trim(),
      section: sec,
      gradeLevel: inferredGrade,
      schoolName: newSchoolName.trim() || 'Rizal Elementary School',
    });
    setNewName('');
    setNewLrn('');
  };

  const handleStartEdit = (learner: RegisteredLearner) => {
    setEditingLearnerId(learner.id);
    setEditName(learner.name);
    setEditLrn(learner.lrn);
    setEditSection(learner.section);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateLearner(id, {
      name: editName.trim(),
      lrn: editLrn.trim(),
      section: editSection.trim(),
    });
    setEditingLearnerId(null);
  };

  const handleBatchCsvSubmit = () => {
    if (!batchCsvText.trim()) return;
    const lines = batchCsvText.split('\n');
    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const section = parts[1] || '';
        const lrn = parts[2] || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        if (name && name.toLowerCase() !== 'name') {
          onAddLearner({
            lrn,
            name,
            section,
            gradeLevel: 'Grade 5',
            schoolName: 'Rizal Elementary School',
          });
        }
      }
    });
    setBatchCsvText('');
    setShowBatchModal(false);
  };

  const availableGradeLevels = useMemo(() => {
    const defaultGrades = ['Grade 4', 'Grade 5', 'Grade 6'];
    const customGrades = tutorClassRegisteredLearners.map((l) => l.gradeLevel);
    const combined = Array.from(new Set([...defaultGrades, ...customGrades])).filter(Boolean);
    return combined;
  }, [tutorClassRegisteredLearners]);

  const filteredRegisteredLearners = useMemo(() => {
    return tutorClassRegisteredLearners.filter((l) => {
      const searchLower = rosterSearch.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        l.name.toLowerCase().includes(searchLower) ||
        l.section.toLowerCase().includes(searchLower) ||
        l.lrn.toLowerCase().includes(searchLower) ||
        l.schoolName.toLowerCase().includes(searchLower);

      const matchesGrade =
        rosterGradeFilter === 'all' ||
        l.gradeLevel.toLowerCase() === rosterGradeFilter.toLowerCase();

      return matchesSearch && matchesGrade;
    });
  }, [tutorClassRegisteredLearners, rosterSearch, rosterGradeFilter]);

  const selectedSubmission =
    sortedSubmissions.find((s) => s.id === selectedSubmissionId) || sortedSubmissions[0];

  const filteredSubmissions = sortedSubmissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterSeverity === 'red') return matchesSearch && sub.flagSeverity === 'red';
    if (filterSeverity === 'yellow') return matchesSearch && sub.flagSeverity === 'yellow';
    if (filterSeverity === 'resolved') return matchesSearch && sub.status === 'resolved';
    return matchesSearch;
  });

  const consolidatedTabularGroups = useMemo(() => {
    const red = filteredSubmissions.filter((s) => s.flagSeverity === 'red' && s.status !== 'resolved');
    const yellow = filteredSubmissions.filter((s) => s.flagSeverity === 'yellow' && s.status !== 'resolved');
    const resolved = filteredSubmissions.filter((s) => s.status === 'resolved' || s.flagSeverity === 'none');

    const groups = [];

    if (filterSeverity === 'all' || filterSeverity === 'red') {
      groups.push({
        key: 'red',
        title: '🔴 RED FLAGS — High Urgency Intervention Required',
        description: 'Learners scoring <50%. Require immediate tutor intervention & guided practice.',
        badge: `${red.length} Learner${red.length === 1 ? '' : 's'}`,
        badgeStyle: 'bg-red-600 text-white',
        headerBg: 'bg-red-50/90 text-red-950 border-red-200',
        items: red,
      });
    }

    if (filterSeverity === 'all' || filterSeverity === 'yellow') {
      groups.push({
        key: 'yellow',
        title: '🟡 YELLOW ALERTS — Moderate Warning (Near Threshold)',
        description: 'Learners scoring 50% - 74%. Need practice in guided solution steps.',
        badge: `${yellow.length} Learner${yellow.length === 1 ? '' : 's'}`,
        badgeStyle: 'bg-amber-500 text-white',
        headerBg: 'bg-amber-50/90 text-amber-950 border-amber-200',
        items: yellow,
      });
    }

    if (filterSeverity === 'all' || filterSeverity === 'resolved') {
      groups.push({
        key: 'resolved',
        title: '🟢 MASTERED & RESOLVED — Achieved Competency Standard',
        description: 'Learners scoring ≥75% or whose flags have been marked resolved.',
        badge: `${resolved.length} Learner${resolved.length === 1 ? '' : 's'}`,
        badgeStyle: 'bg-emerald-600 text-white',
        headerBg: 'bg-emerald-50/90 text-emerald-950 border-emerald-200',
        items: resolved,
      });
    }

    return groups;
  }, [filteredSubmissions, filterSeverity]);

  const redCount = sortedSubmissions.filter((s) => s.flagSeverity === 'red' && s.status !== 'resolved').length;
  const yellowCount = sortedSubmissions.filter((s) => s.flagSeverity === 'yellow' && s.status !== 'resolved').length;
  const resolvedCount = sortedSubmissions.filter((s) => s.status === 'resolved').length;

  // Fetch Gemini Intervention Advice
  const fetchAiInterventionPlan = async (sub: Submission) => {
    setAiPlanLoading(true);
    setAiPlanResult(null);

    const activeAssessment = assessments.find((a) => a.id === sub.assessmentId);
    const missedQuestions = activeAssessment?.questions
      .filter((q) => {
        const studentAns = sub.answers.find((a) => a.questionId === q.id);
        return !studentAns?.isCorrect;
      })
      .map((q) => ({ text: q.text, competency: q.competency, explanation: q.explanation }));

    try {
      const res = await fetch('/api/gemini/suggest-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: sub.studentName,
          subject: sub.subject,
          score: sub.score,
          missedQuestions,
          flaggedCompetencies: sub.flaggedCompetencies,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiPlanResult(json.data);
      }
    } catch (err) {
      console.error('Failed to generate AI intervention plan', err);
    } finally {
      setAiPlanLoading(false);
    }
  };

  // Generate Custom Assessment via Gemini
  const handleGenerateCustomQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/gemini/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Mathematics',
          gradeLevel: aiGrade,
          competencyTopic: aiTopic,
          questionCount: 4,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const newAssessment: Assessment = {
          id: `assess-ai-${Date.now()}`,
          title: json.data.title || `${aiGrade} Mathematics: ${aiTopic}`,
          subject: 'Mathematics',
          gradeLevel: aiGrade,
          type: 'post_session',
          timeLimitMinutes: 10,
          questions: json.data.questions || [],
        };
        onAddNewAssessment(newAssessment);
        setShowAiModal(false);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const getMinutesElapsed = (flaggedAt?: string) => {
    if (!flaggedAt) return 0;
    const diffMs = Date.now() - new Date(flaggedAt).getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  if (!loggedTutor) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {/* Login Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">DepEd Tutor Authentication</h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with the tutor username and password created by your School Head.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1.5">Tutor Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder=" "
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                title={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Classroom Dashboard</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Active Tutor Profile Controls */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                Classroom View • Tutor Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>CLASS DATA ISOLATION ACTIVE</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2 flex items-center gap-2">
              <span>{activeTutor.name}</span>
              <span className="text-blue-400 text-lg font-semibold">({activeTutor.section})</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              School Profile: <strong className="text-white">{activeTutor.schoolName}</strong> • Access Enforced: Red-flagged count and learner submissions are strictly based on your assigned school profile ({activeTutor.schoolName}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Authenticated Tutor Session Badge & Logout Button */}
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                  {activeTutor.name[0]}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{activeTutor.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">@{activeTutor.username}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ml-2"
                title="Log Out of Tutor Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Reset Flagged Data Button */}
            {onResetAllData && (
              <button
                type="button"
                onClick={onResetAllData}
                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
                title="Reset and clear all flagged learner data across dashboards"
              >
                <RotateCcw className="w-4 h-4 text-rose-200" />
                <span>Reset Flagged Data</span>
              </button>
            )}

            {/* Generate Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
              title="Generate Printable Assessment & Intervention Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Generate Report</span>
            </button>

            {/* Dashboard View Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setDashboardViewMode('tabular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  dashboardViewMode === 'tabular'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Table className="w-4 h-4 text-blue-600" />
                <span>Consolidated Tabular</span>
              </button>

              <button
                onClick={() => setDashboardViewMode('inspector')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  dashboardViewMode === 'inspector'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span>Split Inspector</span>
              </button>

              <button
                onClick={() => setDashboardViewMode('roster')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  dashboardViewMode === 'roster'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Enrollment of Learner ({tutorClassRegisteredLearners.length})</span>
              </button>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-100" />
              <span>Upload Test Questions</span>
            </button>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-blue-200" />
              <span>Generate AI Quiz</span>
            </button>

            <button
              onClick={onOpenToolkit}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Toolkit</span>
            </button>
          </div>
        </div>
      </div>

        {/* Real-time Tally Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-red-50/60 rounded-lg p-3.5 border border-red-100">
            <span className="text-xs font-bold text-red-700 block">Active Red Flags</span>
            <div className="text-2xl font-extrabold text-red-600 mt-0.5 flex items-center gap-2">
              <span>{redCount}</span>
              {redCount > 0 && <span className="text-xs font-normal text-red-600 animate-pulse">(Action Needed)</span>}
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-lg p-3.5 border border-amber-100">
            <span className="text-xs font-bold text-amber-800 block">Yellow Alerts</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{yellowCount}</div>
          </div>

          <div className="bg-emerald-50/60 rounded-lg p-3.5 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 block">Resolved</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{resolvedCount}</div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <span className="text-xs font-bold text-slate-600 block">Total Submissions</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{sortedSubmissions.length}</div>
          </div>
        </div>

      {/* Class Math Competency Performance Trends (Recharts Bar Chart) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Class Math Competency Performance Trends</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Real-time Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizes class mastery growth (%) over time across key Mathematics competencies.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTrendTimeframe('weekly')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  trendTimeframe === 'weekly'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTrendTimeframe('monthly')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  trendTimeframe === 'monthly'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTrendTimeframe('session')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  trendTimeframe === 'session'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Session
              </button>
            </div>

            {/* Layout type */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTrendChartType('grouped')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  trendChartType === 'grouped'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grouped
              </button>
              <button
                onClick={() => setTrendChartType('stacked')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  trendChartType === 'stacked'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stacked
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setShowTrendAnalytics(!showTrendAnalytics)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
              title={showTrendAnalytics ? 'Collapse Chart' : 'Expand Chart'}
            >
              {showTrendAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showTrendAnalytics && (
          <div className="space-y-4">
            {/* Competency Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Competency:
              </span>
              {[
                { id: 'all', label: 'All Competencies', color: 'bg-slate-700 text-white' },
                { id: 'dissimilarFractions', label: 'Dissimilar Fractions', color: 'bg-blue-600 text-white' },
                { id: 'decimalMultiplication', label: 'Decimal Multiplication', color: 'bg-emerald-600 text-white' },
                { id: 'volumeGeometry', label: 'Volume & Geometry', color: 'bg-amber-600 text-white' },
                { id: 'orderOfOperations', label: 'Order of Operations', color: 'bg-purple-600 text-white' },
                { id: 'equivalentFractions', label: 'Equivalent Fractions', color: 'bg-pink-600 text-white' },
              ].map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetencyFilter(comp.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-all shrink-0 ${
                    selectedCompetencyFilter === comp.id
                      ? `${comp.color} border-transparent shadow-2xs`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {comp.label}
                </button>
              ))}
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="w-full bg-slate-50/50 rounded-xl p-3 border border-slate-200/80">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activeTrendData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit="%"
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 min-w-[210px]">
                            <div className="font-bold border-b border-slate-700 pb-1 text-blue-300 flex items-center justify-between">
                              <span>{label}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Math Competencies</span>
                            </div>
                            {payload.map((entry: any, index: number) => (
                              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                                <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {entry.name}
                                </span>
                                <span className="font-extrabold text-white">{entry.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontWeight: 600 }}
                    iconType="circle"
                  />

                  {(selectedCompetencyFilter === 'all' || selectedCompetencyFilter === 'dissimilarFractions') && (
                    <Bar
                      dataKey="dissimilarFractions"
                      name="Dissimilar Fractions"
                      fill="#2563eb"
                      stackId={trendChartType === 'stacked' ? 'a' : undefined}
                      radius={trendChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    />
                  )}
                  {(selectedCompetencyFilter === 'all' || selectedCompetencyFilter === 'decimalMultiplication') && (
                    <Bar
                      dataKey="decimalMultiplication"
                      name="Decimal Multiplication"
                      fill="#10b981"
                      stackId={trendChartType === 'stacked' ? 'a' : undefined}
                      radius={trendChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    />
                  )}
                  {(selectedCompetencyFilter === 'all' || selectedCompetencyFilter === 'volumeGeometry') && (
                    <Bar
                      dataKey="volumeGeometry"
                      name="Volume & Geometry"
                      fill="#f59e0b"
                      stackId={trendChartType === 'stacked' ? 'a' : undefined}
                      radius={trendChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    />
                  )}
                  {(selectedCompetencyFilter === 'all' || selectedCompetencyFilter === 'orderOfOperations') && (
                    <Bar
                      dataKey="orderOfOperations"
                      name="Order of Operations"
                      fill="#8b5cf6"
                      stackId={trendChartType === 'stacked' ? 'a' : undefined}
                      radius={trendChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    />
                  )}
                  {(selectedCompetencyFilter === 'all' || selectedCompetencyFilter === 'equivalentFractions') && (
                    <Bar
                      dataKey="equivalentFractions"
                      name="Equivalent Fractions"
                      fill="#ec4899"
                      stackId={trendChartType === 'stacked' ? 'a' : undefined}
                      radius={trendChartType === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Growth Insight Bar */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="font-bold text-slate-800">
                  Highest Growth Competency:{' '}
                  <span className="text-blue-700">Dissimilar Fractions (+54% increase)</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 bg-white border border-blue-200 px-3 py-1 rounded-lg font-medium shadow-2xs">
                Class Average Mastery Score improved from <strong className="text-slate-900">45.6%</strong> to <strong className="text-emerald-700">89.4%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all border shrink-0 ${
              filterSeverity === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setFilterSeverity('red')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all border shrink-0 ${
              filterSeverity === 'red'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            Red Flags ({redCount})
          </button>
          <button
            onClick={() => setFilterSeverity('yellow')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all border shrink-0 ${
              filterSeverity === 'yellow'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Yellow Alerts ({yellowCount})
          </button>
          <button
            onClick={() => setFilterSeverity('resolved')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all border shrink-0 ${
              filterSeverity === 'resolved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>
      </div>

      {/* TABULAR RESULTS VIEW */}
      {dashboardViewMode === 'tabular' && (
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Table className="w-4.5 h-4.5 text-blue-600" />
                <span>Learner Results & Step-by-Step Solutions Table</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Displays tabular assessment scores, guided fill-in-the-blank accuracy, and scratchpad notes. Click "View Solutions" to expand step details.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg shrink-0">
              Showing {filteredSubmissions.length} of {submissions.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">Learner & Section</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Score & Flag Status</th>
                  <th className="py-3 px-4">Step-by-Step Solutions</th>
                  <th className="py-3 px-4">Scratchpad / Working Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No learner results found matching search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  consolidatedTabularGroups.map((group) => {
                    if (group.items.length === 0 && filterSeverity !== 'all') return null;

                    return (
                      <React.Fragment key={group.key}>
                        {/* Consolidated Group Header Row */}
                        <tr className={`${group.headerBg} border-y font-bold`}>
                          <td colSpan={6} className="py-2.5 px-4 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold tracking-tight">{group.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${group.badgeStyle}`}>
                                  {group.badge}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium opacity-80">{group.description}</span>
                            </div>
                          </td>
                        </tr>

                        {group.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-3 px-6 text-slate-400 italic text-[11px]">
                              No submissions currently recorded in this consolidated flag category.
                            </td>
                          </tr>
                        ) : (
                          group.items.map((sub) => {
                            const assessment = assessments.find((a) => a.id === sub.assessmentId);
                            const isExpanded = expandedRowId === sub.id;
                            const isSelected = selectedSubmissionId === sub.id;
                            const stepStats = calculateSubmissionStepStats(sub, assessment);

                            return (
                              <React.Fragment key={sub.id}>
                                <tr
                                  className={`hover:bg-slate-50/80 transition-colors ${
                                    isExpanded ? 'bg-blue-50/30' : isSelected ? 'bg-slate-50' : ''
                                  }`}
                                >
                                  {/* Learner Info */}
                                  <td className="py-3.5 px-4 font-sans">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={sub.avatar}
                                        alt={sub.studentName}
                                        className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                                      />
                                      <div>
                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{sub.studentName}</div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                          <span className="text-slate-900 font-bold">{sub.section}</span> • {sub.gradeLevel}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Assessment */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-slate-800">{assessment?.title || sub.subject}</div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                                    </div>
                                  </td>

                                  {/* Score & Flag Status */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-sm text-slate-900">{sub.score}%</span>
                                      {sub.status === 'resolved' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" /> Resolved
                                        </span>
                                      ) : sub.flagSeverity === 'red' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" /> Red Flag
                                        </span>
                                      ) : sub.flagSeverity === 'yellow' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" /> Yellow Alert
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          Mastered
                                        </span>
                                      )}
                                    </div>
                                  </td>

                          {/* Step-by-Step Solutions Progress */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-[170px]">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span>{stepStats.correctBlanks}/{stepStats.totalBlanks} Blanks</span>
                                <span className={stepStats.percent === 100 ? 'text-emerald-700' : 'text-blue-700'}>
                                  {stepStats.percent}% Accuracy
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    stepStats.percent === 100
                                      ? 'bg-emerald-500'
                                      : stepStats.percent >= 50
                                      ? 'bg-blue-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.max(stepStats.percent, 8)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Scratchpad Working Notes */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            {sub.answers.some((a) => a.workingNotes) ? (
                              <div className="text-[11px] text-slate-600 font-mono bg-slate-50 border border-slate-200 p-1.5 rounded line-clamp-2 italic">
                                "{sub.answers.find((a) => a.workingNotes)?.workingNotes}"
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No extra notes</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setExpandedRowId(isExpanded ? null : sub.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${
                                  isExpanded
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                <Footprints className="w-3.5 h-3.5" />
                                <span>{isExpanded ? 'Hide Solutions' : 'View Solutions'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedSubmissionId(sub.id);
                                  setDashboardViewMode('inspector');
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
                                title="Open in Inspector Panel"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded In-Line Drawer for Step-by-Step Solutions */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-b-2 border-blue-200">
                            <td colSpan={6} className="p-4 sm:p-6 space-y-4">
                              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                  <div className="flex items-center gap-2">
                                    <Footprints className="w-5 h-5 text-blue-600" />
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-sm">
                                        Step-by-Step Solution Breakdown for {sub.studentName}
                                      </h4>
                                      <p className="text-xs text-slate-500">
                                        Assessment: {assessment?.title} • Final Score: {sub.score}% • Grade {sub.gradeLevel}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedSubmissionId(sub.id);
                                        setDashboardViewMode('inspector');
                                      }}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                                      <span>Open Full Intervention Plan</span>
                                    </button>
                                    <button
                                      onClick={() => setExpandedRowId(null)}
                                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Question by Question Solutions List */}
                                <div className="space-y-4">
                                  {assessment?.questions.map((q, qIdx) => {
                                    const ansObj = sub.answers.find((a) => a.questionId === q.id);
                                    const isCorrect = ansObj?.isCorrect;

                                    return (
                                      <div
                                        key={q.id}
                                        className={`p-4 rounded-xl border text-xs space-y-3 ${
                                          isCorrect
                                            ? 'bg-emerald-50/30 border-emerald-200'
                                            : 'bg-red-50/30 border-red-200'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <span className="font-bold text-slate-500 text-[10px] uppercase block">
                                              Question {qIdx + 1} ({q.competency})
                                            </span>
                                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{q.text}</h5>
                                          </div>
                                          <div>
                                            {isCorrect ? (
                                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                              </span>
                                            ) : (
                                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                                                <X className="w-3.5 h-3.5" /> Incorrect
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Guided Fill-In-The-Blank Solutions Inspector */}
                                        <GuidedSolutionSteps
                                          question={q}
                                          userBlankAnswers={ansObj?.guidedStepAnswers || {}}
                                          isReadOnly={true}
                                          showValidation={true}
                                          title={`Question ${qIdx + 1} Guided Solution Framework`}
                                          subtitle="Student filled-in blank values compared with canonical solution:"
                                        />

                                        {/* Scratchpad Working Notes */}
                                        {ansObj?.workingNotes && (
                                          <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800">
                                            <span className="font-bold text-slate-600 block text-[10px] uppercase">
                                              Student Scratchpad / Calculation Notes:
                                            </span>
                                            <p className="font-mono text-xs text-slate-800 mt-0.5">
                                              "{ansObj.workingNotes}"
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEARNER ROSTER & ENCODING VIEW */}
      {dashboardViewMode === 'roster' && (
        <div className="space-y-6">
          {/* Encoding Header & Form */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Learner Registration & Roster Module
                  </span>
                  <span className="text-xs text-slate-500">DepEd SDO Learner Verification</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <span>Enrollment of Learner & Roster Management</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enroll learner profiles into the SDO Roster. <strong className="text-red-700">Learners enrolled here can immediately take and submit assessments in the Learner Kiosk.</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Batch CSV Import</span>
                </button>
              </div>
            </div>

            {/* Encode New Learner Form */}
            <form onSubmit={handleEncodeSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Enroll New Learner</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                    Learner Reference No. (LRN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 109823451211"
                    value={newLrn}
                    onChange={(e) => setNewLrn(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                    Learner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">
                    Grade Level / Section *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 5 - Section A"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll Learner</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Registered Learners Roster Table & Search/Filtering Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Registered Roster</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {filteredRegisteredLearners.length} of {registeredLearners.length} Registered
                  </span>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Grade Level Dropdown Filter */}
                  <div className="flex items-center gap-1.5 min-w-[160px]">
                    <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <select
                      value={rosterGradeFilter}
                      onChange={(e) => setRosterGradeFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    >
                      <option value="all">All Grade Levels</option>
                      {availableGradeLevels.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name / LRN / Section Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search student name, LRN, section..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 font-medium shadow-2xs"
                    />
                    {rosterSearch && (
                      <button
                        onClick={() => setRosterSearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        title="Clear search text"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Reset Filter Button */}
                  {(rosterSearch || rosterGradeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setRosterSearch('');
                        setRosterGradeFilter('all');
                      }}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 justify-center"
                      title="Reset roster filters"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                      <th className="py-3 px-4">LRN</th>
                      <th className="py-3 px-4">Learner Full Name</th>
                      <th className="py-3 px-4">Section & Grade</th>
                      <th className="py-3 px-4">School</th>
                      <th className="py-3 px-4">Kiosk Assessment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredRegisteredLearners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No registered learners found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRegisteredLearners.map((learner) => {
                        const isEditing = editingLearnerId === learner.id;

                        return (
                          <tr key={learner.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editLrn}
                                  onChange={(e) => setEditLrn(e.target.value)}
                                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                                />
                              ) : (
                                learner.lrn
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                                />
                              ) : (
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">{learner.name}</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editSection}
                                  onChange={(e) => setEditSection(e.target.value)}
                                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                                />
                              ) : (
                                <span className="font-semibold text-slate-700">{learner.section} ({learner.gradeLevel})</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-slate-600">{learner.schoolName}</td>

                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified & Enabled</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <button
                                    onClick={() => handleSaveEdit(learner.id)}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                                  >
                                    Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStartEdit(learner)}
                                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                    title="Edit Learner Profile"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => onDeleteLearner(learner.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Remove Learner from Roster"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT INSPECTOR VIEW */}
      {dashboardViewMode === 'inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Submissions Stream */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Submissions Stream ({filteredSubmissions.length})</span>
              </h3>
              <span className="text-xs text-slate-500">Select learner to inspect</span>
            </div>

          {/* Submission Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                No submissions found matching filter.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = sub.id === selectedSubmission?.id;
                const minutesAgo = getMinutesElapsed(sub.submittedAt);

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmissionId(sub.id);
                      setAiPlanResult(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : sub.flagSeverity === 'red' && sub.status !== 'resolved'
                        ? 'bg-red-50/40 border-red-200 hover:border-red-400'
                        : sub.flagSeverity === 'yellow' && sub.status !== 'resolved'
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Visual Bar for Unresolved Red Flags */}
                    {sub.flagSeverity === 'red' && sub.status === 'pending_intervention' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.avatar}
                          alt={sub.studentName}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sub.studentName}</h4>
                          <span className="text-[11px] text-slate-500">{sub.section}</span>
                        </div>
                      </div>

                      {/* Flag Badge */}
                      <div>
                        {sub.status === 'resolved' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        ) : sub.flagSeverity === 'red' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> RED FLAG
                          </span>
                        ) : sub.flagSeverity === 'yellow' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> MODERATE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Normal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quiz & Score summary row */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium truncate max-w-[180px]">
                        {sub.flaggedCompetencies?.length ? sub.flaggedCompetencies.join(', ') : sub.assessmentTitle || sub.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sub.score}% Score</span>
                        <span className="text-[10px] text-slate-400">({minutesAgo}m ago)</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Student Flag & Early Intervention Action Center */}
        <div className="lg:col-span-7">
          {selectedSubmission ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
              {/* Header Inspector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSubmission.avatar}
                    alt={selectedSubmission.studentName}
                    className="w-11 h-11 rounded-full border border-blue-200 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{selectedSubmission.studentName}</h3>
                      <span className="text-xs text-slate-500">({selectedSubmission.section})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Assessment: <span className="font-semibold text-blue-700">{selectedSubmission.assessmentTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Score & Response Time Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Score</span>
                    <span
                      className={`text-2xl font-extrabold ${
                        selectedSubmission.score < 50
                          ? 'text-red-600'
                          : selectedSubmission.score < 75
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedSubmission.score}%
                    </span>
                  </div>

                  {selectedSubmission.flaggedAt && (
                    <div className="bg-slate-50 p-2 px-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Elapsed</span>
                      <span className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {getMinutesElapsed(selectedSubmission.flaggedAt)} m
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Missed Competencies List */}
              {selectedSubmission.flaggedCompetencies.length > 0 && (
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Missed Competencies Requiring Intervention:</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSubmission.flaggedCompetencies.map((comp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-lg border border-red-200"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Early Intervention Triage Generator Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 rounded-xl p-4 sm:p-5 text-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Gemini AI Early Intervention Assistant
                    </h4>
                  </div>

                  <button
                    onClick={() => fetchAiInterventionPlan(selectedSubmission)}
                    disabled={aiPlanLoading}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {aiPlanLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-blue-200" />
                        <span>Generate AI Plan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Generated Plan Output Box */}
                {aiPlanResult && (
                  <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3 text-xs text-slate-700 shadow-sm">
                    <div>
                      <span className="font-bold text-blue-800 block uppercase text-[10px]">
                        Misconception Diagnosis:
                      </span>
                      <p className="mt-0.5 text-slate-800 leading-relaxed">{aiPlanResult.diagnosisSummary}</p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-800 block uppercase text-[10px]">
                        Recommended Strategy:
                      </span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">
                        {aiPlanResult.recommendedToolkitTitle}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Required Materials:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiPlanResult.materialsNeeded?.map((mat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px]"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Guided Routine Steps:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-700 leading-relaxed">
                        {aiPlanResult.guidedSteps?.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {aiPlanResult.encouragementQuote && (
                      <div className="italic text-blue-700 pt-2 border-t border-slate-100">
                        &quot;{aiPlanResult.encouragementQuote}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Intervention Toolkit Quick Assignment */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Assign Routine from Toolkit:
                  </h4>
                  <button
                    onClick={onOpenToolkit}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View All ({toolkit.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {toolkit.map((strat) => {
                    const isAssigned = selectedSubmission.assignedInterventionId === strat.id;
                    return (
                      <div
                        key={strat.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                          isAssigned
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/20'
                            : 'bg-slate-50/60 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-slate-900">{strat.title}</h5>
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white text-slate-600 border border-slate-200 rounded shrink-0">
                            {strat.durationMinutes}m
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 text-[11px]">{strat.description}</p>

                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-blue-700 font-bold">
                            {strat.toolkitCategory}
                          </span>
                          <button
                            onClick={() =>
                              onAssignIntervention(
                                selectedSubmission.id,
                                strat.id,
                                `Assigned ${strat.title}`
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isAssigned
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {isAssigned ? 'Assigned' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learner's Recorded Working & Solution Steps Inspector */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-blue-600" />
                    <span>Learner&apos;s Recorded Solution Steps & Working</span>
                  </h4>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {selectedSubmission.answers.length} Questions Answered
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedSubmission.answers.map((ans, idx) => {
                    const assessment = assessments.find((a) => a.id === selectedSubmission.assessmentId);
                    const question = assessment?.questions.find((q) => q.id === ans.questionId);

                    return (
                      <div
                        key={ans.questionId}
                        className={`p-3 rounded-xl border text-xs space-y-2 ${
                          ans.isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-red-50/50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Q{idx + 1}: {question?.text || ans.questionId}
                            </span>
                            <span className="text-[10px] font-semibold text-blue-700">
                              Competency: {question?.competency}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              ans.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ans.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        {/* Working Notes or Steps Checklist */}
                        {ans.workingNotes || (ans.selectedSteps && ans.selectedSteps.length > 0) ? (
                          <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Learner Scratchpad & Steps Performed:</span>
                            </span>

                            {ans.workingNotes && (
                              <p className="text-[11px] font-mono bg-blue-50/70 p-2 rounded border border-blue-100 text-blue-950">
                                &quot;{ans.workingNotes}&quot;
                              </p>
                            )}

                            {ans.selectedSteps && ans.selectedSteps.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {ans.selectedSteps.map((step, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-medium flex items-center gap-1 border border-blue-200"
                                  >
                                    <CheckSquare className="w-3 h-3 text-blue-600" />
                                    <span>{step}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            No scratchpad notes recorded by student for this question.
                          </p>
                        )}

                        {/* Guided Fill-in-the-Blank Solution Inspector */}
                        {question && (
                          <div className="pt-1">
                            <GuidedSolutionSteps
                              question={question}
                              userBlankAnswers={ans.guidedStepAnswers || {}}
                              isReadOnly={true}
                              showValidation={true}
                              title="Guided Solution Framework Inspector"
                              subtitle="Student filled-in blank values:"
                            />
                          </div>
                        )}
                        {question?.solutionSteps && question.solutionSteps.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Expected Solution Steps:
                            </span>
                            <div className="space-y-1">
                              {question.solutionSteps.map((sStep, sIdx) => (
                                <div key={sIdx} className="text-[11px] text-slate-700 bg-white/70 p-1.5 rounded border border-slate-200/60">
                                  {sStep}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Status:{' '}
                  <span className="font-bold uppercase text-slate-800">
                    {selectedSubmission.status.replace('_', ' ')}
                  </span>
                </span>

                {selectedSubmission.status !== 'resolved' ? (
                  <button
                    onClick={() => onResolveSubmission(selectedSubmission.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Intervention Resolved</span>
                  </button>
                ) : (
                  <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Intervention Resolved & Mastered</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center text-slate-500 text-xs">
              Select a learner from the list to view details and assign early intervention.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Modal: Generate Custom AI Assessment */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Generate Custom AI Assessment</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Generates a 4-question short competency check tailored for struggling learners.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value="Mathematics"
                  readOnly
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-lg p-2.5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Grade Level</label>
                <input
                  type="text"
                  value={aiGrade}
                  onChange={(e) => setAiGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Competency Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Addition with Regrouping, Short Vowel E"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomQuiz}
                disabled={isGeneratingQuiz}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Create Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload & Create Test Questions */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 shadow-2xl rounded-2xl border border-slate-200 space-y-4 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <UploadCloud className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Upload Test Questions</h3>
                  <p className="text-xs text-slate-500">Import questions from JSON/CSV files or build a custom test item.</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setUploadTab('file')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  uploadTab === 'file'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Upload File (Excel .xlsx / .csv / JSON)</span>
              </button>

              <button
                onClick={() => setUploadTab('builder')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  uploadTab === 'builder'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Test Question Builder</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD (EXCEL / CSV / JSON) */}
            {uploadTab === 'file' && (
              <div className="space-y-4 text-xs">
                {/* File Dropzone & Template Download */}
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl p-5 text-center space-y-3">
                  <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Select or Drag & Drop Test Question File</span>
                    <span className="text-slate-500 text-[11px]">Supports Excel (.xlsx / .csv) and .json formats with question text, options, correct answer index, & competencies</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-all inline-flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      <span>Browse Excel / CSV Files</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleDownloadSampleExcel}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                      <span>Download Excel Sample Template</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>JSON Sample</span>
                    </button>
                  </div>

                  {uploadFileName && (
                    <div className="bg-white border border-emerald-200 p-2 rounded-lg inline-flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>File Selected: {uploadFileName}</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Parsed Preview */}
                {parsedQuestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Parsed Questions Preview ({parsedQuestions.length} Found)</span>
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                      {parsedQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">Q{idx + 1}: {q.text}</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                              {q.competency}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Options: {q.options.join(', ')} | Correct Answer: Option #{q.correctOptionIndex + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Assessment Assignment */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-800">Target Assessment</label>
                  <select
                    value={targetAssessmentChoice}
                    onChange={(e) => setTargetAssessmentChoice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium"
                  >
                    <option value="new">+ Create New Assessment with Uploaded Questions</option>
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        Append to: {a.title} ({a.questions.length} existing Qs)
                      </option>
                    ))}
                  </select>

                  {targetAssessmentChoice === 'new' && (
                    <input
                      type="text"
                      value={newAssessmentTitle}
                      onChange={(e) => setNewAssessmentTitle(e.target.value)}
                      placeholder="Enter New Assessment Title (e.g. Grade 5 Math: Dissimilar Fractions Quiz)"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUploadedFileQuestions}
                    disabled={parsedQuestions.length === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Confirm & Upload Questions ({parsedQuestions.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL QUESTION BUILDER */}
            {uploadTab === 'builder' && (
              <form onSubmit={handleSaveManualBuilderQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Question Text *</label>
                  <input
                    type="text"
                    required
                    value={builderQuestionText}
                    onChange={(e) => setBuilderQuestionText(e.target.value)}
                    placeholder="e.g., What is 3/8 + 1/2 in simplest form?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Math Competency Topic</label>
                    <input
                      type="text"
                      value={builderCompetency}
                      onChange={(e) => setBuilderCompetency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Grade Level</label>
                    <select
                      value={builderGrade}
                      onChange={(e) => setBuilderGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900"
                    >
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Reading Aid / Clue Prompt (Optional)</label>
                  <input
                    type="text"
                    value={builderReadingAid}
                    onChange={(e) => setBuilderReadingAid(e.target.value)}
                    placeholder="e.g. Find the LCD of 8 and 2 first."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>

                {/* Multiple Choice Options */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Multiple Choice Options (Select Correct Answer)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {builderOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={builderCorrectIndex === idx}
                          onChange={() => setBuilderCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...builderOptions];
                            newOpts[idx] = e.target.value;
                            setBuilderOptions(newOpts);
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guided Solution Step Blank Builder */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-blue-600" />
                    <span>Guided Solution Framework Step Blank</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Step Title</label>
                      <input
                        type="text"
                        value={builderGuidedStepTitle}
                        onChange={(e) => setBuilderGuidedStepTitle(e.target.value)}
                        placeholder="e.g. Find LCD"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Prefix Text</label>
                      <input
                        type="text"
                        value={builderBlankPrefix}
                        onChange={(e) => setBuilderBlankPrefix(e.target.value)}
                        placeholder="e.g. LCD = "
                        className="w-full bg-white border border-slate-200 rounded p-1.5 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Correct Blank Value *</label>
                      <input
                        type="text"
                        value={builderBlankCorrectValue}
                        onChange={(e) => setBuilderBlankCorrectValue(e.target.value)}
                        placeholder="e.g. 8"
                        className="w-full bg-emerald-50 border border-emerald-300 rounded p-1.5 font-bold text-emerald-950"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Assessment Assignment */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-800">Target Assessment</label>
                  <select
                    value={targetAssessmentChoice}
                    onChange={(e) => setTargetAssessmentChoice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium"
                  >
                    <option value="new">+ Create New Assessment with Created Question</option>
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        Append to: {a.title} ({a.questions.length} existing Qs)
                      </option>
                    ))}
                  </select>

                  {targetAssessmentChoice === 'new' && (
                    <input
                      type="text"
                      value={newAssessmentTitle}
                      onChange={(e) => setNewAssessmentTitle(e.target.value)}
                      placeholder="Enter Assessment Title"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-medium"
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save & Publish Question</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Batch CSV Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Batch Import Learners CSV</h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paste lines formatted as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">Learner Name, Section, LRN</code> below:
            </p>

            <textarea
              rows={6}
              value={batchCsvText}
              onChange={(e) => setBatchCsvText(e.target.value)}
              placeholder={`Carlo Mendoza, Grade 5 - Section A, 109823451201\nAlthea Bonifacio, Grade 5 - Section A, 109823451202\nJuan Dela Cruz, Grade 5 - Section B, 109823451209`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setBatchCsvText(
                    `Kenneth Aquino, Grade 5 - Section A, 109823451205\nJanelle Cruz, Grade 5 - Section B, 109823451206\nPaolo Garcia, Grade 5 - Section C, 109823451207`
                  )
                }
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Paste Sample Batch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchCsvSubmit}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Import Learners</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Tutor Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header Actions */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Class Assessment & Intervention Summary Report</h3>
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
                  onClick={handleExportTutorCSV}
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
              {/* Official Header */}
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Republic of the Philippines • Department of Education</p>
                <p className="text-[11px] font-semibold text-slate-600">Region V - Bicol • Schools Division Office of Ligao City</p>
                <h2 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">Tutor Class Assessment & Learner Progress Report</h2>
                <p className="text-xs font-medium text-slate-600">
                  School Profile: <strong className="text-slate-900">{activeTutor.schoolName}</strong> • Class Section: <strong className="text-slate-900">{activeTutor.section}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Assigned Tutor: <strong>{activeTutor.name}</strong> • Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Summary Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Registered Learners</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{tutorClassRegisteredLearners.length}</span>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 block">Total Submissions</span>
                  <span className="text-xl font-extrabold text-blue-900 mt-0.5 block">{sortedSubmissions.length}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 block">Red Flags (Critical)</span>
                  <span className="text-xl font-extrabold text-red-900 mt-0.5 block">{redCount}</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 block">Yellow Flags (Warning)</span>
                  <span className="text-xl font-extrabold text-amber-900 mt-0.5 block">{yellowCount}</span>
                </div>
              </div>

              {/* Submissions Detail Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Learner Assessment Results Breakdown</h4>
                {sortedSubmissions.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                    No assessment submissions currently recorded for {activeTutor.schoolName}.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Learner Name</th>
                          <th className="p-2.5">Grade / Section</th>
                          <th className="p-2.5">Assessment Title</th>
                          <th className="p-2.5">Score</th>
                          <th className="p-2.5">Mastery %</th>
                          <th className="p-2.5">Flag Severity</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {sortedSubmissions.map((sub) => {
                          const pct = Math.round((sub.score / (sub.totalQuestions || 1)) * 100);
                          return (
                            <tr key={sub.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900">{sub.studentName}</td>
                              <td className="p-2.5 font-mono text-[11px]">{sub.section}</td>
                              <td className="p-2.5">{sub.assessmentTitle}</td>
                              <td className="p-2.5 font-bold">{sub.score} / {sub.totalQuestions}</td>
                              <td className="p-2.5 font-bold">{pct}%</td>
                              <td className="p-2.5">
                                {sub.flagSeverity === 'red' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">RED FLAG</span>
                                ) : sub.flagSeverity === 'yellow' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">YELLOW FLAG</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">NORMAL</span>
                                )}
                              </td>
                              <td className="p-2.5 text-[11px] capitalize">{sub.status.replace('_', ' ')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Prepared By:</p>
                  <div className="mt-8 border-b border-slate-900 w-48 font-bold text-slate-900">{activeTutor.name}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Assigned Reading & Math Tutor</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Verified & Approved By:</p>
                  <div className="mt-8 border-b border-slate-900 w-52 font-extrabold text-slate-900 uppercase">
                    {INITIAL_SCHOOL_HEAD_ACCOUNTS.find(h => h.schoolName.toLowerCase().trim() === activeTutor.schoolName.toLowerCase().trim())?.name || 'School Principal'}
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 mt-1">School Principal / School Head</p>
                  <p className="text-[10px] text-slate-500">{activeTutor.schoolName}</p>
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
