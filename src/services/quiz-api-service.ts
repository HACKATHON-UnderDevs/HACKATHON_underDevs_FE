import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Backend API interfaces
export interface BackendQuizRequest {
  title: string;
  subject?: string;
  user_id: string;
  note_id: string;
  note_content: string;
  question_count?: number;
}

export interface BackendAnswer {
  option_text: string;
  is_correct: boolean;
  answer_order: number;
}

export interface BackendQuizQuestion {
  question_text: string;
  question_type: string;
  question_order: number;
  answers: BackendAnswer[];
}

export interface BackendQuiz {
  quiz_id: string;
  title: string;
  subject: string;
  user_id: string;
  note_id: string;
  question_count: number;
  questions: BackendQuizQuestion[];
}

export interface BackendQuizResponse {
  success: boolean;
  quiz: BackendQuiz;
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
  noteId?: string;
}

// Flashcard interfaces
export interface BackendFlashcardRequest {
  flashcard_set_id: string;
  note_content: string;
  card_count?: number;
}

export interface BackendFlashcard {
  flashcard_set_id: string;
  question: string;
  answer: string;
}

export interface BackendFlashcardResponse {
  flashcards: BackendFlashcard[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface FlashcardSubmission {
  id: string;
  flashcard_set_id: string;
  title: string;
  subject?: string;
  source_material: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: string;
  created_at: string;
}

export interface GeneratedFlashcardSet {
  id: string;
  submission_id: string;
  flashcard_set_id: string;
  title: string;
  subject?: string;
  card_count: number;
  user_id: string;
  created_at: string;
  flashcards?: Flashcard[];
}

export interface SavedFlashcardSet extends GeneratedFlashcardSet {
  flashcards: Flashcard[];
}

export interface GenerateFlashcardOptions {
  title: string;
  subject?: string;
  sourceText: string;
  userId: string;
  cardCount?: number;
}

export class QuizAPIService {
  private static readonly BACKEND_API_URL = 'https://ai.vibe88.tech';

  // Generate a unique quiz ID
  private static generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Call the backend API to generate quiz
  private static async callBackendAPI(request: BackendQuizRequest): Promise<BackendQuizResponse> {
    try {
      const response = await fetch(`${this.BACKEND_API_URL}/quizzes/create`, {
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
    return backendQuestions.map((bq) => {
      const correctAnswer = bq.answers.find(a => a.is_correct);
      return {
        id: `question_${bq.question_order}`,
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
    noteId?: string;
    questionCount?: number;
  }): Promise<SavedQuiz> {
    try {
      // Step 1: Generate unique backend quiz ID for API communication
      const backendQuizId = this.generateQuizId();

      // Step 2: Create quiz in main quizzes table first
      const { data: mainQuiz, error: mainQuizError } = await supabase
        .from('quizzes')
        .insert({
          user_id: quizData.userId,
          title: quizData.title,
          subject: quizData.subject,
          question_count: quizData.questionCount || 5,
          note_id: quizData.noteId
        })
        .select()
        .single();

      if (mainQuizError) throw mainQuizError;

      // Step 3: Save initial submission to database with backend quiz_id
      const { data: submission, error: submissionError } = await supabase
        .from('quiz_submissions')
        .insert({
          user_id: quizData.userId,
          quiz_title: quizData.title,
          subject: quizData.subject,
          source_material: quizData.sourceText,
          quiz_id: backendQuizId,
          status: 'processing'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Step 4: Call backend API to generate quiz
      const backendRequest: BackendQuizRequest = {
        title: quizData.title,
        subject: quizData.subject || '',
        user_id: quizData.userId,
        note_id: quizData.noteId || `generated_${Date.now()}`,
        note_content: quizData.sourceText,
        question_count: quizData.questionCount || 5
      };

      const backendResponse = await this.callBackendAPI(backendRequest);

      if (!backendResponse.success) {
        throw new Error('Backend API returned unsuccessful response');
      }

      // Debug: Log the backend response quiz_id
      console.log('Backend response quiz_id:', backendResponse.quiz.quiz_id);
      console.log('Generated backendQuizId:', backendQuizId);

      // Step 5: Convert backend questions to frontend format
      const questions = this.convertBackendQuestions(backendResponse.quiz.questions);

      // Step 6: Save generated quiz to database with main quiz ID
      const { data: generatedQuiz, error: quizError } = await supabase
        .from('generated_quizzes')
        .insert({
          submission_id: submission.id,
          quiz_id: mainQuiz.id.toString(), // Convert UUID to string for VARCHAR field
          user_id: backendResponse.quiz.user_id,
          note_id: backendResponse.quiz.note_id,
          title: backendResponse.quiz.title,
          subject: backendResponse.quiz.subject,
          question_count: backendResponse.quiz.question_count
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Step 7: Save questions and answers
      for (const backendQuestion of backendResponse.quiz.questions) {
        // Save question
        const { data: savedQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: generatedQuiz.id,
            backend_quiz_id: backendResponse.quiz.quiz_id, // Use the backend response quiz ID
            question_text: backendQuestion.question_text,
            question_type: backendQuestion.question_type,
            question_order: backendQuestion.question_order
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Save answers
        const answersToInsert = backendQuestion.answers.map((answer) => ({
          question_id: savedQuestion.id,
          option_text: answer.option_text,
          is_correct: answer.is_correct,
          answer_order: answer.answer_order
        }));

        const { error: answersError } = await supabase
          .from('quiz_answers')
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }

      // Step 8: Update submission status
      await supabase
        .from('quiz_submissions')
        .update({ 
          status: 'completed'
        })
        .eq('id', submission.id);

      // Return the complete saved quiz
      return {
        ...generatedQuiz,
        submission_id: submission.id,
        quiz_id: mainQuiz.id,
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
      const savedQuiz = await this.saveQuizToDatabase({
        title: options.title,
        subject: options.subject,
        sourceText: options.sourceText,
        userId: options.userId,
        noteId: options.noteId,
        questionCount: 5
      });
      return savedQuiz.questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  // Generate a unique flashcard set ID
  private static generateFlashcardSetId(): string {
    return `flashcard_set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Call the backend API to generate flashcards
  private static async callBackendFlashcardAPI(request: BackendFlashcardRequest): Promise<BackendFlashcardResponse> {
    try {
      const response = await fetch(`${this.BACKEND_API_URL}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const data: BackendFlashcardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling backend flashcard API:', error);
      throw new Error('Failed to generate flashcards from backend API');
    }
  }

  // Convert backend flashcards to frontend format
  private static convertBackendFlashcards(backendFlashcards: BackendFlashcard[]): Flashcard[] {
    return backendFlashcards.map((bf, index) => ({
      id: `flashcard_${index + 1}`,
      question: bf.question,
      answer: bf.answer,
    }));
  }

  // Main method to create and generate flashcard set
  static async saveFlashcardSetToDatabase(flashcardData: {
    title: string;
    subject?: string;
    sourceText: string;
    userId: string;
    cardCount?: number;
  }): Promise<SavedFlashcardSet> {
    try {
      // Step 1: Generate unique flashcard set ID
      const flashcardSetId = this.generateFlashcardSetId();

      // Step 2: Save initial submission to database
      const { data: submission, error: submissionError } = await supabase
        .from('flashcard_submissions')
        .insert({
          user_id: flashcardData.userId,
          flashcard_title: flashcardData.title,
          subject: flashcardData.subject,
          source_material: flashcardData.sourceText,
          flashcard_set_id: flashcardSetId,
          status: 'processing'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Step 3: Call backend API
      const backendRequest: BackendFlashcardRequest = {
        flashcard_set_id: flashcardSetId,
        note_content: flashcardData.sourceText,
        card_count: flashcardData.cardCount || 10
      };

      const backendResponse = await this.callBackendFlashcardAPI(backendRequest);

      // Step 4: Convert backend flashcards to frontend format
      const flashcards = this.convertBackendFlashcards(backendResponse.flashcards);

      // Step 5: Save generated flashcard set to database
      const { data: generatedFlashcardSet, error: flashcardSetError } = await supabase
        .from('generated_flashcard_sets')
        .insert({
          submission_id: submission.id,
          flashcard_set_id: flashcardSetId,
          user_id: flashcardData.userId,
          title: flashcardData.title,
          subject: flashcardData.subject,
          card_count: flashcards.length
        })
        .select()
        .single();

      if (flashcardSetError) throw flashcardSetError;

      // Step 6: Save flashcards
      for (let i = 0; i < backendResponse.flashcards.length; i++) {
        const backendFlashcard = backendResponse.flashcards[i];
        
        const { error: flashcardError } = await supabase
          .from('flashcards')
          .insert({
            flashcard_set_id: generatedFlashcardSet.id,
            backend_flashcard_set_id: flashcardSetId,
            question: backendFlashcard.question,
            answer: backendFlashcard.answer,
            card_order: i + 1
          });

        if (flashcardError) throw flashcardError;
      }

      // Step 7: Update submission status
      await supabase
        .from('flashcard_submissions')
        .update({ status: 'completed' })
        .eq('id', submission.id);

      // Return the complete saved flashcard set
      return {
        ...generatedFlashcardSet,
        flashcards
      };
    } catch (error) {
      console.error('Error in flashcard generation flow:', error);
      throw new Error('Failed to generate and save flashcard set');
    }
  }

  static async getUserFlashcardSets(userId: string): Promise<SavedFlashcardSet[]> {
    try {
      const { data, error } = await supabase
        .from('generated_flashcard_sets')
        .select(`
          *,
          flashcards(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(flashcardSet => ({
        ...flashcardSet,
        flashcards: flashcardSet.flashcards.map((f: { 
          id: string;
          question: string;
          answer: string;
        }) => ({
          id: f.id,
          question: f.question,
          answer: f.answer
        }))
      }));
    } catch (error) {
      console.error('Error fetching user flashcard sets:', error);
      throw new Error('Failed to fetch user flashcard sets');
    }
  }

  static async getFlashcardSetWithCards(flashcardSetId: string): Promise<SavedFlashcardSet | null> {
    try {
      const { data, error } = await supabase
        .from('generated_flashcard_sets')
        .select(`
          *,
          flashcards(*)
        `)
        .eq('id', flashcardSetId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Flashcard set not found
        }
        throw error;
      }

      return {
        ...data,
        flashcards: data.flashcards.map((f: { 
          id: string;
          question: string;
          answer: string;
        }) => ({
          id: f.id,
          question: f.question,
          answer: f.answer
        }))
      };
    } catch (error) {
      console.error('Error fetching flashcard set with cards:', error);
      throw new Error('Failed to fetch flashcard set');
    }
  }

  static async generateFlashcards(options: GenerateFlashcardOptions): Promise<Flashcard[]> {
    try {
      const savedFlashcardSet = await this.saveFlashcardSetToDatabase(options);
      return savedFlashcardSet.flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards');
    }
  }
}