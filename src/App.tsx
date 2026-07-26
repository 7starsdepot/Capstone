import React, { useState, useEffect } from 'react';
import { UserRole, Assessment, Submission, InterventionStrategy, SchoolStats, RegisteredLearner, TutorAccount, SchoolHeadAccount } from './types';
import {
  INITIAL_ASSESSMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_REGISTERED_LEARNERS,
  INITIAL_TUTOR_ACCOUNTS,
  INITIAL_SCHOOL_HEAD_ACCOUNTS,
  INTERVENTION_TOOLKIT,
  SCHOOL_STATS_DATA,
} from './data/mockData';
import { Header } from './components/Header';
import { LearnerScreen } from './components/LearnerScreen';
import { TutorDashboard } from './components/TutorDashboard';
import { SchoolHeadDashboard } from './components/SchoolHeadDashboard';
import { SdoDashboard } from './components/SdoDashboard';
import { InterventionToolkitModal } from './components/InterventionToolkitModal';
import { BellRing, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('tutor');

  // Load persisted states or fall back to clean initial data
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem('irip_submissions_v3');
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    try {
      const saved = localStorage.getItem('irip_assessments_v2');
      return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  });

  const [registeredLearners, setRegisteredLearners] = useState<RegisteredLearner[]>(() => {
    try {
      const saved = localStorage.getItem('irip_registeredLearners_v2');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_LEARNERS;
    } catch {
      return INITIAL_REGISTERED_LEARNERS;
    }
  });

  const [tutorAccounts, setTutorAccounts] = useState<TutorAccount[]>(() => {
    try {
      const saved = localStorage.getItem('irip_tutorAccounts_v3');
      return saved ? JSON.parse(saved) : INITIAL_TUTOR_ACCOUNTS;
    } catch {
      return INITIAL_TUTOR_ACCOUNTS;
    }
  });

  const [schoolHeadAccounts, setSchoolHeadAccounts] = useState<SchoolHeadAccount[]>(() => {
    try {
      const saved = localStorage.getItem('irip_schoolHeadAccounts_v2');
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_HEAD_ACCOUNTS;
    } catch {
      return INITIAL_SCHOOL_HEAD_ACCOUNTS;
    }
  });

  const [toolkit, setToolkit] = useState<InterventionStrategy[]>(() => {
    try {
      const saved = localStorage.getItem('irip_toolkit_v2');
      return saved ? JSON.parse(saved) : INTERVENTION_TOOLKIT;
    } catch {
      return INTERVENTION_TOOLKIT;
    }
  });

  const [schools, setSchools] = useState<SchoolStats[]>(() => {
    try {
      const saved = localStorage.getItem('irip_schools_v2');
      return saved ? JSON.parse(saved) : SCHOOL_STATS_DATA;
    } catch {
      return SCHOOL_STATS_DATA;
    }
  });

  const [isToolkitOpen, setIsToolkitOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clear any legacy cached keys to guarantee a clean state reset
  useEffect(() => {
    const legacyKeys = [
      'irip_submissions_v1',
      'irip_submissions_v2',
      'irip_assessments_v1',
      'irip_registeredLearners_v1',
      'irip_tutorAccounts_v1',
      'irip_tutorAccounts_v2',
      'irip_schoolHeadAccounts_v1',
      'irip_toolkit_v1',
      'irip_schools_v1',
    ];
    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('irip_submissions_v3', JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to persist submissions to localStorage', e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_assessments_v2', JSON.stringify(assessments));
    } catch (e) {
      console.error('Failed to persist assessments to localStorage', e);
    }
  }, [assessments]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_registeredLearners_v2', JSON.stringify(registeredLearners));
    } catch (e) {
      console.error('Failed to persist registeredLearners to localStorage', e);
    }
  }, [registeredLearners]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_tutorAccounts_v3', JSON.stringify(tutorAccounts));
    } catch (e) {
      console.error('Failed to persist tutorAccounts to localStorage', e);
    }
  }, [tutorAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_schoolHeadAccounts_v2', JSON.stringify(schoolHeadAccounts));
    } catch (e) {
      console.error('Failed to persist schoolHeadAccounts to localStorage', e);
    }
  }, [schoolHeadAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_toolkit_v2', JSON.stringify(toolkit));
    } catch (e) {
      console.error('Failed to persist toolkit to localStorage', e);
    }
  }, [toolkit]);

  useEffect(() => {
    try {
      localStorage.setItem('irip_schools_v2', JSON.stringify(schools));
    } catch (e) {
      console.error('Failed to persist schools to localStorage', e);
    }
  }, [schools]);

  const handleUpdateSchoolHeadAccount = (updated: SchoolHeadAccount) => {
    setSchoolHeadAccounts((prev) =>
      prev.map((sh) => (sh.id === updated.id ? updated : sh))
    );
    triggerToast(`Updated profile credentials for ${updated.schoolName}!`);
  };

  const handleUpdateSchoolLearners = (
    schoolName: string,
    newTotalStudents: number,
    updatedSections?: { name: string; tutor: string; total: number; flagged: number }[]
  ) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.name.toLowerCase().trim() === schoolName.toLowerCase().trim()) {
          return {
            ...s,
            totalStudents: newTotalStudents,
            sections: updatedSections || s.sections,
          };
        }
        return s;
      })
    );
    triggerToast(`Updated learner count for ${schoolName} to ${newTotalStudents}`);
  };

  const handleAddToolkitItem = (item: Omit<InterventionStrategy, 'id'>) => {
    const newItem: InterventionStrategy = {
      ...item,
      id: `strat-${Date.now()}`,
    };
    setToolkit((prev) => [newItem, ...prev]);
    triggerToast(`Uploaded new intervention toolkit strategy: "${newItem.title}"`);
  };

  const handleDeleteToolkitItem = (id: string) => {
    setToolkit((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Intervention toolkit strategy deleted.');
  };

  const handleAddTutorAccount = (tutor: Omit<TutorAccount, 'id' | 'createdAt'>) => {
    const newAccount: TutorAccount = {
      ...tutor,
      id: `tut-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTutorAccounts((prev) => [newAccount, ...prev]);
    triggerToast(`Tutor user "${newAccount.username}" created for ${newAccount.schoolName}!`);
  };

  const handleDeleteTutorAccount = (id: string) => {
    setTutorAccounts((prev) => prev.filter((t) => t.id !== id));
    triggerToast('Tutor user account revoked.');
  };

  const handleAddLearner = (learner: Omit<RegisteredLearner, 'id' | 'registeredAt'>) => {
    const newLearner: RegisteredLearner = {
      ...learner,
      id: `lrn-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };
    setRegisteredLearners((prev) => [newLearner, ...prev]);
    triggerToast(`Learner ${newLearner.name} encoded into roster!`);
  };

  const handleUpdateLearner = (id: string, updatedData: Partial<RegisteredLearner>) => {
    setRegisteredLearners((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedData } : l))
    );
    triggerToast('Learner registration details updated.');
  };

  const handleDeleteLearner = (id: string) => {
    setRegisteredLearners((prev) => prev.filter((l) => l.id !== id));
    triggerToast('Learner removed from roster.');
  };

  // Play audio alert chime for red flags
  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext fallback
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Reset and clear all data across all modules
  const handleResetAllData = () => {
    setSubmissions([]);
    setRegisteredLearners([]);
    setTutorAccounts([]);
    setSchools((prev) =>
      prev.map((s) => ({
        ...s,
        totalStudents: 0,
        masteredPercentage: 0,
        flaggedRedCount: 0,
        flaggedYellowCount: 0,
        resolvedCount: 0,
        avgInterventionTimeMinutes: 0,
        sections: s.sections.map((sec) => ({ ...sec, total: 0, flagged: 0 })),
      }))
    );
    try {
      localStorage.removeItem('irip_submissions_v3');
      localStorage.removeItem('irip_registeredLearners_v2');
      localStorage.removeItem('irip_tutorAccounts_v3');
      localStorage.removeItem('irip_schools_v2');
    } catch (e) {
      console.error('Failed to clear localStorage keys', e);
    }
    triggerToast('🔄 Application reset to initial clean state. All counters and data cleared!');
  };

  // Add submission from learner or simulation
  const handleLearnerSubmit = (newSubData: Omit<Submission, 'id'>) => {
    const newSubmission: Submission = {
      ...newSubData,
      id: `sub-${Date.now()}`,
    };

    setSubmissions((prev) => {
      // Clear all previous submissions for this learner and assessment when retaking
      const filtered = prev.filter(
        (s) =>
          !(
            (s.studentId === newSubData.studentId ||
              (s.studentName.trim().toLowerCase() === newSubData.studentName.trim().toLowerCase() &&
                s.schoolName.trim().toLowerCase() === newSubData.schoolName.trim().toLowerCase())) &&
            s.assessmentId === newSubData.assessmentId
          )
      );
      return [newSubmission, ...filtered];
    });

    if (newSubData.schoolName) {
      setSchools((prev) =>
        prev.map((s) => {
          if (
            s.name.toLowerCase().trim() === newSubData.schoolName.toLowerCase().trim() ||
            s.name.toLowerCase().includes(newSubData.schoolName.toLowerCase().trim()) ||
            newSubData.schoolName.toLowerCase().includes(s.name.toLowerCase().trim())
          ) {
            const isRed = newSubmission.flagSeverity === 'red';
            const isYellow = newSubmission.flagSeverity === 'yellow';
            return {
              ...s,
              flaggedRedCount: isRed ? s.flaggedRedCount + 1 : s.flaggedRedCount,
              flaggedYellowCount: isYellow ? s.flaggedYellowCount + 1 : s.flaggedYellowCount,
            };
          }
          return s;
        })
      );
    }

    if (newSubmission.flagSeverity === 'red') {
      playAlertChime();
      triggerToast(`🚨 RED FLAG ALERT: ${newSubmission.studentName} scored ${newSubmission.score}% in ${newSubmission.subject}!`);
    } else if (newSubmission.flagSeverity === 'yellow') {
      triggerToast(`⚠️ Moderate Alert: ${newSubmission.studentName} flagged in ${newSubmission.subject}`);
    } else {
      triggerToast(`✅ ${newSubmission.studentName} submitted assessment - Mastered!`);
    }
  };

  // Simulate a live student submission
  const handleSimulateSubmission = () => {
    const names = [
      'Althea Bonifacio',
      'Joshua Tan',
      'Lia Silang',
      'Kenneth Aquino',
      'Janelle Cruz',
      'Paolo Garcia',
    ];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const isRedFlag = Math.random() > 0.3; // 70% chance red flag for testing
    const score = isRedFlag ? 25 : 100;
    const flagSeverity = isRedFlag ? 'red' : 'none';

    const simulatedData: Omit<Submission, 'id'> = {
      studentId: `stu-sim-${Math.floor(Math.random() * 900 + 100)}`,
      studentName: chosenName,
      avatar: `https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80`,
      section: 'Grade 5 - Section A',
      gradeLevel: 'Grade 5',
      schoolName: 'Rizal Elementary School',
      sdoName: 'SDO Pasig City',
      assessmentId: 'assess-math-01',
      assessmentTitle: 'Grade 5 Math: Addition & Subtraction of Dissimilar Fractions',
      subject: 'Mathematics',
      type: 'pre_session',
      score,
      totalQuestions: 4,
      correctCount: isRedFlag ? 1 : 4,
      submittedAt: new Date().toISOString(),
      answers: [
        { questionId: 'q-m1', selectedOption: 1, isCorrect: !isRedFlag, timeSpentSeconds: 30 },
        { questionId: 'q-m2', selectedOption: 1, isCorrect: !isRedFlag, timeSpentSeconds: 25 },
        { questionId: 'q-m3', selectedOption: 0, isCorrect: true, timeSpentSeconds: 40 },
        { questionId: 'q-m4', selectedOption: 1, isCorrect: false, timeSpentSeconds: 35 },
      ],
      flagSeverity,
      flaggedCompetencies: isRedFlag
        ? ['Dissimilar Fractions Addition', 'Finding Common Denominators']
        : [],
      status: isRedFlag ? 'pending_intervention' : 'normal',
      flaggedAt: isRedFlag ? new Date().toISOString() : undefined,
    };

    handleLearnerSubmit(simulatedData);
  };

  const handleAssignIntervention = (submissionId: string, interventionId: string, notes?: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            status: 'in_intervention',
            assignedInterventionId: interventionId,
            interventionNotes: notes,
          };
        }
        return s;
      })
    );
    triggerToast(`Assigned toolkit activity to submission.`);
  };

  const handleResolveSubmission = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    triggerToast(`Intervention resolved and logged!`);
  };

  const handleAddNewAssessment = (assessment: Assessment) => {
    setAssessments((prev) => [assessment, ...prev]);
    triggerToast(`Created new assessment: "${assessment.title}"`);
  };

  const redFlagCount = submissions.filter((s) => s.flagSeverity === 'red' && s.status !== 'resolved').length;
  const yellowFlagCount = submissions.filter((s) => s.flagSeverity === 'yellow' && s.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        redFlagCount={redFlagCount}
        yellowFlagCount={yellowFlagCount}
        onSimulateSubmission={handleSimulateSubmission}
        onOpenToolkit={() => setIsToolkitOpen(true)}
        onResetAllData={handleResetAllData}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRole === 'learner' && (
          <LearnerScreen
            assessments={assessments}
            registeredLearners={registeredLearners}
            onSubmitAssessment={handleLearnerSubmit}
          />
        )}

        {currentRole === 'tutor' && (
          <TutorDashboard
            submissions={submissions}
            assessments={assessments}
            toolkit={toolkit}
            registeredLearners={registeredLearners}
            tutorAccounts={tutorAccounts}
            onAddLearner={handleAddLearner}
            onUpdateLearner={handleUpdateLearner}
            onDeleteLearner={handleDeleteLearner}
            onAssignIntervention={handleAssignIntervention}
            onResolveSubmission={handleResolveSubmission}
            onAddNewAssessment={handleAddNewAssessment}
            onOpenToolkit={() => setIsToolkitOpen(true)}
            onAddToolkitItem={handleAddToolkitItem}
            onDeleteToolkitItem={handleDeleteToolkitItem}
            onResetAllData={handleResetAllData}
          />
        )}

        {currentRole === 'school_head' && (
          <SchoolHeadDashboard
            schools={schools}
            submissions={submissions}
            tutorAccounts={tutorAccounts}
            schoolHeadAccounts={schoolHeadAccounts}
            onAddTutorAccount={handleAddTutorAccount}
            onDeleteTutorAccount={handleDeleteTutorAccount}
            onUpdateSchoolLearners={handleUpdateSchoolLearners}
            onUpdateSchoolHeadAccount={handleUpdateSchoolHeadAccount}
            onResetAllData={handleResetAllData}
          />
        )}

        {currentRole === 'sdo_official' && (
          <SdoDashboard
            schools={schools}
            schoolHeadAccounts={schoolHeadAccounts}
            submissions={submissions}
            registeredLearners={registeredLearners}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Real-time Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-red-500 text-slate-900 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <BellRing className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-slate-800">{toastMessage}</span>
        </div>
      )}

      {/* DepEd IRIP Intervention Toolkit Drawer Modal */}
      <InterventionToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        toolkit={toolkit}
        onAddToolkitItem={handleAddToolkitItem}
        onDeleteToolkitItem={handleDeleteToolkitItem}
      />
    </div>
  );
}
