import React, { useState, useEffect, useMemo } from 'react';
import { Assessment, Question, Submission, StudentAnswer, RegisteredLearner } from '../types';
import { LIGAO_ELEMENTARY_SCHOOLS } from '../data/mockData';
import { GuidedSolutionSteps } from './GuidedSolutionSteps';
import {
  Volume2,
  VolumeX,
  AArrowUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Languages,
  Award,
  Footprints,
  FileText,
  AlertCircle,
  CheckSquare,
  BookOpen,
  Check,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearnerScreenProps {
  assessments: Assessment[];
  registeredLearners: RegisteredLearner[];
  onSubmitAssessment: (submission: Omit<Submission, 'id'>) => void;
}

export const LearnerScreen: React.FC<LearnerScreenProps> = ({
  assessments,
  registeredLearners,
  onSubmitAssessment,
}) => {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [userWorkingNotes, setUserWorkingNotes] = useState<Record<string, string>>({});
  const [userSelectedSteps, setUserSelectedSteps] = useState<Record<string, string[]>>({});
  const [userBlankAnswers, setUserBlankAnswers] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showReadingAid, setShowReadingAid] = useState<boolean>(true);
  const defaultSchool = registeredLearners[0]?.schoolName || LIGAO_ELEMENTARY_SCHOOLS[0] || 'PINIT ELEMENTARY SCHOOL';
  const [studentSchoolName, setStudentSchoolName] = useState<string>(defaultSchool);
  const [studentGradeSection, setStudentGradeSection] = useState<string>(registeredLearners[0]?.section || '');
  const [studentNameInput, setStudentNameInput] = useState<string>(registeredLearners[0]?.name || '');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Learners matching the selected school
  const schoolRegisteredLearners = useMemo(() => {
    const selClean = studentSchoolName.trim().toLowerCase();
    const matching = registeredLearners.filter(
      (l) =>
        !l.schoolName ||
        l.schoolName.trim().toLowerCase() === selClean ||
        selClean.includes(l.schoolName.trim().toLowerCase()) ||
        l.schoolName.trim().toLowerCase().includes(selClean)
    );
    return matching.length > 0 ? matching : [];
  }, [registeredLearners, studentSchoolName]);

  // Distinct Grade Levels / Sections enrolled in the selected school
  const availableSectionsForSchool = useMemo(() => {
    const sections = Array.from(
      new Set(
        schoolRegisteredLearners
          .map((l) => l.section)
          .filter((sec): sec is string => Boolean(sec && sec.trim()))
      )
    );
    return sections;
  }, [schoolRegisteredLearners]);

  // Learners matching both the selected school AND selected section
  const sectionRegisteredLearners = useMemo(() => {
    if (!studentGradeSection) return schoolRegisteredLearners;
    const secClean = studentGradeSection.trim().toLowerCase();
    const matching = schoolRegisteredLearners.filter(
      (l) =>
        l.section.trim().toLowerCase() === secClean ||
        secClean.includes(l.section.trim().toLowerCase()) ||
        l.section.trim().toLowerCase().includes(secClean)
    );
    return matching.length > 0 ? matching : schoolRegisteredLearners;
  }, [schoolRegisteredLearners, studentGradeSection]);

  // Handle learner selection from dropdown
  const handleLearnerSelect = (learnerName: string) => {
    setStudentNameInput(learnerName);
    const learnerObj = registeredLearners.find(
      (l) => l.name.trim().toLowerCase() === learnerName.trim().toLowerCase()
    );
    if (learnerObj) {
      if (learnerObj.section) setStudentGradeSection(learnerObj.section);
      if (learnerObj.schoolName) setStudentSchoolName(learnerObj.schoolName);
    }
  };

  // Handle section dropdown selection
  const handleSectionSelect = (sectionName: string) => {
    setStudentGradeSection(sectionName);
    const secClean = sectionName.trim().toLowerCase();
    const matching = schoolRegisteredLearners.filter(
      (l) =>
        l.section.trim().toLowerCase() === secClean ||
        secClean.includes(l.section.trim().toLowerCase()) ||
        l.section.trim().toLowerCase().includes(secClean)
    );
    if (matching.length > 0) {
      setStudentNameInput(matching[0].name);
    }
  };

  // Handle school dropdown selection
  const handleSchoolSelect = (schoolName: string) => {
    setStudentSchoolName(schoolName);
    const selClean = schoolName.trim().toLowerCase();
    const matching = registeredLearners.filter(
      (l) =>
        !l.schoolName ||
        l.schoolName.trim().toLowerCase() === selClean ||
        selClean.includes(l.schoolName.trim().toLowerCase()) ||
        l.schoolName.trim().toLowerCase().includes(selClean)
    );
    if (matching.length > 0) {
      setStudentGradeSection(matching[0].section);
      setStudentNameInput(matching[0].name);
    } else {
      setStudentGradeSection('');
      setStudentNameInput('');
    }
  };

  // Helper to retrieve or format Tagalog version of the question
  const getTagalogVersion = (q?: Question): string | null => {
    if (!q) return null;
    let tagalog = q.tagalogText;

    if (!tagalog) {
      const text = q.text;
      const lower = text.toLowerCase();
      if (lower.startsWith('what is ')) {
        tagalog = text.replace(/what is /i, 'Ano ang ');
      } else if (lower.startsWith('subtract ')) {
        tagalog = text.replace(/subtract /i, 'I-subtrakt ang ').replace(/what is the difference\?/i, 'Ano ang kaibahan?');
      } else if (lower.startsWith('evaluate: ')) {
        tagalog = text.replace(/evaluate: /i, 'Kukwentahin: ');
      } else if (lower.startsWith('simplify ')) {
        tagalog = text.replace(/simplify /i, 'I-simplify ');
      } else if (lower.includes('in the expression')) {
        tagalog = text
          .replace(/in the expression/i, 'Sa ekspresyong')
          .replace(/which operation must be done first\?/i, 'aling operasyon ang dapat unahing gawin?');
      } else {
        tagalog = text;
      }
    }

    return `(${tagalog})`;
  };

  // Registration verification check against registeredLearners roster
  const matchedLearner = registeredLearners.find(
    (l) =>
      l.name.trim().toLowerCase() === studentNameInput.trim().toLowerCase() &&
      (l.section.trim().toLowerCase() === studentGradeSection.trim().toLowerCase() ||
        studentGradeSection.trim().toLowerCase().includes(l.section.trim().toLowerCase())) &&
      (l.schoolName.trim().toLowerCase() === studentSchoolName.trim().toLowerCase() ||
        studentSchoolName.trim().toLowerCase().includes(l.schoolName.trim().toLowerCase()))
  );
  const isRegistered = Boolean(matchedLearner);

  const activeAssessment =
    assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];

  useEffect(() => {
    setUserAnswers({});
    setUserWorkingNotes({});
    setUserSelectedSteps({});
    setUserBlankAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setLatestSubmission(null);
    if (activeAssessment) {
      setTimeRemainingSeconds(activeAssessment.timeLimitMinutes * 60);
    }
  }, [selectedAssessmentId, activeAssessment, studentNameInput, studentSchoolName, studentGradeSection]);

  // Timer effect
  useEffect(() => {
    if (isSubmitted || !isRegistered || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, isRegistered, timeRemainingSeconds]);

  const currentQuestion = activeAssessment?.questions[currentQuestionIndex];

  // Helper to format math text & fractions into clear spoken words for SpeechSynthesis
  const formatTextForSpeech = (rawText: string): string => {
    if (!rawText) return '';

    const numberToWords: Record<number, string> = {
      0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
      5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
      10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen',
      14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen',
      18: 'eighteen', 19: 'nineteen', 20: 'twenty'
    };

    const denominatorSingular: Record<number, string> = {
      2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth',
      6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth',
      10: 'tenth', 12: 'twelfth', 16: 'sixteenth', 20: 'twentieth'
    };

    const denominatorPlural: Record<number, string> = {
      2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths',
      6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths',
      10: 'tenths', 12: 'twelfths', 16: 'sixteenths', 20: 'twentieths'
    };

    // Replace fractions like 1/3 or 1 / 3 -> "one third", 2/3 -> "two thirds"
    let formatted = rawText.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_, numStr, denStr) => {
      const num = parseInt(numStr, 10);
      const den = parseInt(denStr, 10);

      const numWord = numberToWords[num] || numStr;
      if (num === 1) {
        const denWord = denominatorSingular[den] || `${den}th`;
        return `${numWord} ${denWord}`;
      } else {
        const denWord = denominatorPlural[den] || `${den}ths`;
        return `${numWord} ${denWord}`;
      }
    });

    // Replace any remaining standalone slash with "over"
    formatted = formatted.replace(/\s*\/\s*/g, ' over ');

    // Replace mathematical operators with spoken words
    formatted = formatted
      .replace(/\s*\+\s*/g, ' plus ')
      .replace(/\s*[-−]\s*/g, ' minus ')
      .replace(/\s*=\s*/g, ' equals ')
      .replace(/\s*[×*]\s*/g, ' times ');

    return formatted;
  };

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const spokenText = formatTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.85; // Slightly slower for primary learners
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted || !isRegistered) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleToggleStep = (questionId: string, stepText: string) => {
    if (isSubmitted || !isRegistered) return;
    setUserSelectedSteps((prev) => {
      const currentList = prev[questionId] || [];
      const updated = currentList.includes(stepText)
        ? currentList.filter((s) => s !== stepText)
        : [...currentList, stepText];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleUpdateNotes = (questionId: string, text: string) => {
    if (isSubmitted || !isRegistered) return;
    setUserWorkingNotes((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleUpdateBlankAnswer = (questionId: string, blankId: string, value: string) => {
    if (isSubmitted || !isRegistered) return;
    setUserBlankAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [blankId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (!activeAssessment || !isRegistered) return;

    let correctCount = 0;
    const studentAnswers: StudentAnswer[] = activeAssessment.questions.map((q) => {
      const selected = userAnswers[q.id] ?? -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds: 25,
        workingNotes: userWorkingNotes[q.id] || '',
        selectedSteps: userSelectedSteps[q.id] || [],
        guidedStepAnswers: userBlankAnswers[q.id] || {},
      };
    });

    const totalQuestions = activeAssessment.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Determine flag severity based on competency score
    let flagSeverity: 'red' | 'yellow' | 'none' = 'none';
    if (scorePercentage < 50) {
      flagSeverity = 'red';
    } else if (scorePercentage < 75) {
      flagSeverity = 'yellow';
    }

    // Collect missed competencies
    const flaggedCompetencies = activeAssessment.questions
      .filter((q) => (userAnswers[q.id] ?? -1) !== q.correctAnswer)
      .map((q) => q.competency);

    const submissionData: Omit<Submission, 'id'> = {
      studentId: matchedLearner ? matchedLearner.id : `stu-${Date.now().toString().slice(-4)}`,
      studentName: studentNameInput || 'Learner',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
      section: studentGradeSection,
      gradeLevel: studentGradeSection.startsWith('Grade') ? studentGradeSection.split('-')[0].trim() : activeAssessment.gradeLevel,
      schoolName: studentSchoolName || 'Rizal Elementary School',
      sdoName: 'SDO Pasig City',
      assessmentId: activeAssessment.id,
      assessmentTitle: activeAssessment.title,
      subject: activeAssessment.subject,
      type: activeAssessment.type,
      score: scorePercentage,
      totalQuestions,
      correctCount,
      submittedAt: new Date().toISOString(),
      answers: studentAnswers,
      flagSeverity,
      flaggedCompetencies,
      status: flagSeverity === 'none' ? 'normal' : 'pending_intervention',
      flaggedAt: flagSeverity !== 'none' ? new Date().toISOString() : undefined,
    };

    onSubmitAssessment(submissionData);
    setIsSubmitted(true);
    setLatestSubmission({ ...submissionData, id: `sub-${Date.now()}` });

    if (scorePercentage >= 75) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-normal';
    }
  };

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-sm text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                SDO Ligao City Student Kiosk
              </span>
             </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">{activeAssessment?.title}</h2>
          </div>

          {/* School Name, Grade Level / Section, and Learner Name Dropdown Selectors */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* School Name Droplist */}
            <div className="text-xs">
              <label className="block text-slate-500 font-bold text-[10px] uppercase mb-0.5">School Name</label>
              <select
                value={studentSchoolName}
                onChange={(e) => handleSchoolSelect(e.target.value)}
                disabled={isSubmitted}
                className="bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium max-w-[200px] truncate"
              >
                {LIGAO_ELEMENTARY_SCHOOLS.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level / Section Dropdown */}
            <div className="text-xs">
              <label className="block text-slate-500 font-bold text-[10px] uppercase mb-0.5">Grade Level / Section</label>
              <select
                value={studentGradeSection}
                onChange={(e) => handleSectionSelect(e.target.value)}
                disabled={isSubmitted}
                className="bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold max-w-[180px] truncate"
              >
                {availableSectionsForSchool.length === 0 ? (
                  <option value={studentGradeSection}>{studentGradeSection || 'No Enrolled Sections'}</option>
                ) : (
                  availableSectionsForSchool.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Learner's Name Droplist */}
            <div className="text-xs">
              <label className="block text-slate-500 font-bold text-[10px] uppercase mb-0.5">Learner's Name</label>
              <select
                value={studentNameInput}
                onChange={(e) => handleLearnerSelect(e.target.value)}
                disabled={isSubmitted}
                className="bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold max-w-[200px] truncate"
              >
                {sectionRegisteredLearners.length === 0 ? (
                  <option value="">No registered learners for section</option>
                ) : (
                  sectionRegisteredLearners.map((learner) => (
                    <option key={learner.id} value={learner.name}>
                      {learner.name} (LRN: {learner.lrn})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Live Verification Badge */}
            <div className="text-xs pt-1 sm:pt-4">
              {isRegistered ? (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified (LRN: {matchedLearner?.lrn})</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 shadow-2xs">
                  <UserX className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Unregistered</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Unregistered Alert Banner */}
        {!isRegistered && (
          <div className="mt-4 bg-red-50/90 border-2 border-red-300 rounded-xl p-4 text-slate-900 text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-sm text-red-800">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>ACCESS RESTRICTED: Learner Not Registered in Roster</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-900 border border-red-300">
                Action Required by Tutor
              </span>
            </div>
            <p className="font-medium text-slate-700 leading-relaxed">
              Learner <strong className="text-red-900 font-extrabold">"{studentNameInput}"</strong> in section <strong className="text-red-900 font-extrabold">"{studentGradeSection}"</strong> is <strong>not registered</strong> in the DepEd SDO Learner Roster. Unregistered learners <strong>cannot take or submit assessments</strong>.
            </p>
            <div className="bg-white border border-red-200 rounded-lg p-2.5 text-[11px] text-slate-600 font-medium flex items-center justify-between gap-2">
              <span>Please ask your Tutor to encode your name and section in the Tutor Dashboard Learner Roster before proceeding.</span>
              <span className="font-bold text-red-700 shrink-0">Assessment Locked 🔒</span>
            </div>
          </div>
        )}

        {/* Accessibility Toolbar for Reading Accommodations */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-xs">Accommodations:</span>
            <button
              onClick={() =>
                setFontSize((prev) => (prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal'))
              }
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1.5 text-slate-800 text-xs font-bold transition-all"
              title="Adjust Font Size for Low Vision Readers"
            >
              <AArrowUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Text Size: {fontSize.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setShowReadingAid((prev) => !prev)}
              className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all ${
                showReadingAid
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Prompts {showReadingAid ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Quiz Selector */}
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {assessments.map((a) => {
                const comps = Array.from(new Set(a.questions?.map((q) => q.competency).filter(Boolean)));
                const compName = comps.length > 0 ? comps.join(', ') : a.title.replace(/^Grade \d+ Math:\s*/i, '');
                return (
                  <option key={a.id} value={a.id}>
                    {compName} ({a.type === 'pre_session' ? 'Pre-Check' : 'Post-Check'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tablet Quiz View OR Post-Submission Mastery Report */}
      {!isSubmitted ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Question {currentQuestionIndex + 1} of {activeAssessment?.questions.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Competency: {currentQuestion?.competency}</span>
            </div>
          </div>

          {/* Question Text & Audio Read Aloud */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                {/* English Question */}
                <h3 className={`font-semibold text-slate-900 ${getFontSizeClass()}`}>
                  {currentQuestion?.text}
                </h3>

                {/* Translated Tagalog Version directly below the English question */}
                {currentQuestion && (
                  <p className={`font-medium text-blue-900 italic ${getFontSizeClass()}`}>
                    {getTagalogVersion(currentQuestion)}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  speakText(
                    `${currentQuestion?.text}. Options are: ${currentQuestion?.options.join(', ')}`
                  )
                }
                className={`p-3 rounded-full shrink-0 transition-transform active:scale-95 ${
                  isSpeaking
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
                title="Click to Listen (Audio Read-Aloud Accommodation)"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Reading Aid / Prompt Box */}
            {showReadingAid && currentQuestion?.readingAidText && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 uppercase text-[10px] block">Reading Prompt:</span>
                  <span className="italic mt-0.5 block text-amber-800">{currentQuestion.readingAidText}</span>
                </div>
              </div>
            )}
          </div>

          {/* Touch-Friendly Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {currentQuestion?.options.map((optionText, optIdx) => {
              const isSelected = userAnswers[currentQuestion.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`min-h-[60px] p-4 rounded-xl text-left font-medium text-sm transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 font-bold text-xs rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className={getFontSizeClass()}>{optionText}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Guided Fill-In-The-Blank Solution Framework & Working Scratchpad */}
          {currentQuestion && (
            <div className="mt-6 space-y-4">
              <GuidedSolutionSteps
                question={currentQuestion}
                userBlankAnswers={userBlankAnswers[currentQuestion.id] || {}}
                onChangeBlankAnswer={(blankId, val) =>
                  handleUpdateBlankAnswer(currentQuestion.id, blankId, val)
                }
                title="Guided Solution Framework (Fill in the blanks)"
                subtitle="The solution framework is provided below. Complete the missing values or steps as you solve:"
                hideNotificationBadges={true}
                isLearnerDashboard={true}
              />

              {/* Extra Scratchpad Text Note */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Additional Working Notes / Scratchpad:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional extra calculations</span>
                </label>
                <textarea
                  rows={2}
                  value={userWorkingNotes[currentQuestion.id] || ''}
                  onChange={(e) => handleUpdateNotes(currentQuestion.id, e.target.value)}
                  placeholder="e.g. 1/2 = 3/6, 1/3 = 2/6. 3/6 + 2/6 = 5/6."
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Bottom Tablet Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-slate-400">
              Answered {Object.keys(userAnswers).length} / {activeAssessment?.questions.length}
            </span>

            {currentQuestionIndex < (activeAssessment?.questions.length || 0) - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isRegistered}
                className={`px-6 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all ${
                  isRegistered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                }`}
                title={
                  !isRegistered
                    ? 'Learners not registered in Tutor Dashboard cannot take or submit assessments.'
                    : 'Submit your assessment answers'
                }
              >
                {isRegistered ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
                <span>{isRegistered ? 'Submit Assessment' : 'Locked (Unregistered Learner)'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Instant Mastery Status Report View (Post-Submission) */
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-10 shadow-sm text-slate-800 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full inline-block mt-4">
              Assessment Submitted
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {latestSubmission?.score === 100
                ? `Outstanding Job, ${studentNameInput}!`
                : `Great Effort, ${studentNameInput}!`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your step-by-step solution breakdown and answers have been analyzed and transmitted to your Tutor.
            </p>
          </div>

          {/* Score & Flag Status Card */}
          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Score Achieved</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {latestSubmission?.score}%
              </div>
              <span className="text-xs text-slate-500">
                {latestSubmission?.correctCount} of {latestSubmission?.totalQuestions} correct
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Mastery Status</span>
              <div className="mt-1">
                {latestSubmission?.score && latestSubmission.score >= 75 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered</span>
                  </span>
                ) : latestSubmission?.score && latestSubmission.score >= 50 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Developing</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Flagged for IRIP</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {latestSubmission?.score === 100
                  ? 'Outstanding Job! You answered all questions and solution steps correctly.'
                  : 'Nice work! You completed all the solution steps. Some of your answers are not yet correct. Please review the highlighted steps and try again.'}
              </p>
            </div>
          </div>

          {/* Solution & Learner Step Analysis Breakdown Section */}
          <div className="text-left space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-blue-600" />
                  <span>Solution Steps & Learner Working Analysis</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review how each answer was calculated step-by-step alongside your working notes.
                </p>
              </div>

              {/* Review Filter */}
              <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    reviewFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({(activeAssessment?.questions || []).length})
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    reviewFilter === 'incorrect'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  Needs Practice ({((activeAssessment?.questions || []).length) - (latestSubmission?.correctCount || 0)})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${
                    reviewFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Mastered ({latestSubmission?.correctCount || 0})
                </button>
              </div>
            </div>

            {/* Questions Detailed Breakdown Cards */}
            <div className="space-y-4">
              {activeAssessment?.questions
                .filter((q) => {
                  const ans = latestSubmission?.answers.find((a) => a.questionId === q.id);
                  if (reviewFilter === 'incorrect') return ans && !ans.isCorrect;
                  if (reviewFilter === 'correct') return ans && ans.isCorrect;
                  return true;
                })
                .map((q, idx) => {
                  const ansObj = latestSubmission?.answers.find((a) => a.questionId === q.id);
                  const isCorrect = ansObj?.isCorrect;
                  const selectedOptIdx = ansObj?.selectedOption ?? -1;
                  const selectedOptText = selectedOptIdx >= 0 ? q.options[selectedOptIdx] : 'No response';
                  const correctOptText = q.options[q.correctAnswer];
                  const misconceptionReason =
                    !isCorrect && selectedOptIdx >= 0 ? q.optionMisconceptions?.[selectedOptIdx] : null;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-xl border text-xs space-y-4 shadow-sm transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{q.text}</h5>
                            <p className="text-xs text-blue-900 font-medium italic mt-0.5">
                              {getTagalogVersion(q)}
                            </p>
                            <span className="text-[11px] font-semibold text-blue-700 block mt-1">Competency: {q.competency}</span>
                          </div>
                        </div>

                        {isCorrect ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-full flex items-center gap-1 shrink-0 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 font-bold rounded-full flex items-center gap-1 shrink-0 text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Practice Needed
                          </span>
                        )}
                      </div>

                      {/* Learner's Choice & Recorded Steps Box */}
                      <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 space-y-2 text-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Answer</span>
                            <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                              Option {String.fromCharCode(65 + (selectedOptIdx >= 0 ? selectedOptIdx : 0))}: {selectedOptText}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Correct Answer</span>
                              <span className="font-bold text-emerald-700">
                                Option {String.fromCharCode(65 + q.correctAnswer)}: {correctOptText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Recorded Working Notes & Selected Steps */}
                        {(ansObj?.workingNotes || (ansObj?.selectedSteps && ansObj.selectedSteps.length > 0)) ? (
                          <div className="pt-2 space-y-1.5">
                            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>Learner&apos;s Solution Path & Scratchpad Recorded:</span>
                            </span>

                            {ansObj.workingNotes && (
                              <p className="bg-blue-50/80 border border-blue-100 text-blue-950 p-2 rounded text-[11px] font-mono leading-relaxed">
                                &quot;{ansObj.workingNotes}&quot;
                              </p>
                            )}

                            {ansObj.selectedSteps && ansObj.selectedSteps.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {ansObj.selectedSteps.map((step, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded text-[10px] font-medium flex items-center gap-1"
                                  >
                                    <CheckSquare className="w-3 h-3 text-blue-600" />
                                    <span>{step}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic pt-1">
                            No scratchpad notes recorded for this question.
                          </div>
                        )}
                      </div>

                      {/* Guided Fill-in-the-Blank Solution Framework Review */}
                      <GuidedSolutionSteps
                        question={q}
                        userBlankAnswers={ansObj?.guidedStepAnswers || {}}
                        isReadOnly={true}
                        showValidation={true}
                        title="Learner's Solution Steps Performance"
                        subtitle="Framework evaluation of filled-in blanks:"
                        hideNotificationBadges={true}
                        isLearnerDashboard={true}
                      />

                      {/* Diagnostic Misconception Breakdown */}
                      {misconceptionReason && (
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-amber-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Misconception & Misstep Analysis:</span>
                          </div>
                          <p className="text-[11px] text-amber-900 leading-relaxed pl-5 font-medium">
                            {misconceptionReason}
                          </p>
                        </div>
                      )}

                      {/* Step-by-Step Canonical Solution */}
                      {q.solutionSteps && q.solutionSteps.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Step-by-Step Correct Solution:</span>
                            </span>
                            <button
                              onClick={() =>
                                speakText(`Step by step solution: ${q.solutionSteps?.join('. ')}`)
                              }
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Read Steps Aloud
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {q.solutionSteps.map((stepStr, sIdx) => {
                              const parts = stepStr.split(':');
                              const stepTitle = parts[0];
                              const stepBody = parts.slice(1).join(':');

                              return (
                                <div
                                  key={sIdx}
                                  className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-start gap-2.5"
                                >
                                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {sIdx + 1}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-900 block text-[11px]">{stepTitle}</span>
                                    <span className="text-slate-600 block text-[11px] mt-0.5 leading-relaxed">
                                      {stepBody}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Restart / Take Another Assessment Action */}
          <div className="pt-4 flex items-center justify-center gap-3 border-t border-slate-200">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setUserAnswers({});
                setUserWorkingNotes({});
                setUserSelectedSteps({});
                setUserBlankAnswers({});
                setCurrentQuestionIndex(0);
                setLatestSubmission(null);
                if (activeAssessment) {
                  setTimeRemainingSeconds(activeAssessment.timeLimitMinutes * 60);
                }
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Assessment Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
