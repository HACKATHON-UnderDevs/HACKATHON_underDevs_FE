import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Backend API interfaces
export interface BackendQuizRequest {
  quiz_id: string;
  note_content: string;
}

export interface BackendAnswer {
  option_text: string;
  is_correct: boolean;
}

export interface BackendQuizQuestion {
  quiz_id: string;
  question_text: string;
  question_type: string;
  answers: BackendAnswer[];
}

export interface BackendQuizResponse {
  quizzes: BackendQuizQuestion[];
}

// Frontend interfaces
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  question_type: string;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  title: string;
  subject?: string;
  source_material: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: string;
  created_at: string;
}

export interface GeneratedQuiz {
  id: string;
  submission_id: string;
  quiz_id: string;
  title: string;
  subject?: string;
  question_count: number;
  user_id: string;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface SavedQuiz extends GeneratedQuiz {
  questions: QuizQuestion[];
}

export interface GenerateQuizOptions {
  title: string;
  subject?: string;
  sourceText: string;
  userId: string;
}

export class QuizAPIService {
  private static readonly BACKEND_API_URL = 'http://127.0.0.1:8000';

  // Generate a unique quiz ID
  private static generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Call the backend API to generate quiz
  private static async callBackendAPI(request: BackendQuizRequest): Promise<BackendQuizResponse> {
    try {
      const response = await fetch(`${this.BACKEND_API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const data: BackendQuizResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling backend API:', error);
      throw new Error('Failed to generate quiz from backend API');
    }
  }

  // Convert backend questions to frontend format
  private static convertBackendQuestions(backendQuestions: BackendQuizQuestion[]): QuizQuestion[] {
    return backendQuestions.map((bq, index) => {
      const correctAnswer = bq.answers.find(a => a.is_correct);
      return {
        id: `question_${index + 1}`,
        question: bq.question_text,
        options: bq.answers.map(a => a.option_text),
        correct_answer: correctAnswer?.option_text || bq.answers[0]?.option_text || '',
        question_type: bq.question_type,
      };
    });
  }

  // Main method to create and generate quiz
  static async saveQuizToDatabase(quizData: {
    title: string;
    subject?: string;
    sourceText: string;
    userId: string;
  }): Promise<SavedQuiz> {
    try {
      // Step 1: Generate unique quiz ID
      const quizId = this.generateQuizId();

      // Step 2: Save initial submission to database
      const { data: submission, error: submissionError } = await supabase
        .from('quiz_submissions')
        .insert({
          user_id: quizData.userId,
          quiz_title: quizData.title,
          subject: quizData.subject,
          source_material: quizData.sourceText,
          quiz_id: quizId,
          status: 'processing'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Step 3: Call backend API
      const backendRequest: BackendQuizRequest = {
        quiz_id: quizId,
        note_content: quizData.sourceText
      };

      const backendResponse = await this.callBackendAPI(backendRequest);

      // Step 4: Convert backend questions to frontend format
      const questions = this.convertBackendQuestions(backendResponse.quizzes);

      // Step 5: Save generated quiz to database
      const { data: generatedQuiz, error: quizError } = await supabase
        .from('generated_quizzes')
        .insert({
          submission_id: submission.id,
          quiz_id: quizId,
          user_id: quizData.userId,
          title: quizData.title,
          subject: quizData.subject,
          question_count: questions.length
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Step 6: Save questions and answers
      for (let i = 0; i < backendResponse.quizzes.length; i++) {
        const backendQuestion = backendResponse.quizzes[i];
        
        // Save question
        const { data: savedQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: generatedQuiz.id,
            backend_quiz_id: quizId,
            question_text: backendQuestion.question_text,
            question_type: backendQuestion.question_type,
            question_order: i + 1
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Save answers
        const answersToInsert = backendQuestion.answers.map((answer, answerIndex) => ({
          question_id: savedQuestion.id,
          option_text: answer.option_text,
          is_correct: answer.is_correct,
          answer_order: answerIndex + 1
        }));

        const { error: answersError } = await supabase
          .from('quiz_answers')
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }

      // Step 7: Update submission status
      await supabase
        .from('quiz_submissions')
        .update({ status: 'completed' })
        .eq('id', submission.id);

      // Return the complete saved quiz
      return {
        ...generatedQuiz,
        questions
      };
    } catch (error) {
      console.error('Error in quiz generation flow:', error);
      throw new Error('Failed to generate and save quiz');
    }
  }

  static async getUserQuizzes(userId: string): Promise<SavedQuiz[]> {
    try {
      const { data, error } = await supabase
        .from('generated_quizzes')
        .select(`
          *,
          quiz_questions(
            *,
            quiz_answers(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(quiz => ({
        ...quiz,
        questions: quiz.quiz_questions.map((q: { 
          id: string;
          question_text: string;
          question_type: string;
          quiz_answers: Array<{
            option_text: string;
            is_correct: boolean;
          }>;
        }) => ({
          id: q.id,
          question: q.question_text,
          question_type: q.question_type,
          options: q.quiz_answers.map((a: { option_text: string }) => a.option_text),
          correct_answer: q.quiz_answers.find((a: { is_correct: boolean }) => a.is_correct)?.option_text || '',
          explanation: '', // Not provided by backend
          difficulty: 'medium' // Default since not provided
        }))
      }));
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      throw new Error('Failed to fetch user quizzes');
    }
  }

  static async getQuizWithQuestions(quizId: string): Promise<SavedQuiz | null> {
    try {
      const { data, error } = await supabase
        .from('generated_quizzes')
        .select(`
          *,
          quiz_questions(
            *,
            quiz_answers(*)
          )
        `)
        .eq('id', quizId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Quiz not found
        }
        throw error;
      }

      return {
        ...data,
        questions: data.quiz_questions.map((q: { 
          id: string;
          question_text: string;
          question_type: string;
          quiz_answers: Array<{
            option_text: string;
            is_correct: boolean;
          }>;
        }) => ({
          id: q.id,
          question: q.question_text,
          question_type: q.question_type,
          options: q.quiz_answers.map((a: { option_text: string }) => a.option_text),
          correct_answer: q.quiz_answers.find((a: { is_correct: boolean }) => a.is_correct)?.option_text || '',
          explanation: '', // Not provided by backend
          difficulty: 'medium' // Default since not provided
        }))
      };
    } catch (error) {
      console.error('Error fetching quiz with questions:', error);
      throw new Error('Failed to fetch quiz');
    }
  }

  static async generateQuiz(options: GenerateQuizOptions): Promise<QuizQuestion[]> {
    try {
      const savedQuiz = await this.saveQuizToDatabase(options);
      return savedQuiz.questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  static async generateFlashcards(): Promise<QuizQuestion[]> {
    // Placeholder for flashcard generation
    // This should be implemented similar to quiz generation
    return [];
  }
}