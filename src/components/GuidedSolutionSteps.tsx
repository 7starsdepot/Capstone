import React from 'react';
import { GuidedStep, Question, StepBlank } from '../types';
import { Footprints, CheckCircle2, XCircle, Sparkles, Check } from 'lucide-react';

interface GuidedSolutionStepsProps {
  question: Question;
  userBlankAnswers: Record<string, string>;
  onChangeBlankAnswer?: (blankId: string, value: string) => void;
  isReadOnly?: boolean;
  showValidation?: boolean;
  title?: string;
  subtitle?: string;
  hideNotificationBadges?: boolean;
}

// Fallback generator if a question doesn't have custom guidedSteps explicitly declared
export function getGuidedStepsForQuestion(question: Question): GuidedStep[] {
  if (question.guidedSteps && question.guidedSteps.length > 0) {
    return question.guidedSteps;
  }

  if (question.solutionSteps && question.solutionSteps.length > 0) {
    return question.solutionSteps.map((stepStr, idx) => {
      const parts = stepStr.split(':');
      const stepTitle = parts[0] || `Step ${idx + 1}`;
      const stepText = parts.slice(1).join(':').trim() || stepStr;

      // Try to find numbers or equations to make a blank
      const numbers = stepText.match(/\d+(\.\d+)?(\/\d+)?/g);
      const lastNumber = numbers && numbers.length > 0 ? numbers[numbers.length - 1] : '';

      if (lastNumber && stepText.includes(lastNumber)) {
        const splitIndex = stepText.lastIndexOf(lastNumber);
        const prefix = stepText.substring(0, splitIndex);
        const suffix = stepText.substring(splitIndex + lastNumber.length);

        return {
          stepNumber: idx + 1,
          title: stepTitle,
          instruction: 'Fill in the required missing value for this step:',
          blanks: [
            {
              id: `${question.id}-gen-s${idx + 1}-b1`,
              prefixText: prefix,
              suffixText: suffix,
              correctValue: lastNumber,
              placeholder: 'value',
            },
          ],
        };
      }

      return {
        stepNumber: idx + 1,
        title: stepTitle,
        instruction: 'State or complete key finding:',
        blanks: [
          {
            id: `${question.id}-gen-s${idx + 1}-b1`,
            prefixText: stepText + ' -> Result: ',
            suffixText: '',
            correctValue: 'Done',
            placeholder: 'your answer',
          },
        ],
      };
    });
  }

  return [];
}

export const GuidedSolutionSteps: React.FC<GuidedSolutionStepsProps> = ({
  question,
  userBlankAnswers,
  onChangeBlankAnswer,
  isReadOnly = false,
  showValidation = false,
  title = 'Guided Solution Framework (Fill-in-the-Blank)',
  subtitle = 'Complete the missing values or steps in the solution framework below:',
  hideNotificationBadges = false,
}) => {
  const guidedSteps = getGuidedStepsForQuestion(question);

  if (guidedSteps.length === 0) return null;

  // Calculate completion
  let totalBlanks = 0;
  let filledBlanks = 0;
  let correctBlanks = 0;

  guidedSteps.forEach((step) => {
    step.blanks.forEach((blank) => {
      totalBlanks++;
      const val = (userBlankAnswers[blank.id] || '').trim();
      if (val !== '') {
        filledBlanks++;
      }
      if (val.toLowerCase() === blank.correctValue.trim().toLowerCase()) {
        correctBlanks++;
      }
    });
  });

  const isComplete = totalBlanks > 0 && filledBlanks === totalBlanks;

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4 text-slate-800">
      {/* Friendly Learner Guidance Banner */}
      <div className="bg-blue-600 text-white rounded-lg p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-white/10 rounded-lg shrink-0 mt-0.5">
            <Footprints className="w-5 h-5 text-blue-100 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2 text-white">
              <span>{title}</span>
            </h4>
            <p className="text-[11px] text-blue-100 mt-0.5 font-medium leading-relaxed">
              Step-by-Step Math Guide: Fill in each missing number below to solve this problem step by step!
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="shrink-0 self-start sm:self-center">
          {showValidation ? (
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                correctBlanks === totalBlanks
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {correctBlanks}/{totalBlanks} Steps Correct
              </span>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-xs text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Step Progress: {filledBlanks}/{totalBlanks}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Step Progress Bar */}
      {totalBlanks > 0 && !showValidation && !isReadOnly && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 px-0.5">
            <span>Framework Completion</span>
            <span className="text-blue-700">{Math.round((filledBlanks / totalBlanks) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(filledBlanks / totalBlanks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3.5">
        {guidedSteps.map((step, stepIdx) => {
          // Check if step is fully completed
          const isStepCompleted = step.blanks.every(
            (b) => (userBlankAnswers[b.id] || '').trim() !== ''
          );

          return (
            <div
              key={step.stepNumber}
              className={`bg-white border rounded-xl p-4 space-y-3 shadow-2xs transition-all ${
                isStepCompleted
                  ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      isStepCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Step {step.stepNumber} of {guidedSteps.length}: {step.title}
                  </span>
                </div>

                {isStepCompleted && !showValidation && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Step Completed
                  </span>
                )}
              </div>

              {step.instruction && (
                <p className="text-[11px] text-blue-900 font-medium bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{step.instruction}</span>
                </p>
              )}

              {/* Step Blanks Container */}
              <div className="pt-1 space-y-2">
                {step.blanks.map((blank) => {
                  const userVal = userBlankAnswers[blank.id] || '';
                  const isBlankFilled = userVal.trim() !== '';
                  const isBlankCorrect =
                    userVal.trim().toLowerCase() === blank.correctValue.trim().toLowerCase();

                  return (
                    <div
                      key={blank.id}
                      className={`border rounded-lg p-3 text-xs text-slate-800 flex flex-wrap items-center gap-2 font-mono leading-normal transition-all ${
                        !isReadOnly && !showValidation && isBlankFilled
                          ? isBlankCorrect
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-red-50 border-red-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Prefix Text */}
                      {blank.prefixText && (
                        <span className="text-slate-800 font-sans font-semibold text-xs">
                          {blank.prefixText}
                        </span>
                      )}

                      {/* Blank Input Box with Instant Feedback */}
                      <div className="inline-flex items-center gap-2 relative">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={userVal}
                          onChange={(e) =>
                            onChangeBlankAnswer && onChangeBlankAnswer(blank.id, e.target.value)
                          }
                          placeholder="___"
                          className={`w-20 sm:w-24 px-2.5 py-1 text-center font-bold text-xs rounded-lg border-2 transition-all focus:outline-none ${
                            isReadOnly || showValidation
                              ? isBlankCorrect
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-extrabold'
                                : isBlankFilled
                                ? 'bg-red-100 border-red-500 text-red-950 font-extrabold'
                                : 'bg-amber-50 border-amber-300 text-amber-900 italic'
                              : isBlankFilled
                              ? isBlankCorrect
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-extrabold ring-2 ring-emerald-300'
                                : 'bg-red-100 border-red-500 text-red-950 font-extrabold ring-2 ring-red-300'
                              : 'bg-white border-blue-400 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-300'
                          }`}
                        />

                        {/* Real-Time Instant Feedback Icon & Badge */}
                        {isBlankFilled && !hideNotificationBadges && (
                          <div className="flex items-center gap-1 shrink-0">
                            {isBlankCorrect ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md shadow-2xs font-sans">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                <span>Correct!</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-md shadow-2xs font-sans">
                                <XCircle className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                                <span>Check your value</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Suffix Text */}
                      {blank.suffixText && (
                        <span className="text-slate-800 font-sans font-semibold text-xs">
                          {blank.suffixText}
                        </span>
                      )}

                      {/* Correct Answer Display in ReadOnly / Validation Mode when incorrect */}
                      {(showValidation || isReadOnly) && !isBlankCorrect && (
                        <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-sans">
                          Target Value: {blank.correctValue}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouragement Banner when fully completed */}
      {isComplete && !isReadOnly && !showValidation && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>🎉 Outstanding job! You completed all solution steps!</span>
          </div>
          <span className="text-[11px] font-normal text-emerald-800">Ready to select your final answer option above.</span>
        </div>
      )}
    </div>
  );
};
