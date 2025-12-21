import { authAxios } from './authApi';

export interface ReviewCard {
  id: number;
  sentenceId: number;
  userId: number;
  nextReviewDate: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmitRequest {
  sentenceId: number;
  quality: number;
}

export const reviewApi = {
  getDueReviews: async (): Promise<ReviewCard[]> => {
    const response = await authAxios.get('/reviews/due');
    return response.data;
  },

  getDueCount: async (): Promise<number> => {
    const response = await authAxios.get<{ count: number }>('/reviews/due/count');
    return response.data.count;
  },

  submitReview: async (request: ReviewSubmitRequest): Promise<void> => {
    await authAxios.post('/reviews/submit', request);
  },

  getAllUserCards: async (): Promise<ReviewCard[]> => {
    const response = await authAxios.get('/reviews/all');
    return response.data;
  },
};
