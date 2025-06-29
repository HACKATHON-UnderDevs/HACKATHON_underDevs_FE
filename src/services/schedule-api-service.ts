import { StudySet } from '@/supabase/supabase';

// This is a hypothetical type for the API response
type StudySetFromApi = Omit<StudySet, 'id' | 'user_id' | 'created_at' | 'note_id'>;

interface GenerateScheduleRequest {
  note_content: string;
  note_title: string;
  startDate: string;
  endDate: string;
}

export const ScheduleAPIService = {
  generateSchedule: async (request: GenerateScheduleRequest): Promise<StudySetFromApi[]> => {
    // This is a placeholder for the actual API endpoint.
    // In a real application, this would point to a serverless function
    // or a dedicated backend service. I am assuming the endpoint is at /api/generate-schedule
    const response = await fetch('https://ai.vibe88.tech/study-sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate schedule: ${errorText}`);
    }

    return response.json();
  },
}; 