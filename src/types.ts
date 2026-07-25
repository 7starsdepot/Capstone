export type UserRole = 'learner' | 'tutor' | 'school_head' | 'sdo_official';

export interface SchoolHeadAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  schoolName: string;
  schoolId: string;
}

export interface TutorAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  schoolName: string;
  section: string;
  gradeLevel: string;
  createdBySchoolHeadId?: string;
  createdAt: string;
}

export interface RegisteredLearner {
  id: string;
  lrn: string;
  name: string;
  section: string;
  gradeLevel: string;
  schoolName: string;
  registeredAt: string;
}

export type FlagSeverity = 'red' | 'yellow' | 'none';

export type AssessmentType = 'pre_session' | 'post_session';

export interface StepBlank {
  id: string;
  prefixText?: string;
  suffixText?: string;
  correctValue: string;
  placeholder?: string;
  hint?: string;
}

export interface GuidedStep {
  stepNumber: number;
  title: string;
  instruction?: string;
  blanks: StepBlank[];
}

export interface Question {
  id: string;
  text: string;
  tagalogText?: string; // Translated Tagalog version of the question
  options: string[];
  correctAnswer: number; // 0-indexed
  competency: string; // e.g. "Phonics - Long Vowels", "Math - Two-Digit Subtraction"
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  readingAidText?: string;
  solutionSteps?: string[]; // Canonical step-by-step solution
  guidedSteps?: GuidedStep[]; // Guided fill-in-the-blank solution framework
  optionMisconceptions?: Record<number, string>; // Misconception details for distractor options
}

export interface Assessment {
  id: string;
  title: string;
  subject: 'Reading (English)' | 'Reading (Filipino)' | 'Mathematics' | 'Science';
  gradeLevel: string;
  type: AssessmentType;
  questions: Question[];
  timeLimitMinutes: number;
}

export interface StudentAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  workingNotes?: string; // Working scratchpad or steps recorded by learner
  selectedSteps?: string[]; // Steps recorded/selected by the learner
  guidedStepAnswers?: Record<string, string>; // Recorded fill-in-the-blank answers indexed by blank ID
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  section: string;
  gradeLevel: string;
  schoolName: string;
  sdoName: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  type: AssessmentType;
  score: number; // percentage e.g. 40
  totalQuestions: number;
  correctCount: number;
  submittedAt: string; // ISO or formatted
  answers: StudentAnswer[];
  flagSeverity: FlagSeverity;
  flaggedCompetencies: string[];
  status: 'pending_intervention' | 'in_intervention' | 'resolved' | 'normal';
  assignedInterventionId?: string;
  interventionNotes?: string;
  flaggedAt?: string;
  resolvedAt?: string;
}

export interface InterventionStrategy {
  id: string;
  title: string;
  competency: string;
  subject: string;
  description: string;
  durationMinutes: number;
  materialsNeeded: string[];
  steps: string[];
  toolkitCategory: 'Phonics & Literacy' | 'Math Manipulatives' | 'Peer Pairing' | 'Guided Reading' | 'Diagnostic Flashcards' | 'Visual Grids' | 'Guided Practice';
}

export interface SchoolStats {
  id: string;
  name: string;
  schoolId?: string;
  sdoName: string;
  totalStudents: number;
  masteredPercentage: number;
  flaggedRedCount: number;
  flaggedYellowCount: number;
  resolvedCount: number;
  avgInterventionTimeMinutes: number;
  sections: { name: string; tutor: string; total: number; flagged: number }[];
}

export interface WorkshopFeatureVote {
  id: string;
  part: string;
  title: string;
  description: string;
  category: 'Learner-Facing' | 'Tutor Dashboard' | 'School Head View' | 'SDO Division View' | 'Data Privacy';
  votesCount: number;
  proposedBy: string;
  priorityLevel?: 'High' | 'Medium' | 'Low';
}

export interface WorkshopGuideQuestion {
  part: string;
  partTitle: string;
  questionNumber: number;
  questionText: string;
  contextNote?: string;
  sampleIdeas: string[];
}

export interface MathCompetencyTrend {
  period: string;
  dissimilarFractions: number;
  decimalMultiplication: number;
  volumeGeometry: number;
  orderOfOperations: number;
  equivalentFractions: number;
  averageScore: number;
}
