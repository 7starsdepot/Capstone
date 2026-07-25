import React, { useState } from 'react';
import { InterventionStrategy } from '../types';
import { BookOpen, X, Search, Tag, Plus, Trash2, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';

interface InterventionToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolkit: InterventionStrategy[];
  onAddToolkitItem?: (item: Omit<InterventionStrategy, 'id'>) => void;
  onDeleteToolkitItem?: (id: string) => void;
}

export const InterventionToolkitModal: React.FC<InterventionToolkitModalProps> = ({
  isOpen,
  onClose,
  toolkit,
  onAddToolkitItem,
  onDeleteToolkitItem,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCompetency, setNewCompetency] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('Mathematics');
  const [newCategory, setNewCategory] = useState<InterventionStrategy['toolkitCategory']>('Math Manipulatives');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newDuration, setNewDuration] = useState<number>(15);
  const [newMaterials, setNewMaterials] = useState<string>('');
  const [newSteps, setNewSteps] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['all', 'Math Manipulatives', 'Phonics & Literacy', 'Peer Pairing', 'Guided Reading', 'Diagnostic Flashcards', 'Visual Grids', 'Guided Practice'];

  const filteredStrategies = toolkit.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && item.toolkitCategory === selectedCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleCreateStrategySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompetency.trim() || !newDescription.trim()) return;

    const materialsArray = newMaterials
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const stepsArray = newSteps
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (onAddToolkitItem) {
      onAddToolkitItem({
        title: newTitle.trim(),
        competency: newCompetency.trim(),
        subject: newSubject,
        description: newDescription.trim(),
        durationMinutes: Number(newDuration) || 15,
        materialsNeeded: materialsArray.length > 0 ? materialsArray : ['Intervention Worksheet', 'Guide Manual'],
        steps: stepsArray.length > 0 ? stepsArray : ['Step 1: Orient learner', 'Step 2: Execute targeted practice', 'Step 3: Review mastery'],
        toolkitCategory: newCategory,
      });
    }

    // Reset Form
    setNewTitle('');
    setNewCompetency('');
    setNewDescription('');
    setNewMaterials('');
    setNewSteps('');
    setUploadedFileName('');
    setShowUploadForm(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-white text-slate-900 p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">DepEd Early Intervention Toolkit</h3>
              <p className="text-xs text-slate-500">
                Validated 10-15 minute early intervention routines for classroom tutors & teachers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
            >
              {showUploadForm ? <X className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
              <span>{showUploadForm ? 'Close Upload Form' : 'Upload Toolkit Strategy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload New Intervention Toolkit Form Drawer */}
        {showUploadForm && (
          <form onSubmit={handleCreateStrategySubmit} className="p-5 bg-indigo-50/60 border-b border-indigo-100 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>Upload New Intervention Toolkit Material</span>
              </h4>
              <span className="text-[11px] text-indigo-600 font-semibold">Tutor Toolkit Authoring</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Strategy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fraction Strips & Visual Grid Routine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Competency *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dissimilar Fractions Addition"
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Reading (English)">Reading (English)</option>
                  <option value="Reading (Filipino)">Reading (Filipino)</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Toolkit Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Math Manipulatives">Math Manipulatives</option>
                  <option value="Phonics & Literacy">Phonics & Literacy</option>
                  <option value="Peer Pairing">Peer Pairing</option>
                  <option value="Guided Reading">Guided Reading</option>
                  <option value="Diagnostic Flashcards">Diagnostic Flashcards</option>
                  <option value="Visual Grids">Visual Grids</option>
                  <option value="Guided Practice">Guided Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Brief Description *</label>
              <textarea
                required
                rows={2}
                placeholder="Describe how the tutor uses this strategy to help flagged learners..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Materials Needed (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Fraction strips, Colored markers, Grid paper"
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Attach Material File (PDF, DOCX, Image)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white border border-slate-300 hover:border-indigo-500 rounded-lg px-3 py-1.5 text-slate-700 font-semibold flex items-center gap-1.5 transition-all">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Choose File...</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.xlsx" />
                  </label>
                  <span className="text-slate-500 truncate text-[11px]">
                    {uploadedFileName || 'No file selected'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Step-by-Step Instructions (one per line)</label>
              <textarea
                rows={2}
                placeholder="Step 1: Present equivalent fraction visual&#10;Step 2: Have learner fold paper strip&#10;Step 3: Check response"
                value={newSteps}
                onChange={(e) => setNewSteps(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Strategy</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Strategies' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search strategy or competency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStrategies.map((strat) => (
              <div
                key={strat.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 hover:border-blue-400 transition-all flex flex-col justify-between group relative"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                      {strat.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{strat.durationMinutes} Mins</span>
                      {onDeleteToolkitItem && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${strat.title}" from the toolkit?`)) {
                              onDeleteToolkitItem(strat.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Delete Strategy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base pr-6">{strat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{strat.description}</p>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block">Required Materials:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {strat.materialsNeeded.map((mat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white text-slate-700 text-xs rounded border border-slate-200">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block">Step-by-Step Instructions:</span>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 mt-1">
                      {strat.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Target: {strat.competency}
                  </span>
                  <div className="flex items-center gap-2">
                    {onDeleteToolkitItem && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete toolkit strategy "${strat.title}"?`)) {
                            onDeleteToolkitItem(strat.id);
                          }
                        }}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 font-bold rounded-lg border border-red-200 text-xs transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        alert(`Assigned "${strat.title}" to active tutor intervention queue.`);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                    >
                      Select Activity
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

