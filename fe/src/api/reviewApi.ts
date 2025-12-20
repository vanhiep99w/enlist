import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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
  getDueReviews: async (token: string): Promise<ReviewCard[]> => {
    const response = await axios.get(`${API_BASE_URL}/reviews/due`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getDueCount: async (token: string): Promise<number> => {
    const response = await axios.get<{ count: number }>(`${API_BASE_URL}/reviews/due/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
  },

  submitReview: async (token: string, request: ReviewSubmitRequest): Promise<void> => {
    await axios.post(`${API_BASE_URL}/reviews/submit`, request, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getAllUserCards: async (token: string): Promise<ReviewCard[]> => {
    const response = await axios.get(`${API_BASE_URL}/reviews/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
