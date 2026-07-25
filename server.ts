import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment secrets.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Generate Custom Assessment API via Gemini
  app.post('/api/gemini/generate-assessment', async (req, res) => {
    try {
      const { subject, gradeLevel, competencyTopic, questionCount = 3 } = req.body;
      const ai = getGeminiClient();

      const prompt = `Create a short diagnostic assessment for primary school learners.
Subject: ${subject || 'Mathematics'}
Grade Level: ${gradeLevel || 'Grade 3'}
Target Competency Topic: ${competencyTopic || 'Addition with Regrouping'}
Number of Questions: ${questionCount}

Return a valid JSON object matching the required schema. Ensure multiple choice options have exactly 1 correct answer (0-indexed integer).
Include a friendly "readingAidText" for learners who need reading accommodation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert DepEd Philippines primary education curriculum designer crafting diagnostic assessment items.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              gradeLevel: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.INTEGER },
                    competency: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    readingAidText: { type: Type.STRING },
                  },
                  required: ['text', 'options', 'correctAnswer', 'competency', 'readingAidText'],
                },
              },
            },
            required: ['title', 'subject', 'gradeLevel', 'questions'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in generate-assessment:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate assessment' });
    }
  });

  // 2. AI Intervention Recommendation Engine
  app.post('/api/gemini/suggest-intervention', async (req, res) => {
    try {
      const { studentName, subject, score, missedQuestions, flaggedCompetencies } = req.body;
      const ai = getGeminiClient();

      const prompt = `A learner named ${studentName || 'Learner'} scored ${score}% on a ${subject} assessment.
Missed Competencies: ${JSON.stringify(flaggedCompetencies || [])}
Missed Question Details: ${JSON.stringify(missedQuestions || [])}

Analyze the error pattern and provide a targeted early intervention strategy from the DepEd IRIP intervention toolkit framework.
Provide:
1. Diagnosis summary (1-2 sentences on what root misconception occurred)
2. Recommended Toolkit Activity Title
3. Recommended Manipulatives or Visual Materials
4. 3 clear, actionable 5-minute teacher/tutor guidance steps
5. Encouraging word for the learner in Filipino/English.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a Master Early Childhood & Literacy/Numeracy Intervention Specialist giving real-time classroom advice to tutors.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosisSummary: { type: Type.STRING },
              recommendedToolkitTitle: { type: Type.STRING },
              materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
              guidedSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              encouragementQuote: { type: Type.STRING },
            },
            required: [
              'diagnosisSummary',
              'recommendedToolkitTitle',
              'materialsNeeded',
              'guidedSteps',
              'encouragementQuote',
            ],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in suggest-intervention:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to suggest intervention' });
    }
  });

  // 3. SDO Executive Decision Support API
  app.post('/api/gemini/sdo-insights', async (req, res) => {
    try {
      const { sdoName, totalSchools, avgMastery, totalRedFlags, schoolBreakdown } = req.body;
      const ai = getGeminiClient();

      const prompt = `Provide an Executive Decision Support Brief for Schools Division Office (SDO) Officials.
Division Name: ${sdoName || 'SDO Pasig City'}
Total Participating Schools: ${totalSchools || 3}
Average Mastery Rate: ${avgMastery || 65}%
Total Active Red Flag Learners: ${totalRedFlags || 64}
School-by-School Overview: ${JSON.stringify(schoolBreakdown || [])}

Generate:
1. High-level division summary
2. Specific Resource Allocation Recommendations (e.g. sending roving reading specialists, allocating base-ten blocks)
3. Technical Assistance Priority Actions for low-performing schools
4. Data Privacy & Governance reminder statement.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a Senior Schools Division Superintendent advisor preparing actionable policy and technical assistance guidance.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              divisionSummary: { type: Type.STRING },
              resourceAllocationActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              technicalAssistancePriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
              governanceNote: { type: Type.STRING },
            },
            required: [
              'divisionSummary',
              'resourceAllocationActions',
              'technicalAssistancePriorities',
              'governanceNote',
            ],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in sdo-insights:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate SDO insights' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Express + Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
